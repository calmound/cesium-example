import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useExampleListStore } from '@/store/example'
import { getAllExamples } from '@/examples'
import { CATEGORIES } from '@/examples/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const LEVEL_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
}
const LEVEL_LABELS: Record<string, string> = { easy: '入门', medium: '中级', hard: '高级' }

// category id -> DOM id
function catId(cat: string) {
  return `cat-${cat}`
}

export const ListPage: React.FC = () => {
  const { searchKeyword, setSearchKeyword } = useExampleListStore()
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[1])
  const contentRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const allExamples = getAllExamples()
  const nonAllCategories = CATEGORIES.filter((c) => c !== '全部')

  // Group examples by category, filtered by search
  const grouped = nonAllCategories
    .map((cat) => ({
      cat,
      items: allExamples.filter((e) => {
        if (e.category !== cat) return false
        if (!searchKeyword) return true
        return (
          e.title.includes(searchKeyword) ||
          e.description.includes(searchKeyword) ||
          e.tags.some((t) => t.includes(searchKeyword))
        )
      }),
    }))
    .filter((g) => g.items.length > 0)

  // Scroll to section on sidebar click
  function scrollToSection(cat: string) {
    const el = document.getElementById(catId(cat))
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
    }
    setActiveCategory(cat)
  }

  // IntersectionObserver to update active category on scroll
  useEffect(() => {
    observerRef.current?.disconnect()
    const content = contentRef.current
    if (!content) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const id = visible[0].target.id
          setActiveCategory(id.replace('cat-', ''))
        }
      },
      { root: content, threshold: 0.15 }
    )

    nonAllCategories.forEach((cat) => {
      const el = document.getElementById(catId(cat))
      if (el) observerRef.current!.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [searchKeyword]) // re-observe when search changes (sections may appear/disappear)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">CesiumJS 案例演示</h1>
        <p className="mt-1 text-sm text-muted-foreground">可在线编辑、实时预览的 CesiumJS 示例集合</p>
        <div className="relative mt-3 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索案例..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — anchor links */}
        <nav className="w-44 shrink-0 overflow-y-auto border-r border-border bg-card py-2">
          {nonAllCategories.map((cat) => {
            const hasItems = grouped.some((g) => g.cat === cat)
            return (
              <button
                key={cat}
                onClick={() => scrollToSection(cat)}
                disabled={!hasItems}
                className={cn(
                  'flex w-full items-center border-l-2 px-4 py-2 text-sm transition-colors',
                  activeCategory === cat && hasItems
                    ? 'border-primary bg-accent text-foreground font-medium'
                    : hasItems
                      ? 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      : 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                )}
              >
                {cat}
              </button>
            )
          })}
        </nav>

        {/* Content — grouped by category */}
        <div ref={contentRef} className="flex-1 overflow-auto">
          {grouped.length === 0 ? (
            <div className="mt-16 text-center text-sm text-muted-foreground">
              没有符合条件的案例
            </div>
          ) : (
            <div className="space-y-8 p-5">
              {grouped.map(({ cat, items }) => (
                <section key={cat} id={catId(cat)}>
                  {/* Category header */}
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-base font-semibold text-foreground">{cat}</h2>
                    <span className="text-xs text-muted-foreground">
                      {items.filter(e => e.status !== 'pending').length}/{items.length} 已实现
                    </span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                    {items.map((example) => {
                      const isPending = example.status === 'pending'
                      return (
                      <Link key={example.id} to={`/examples/${example.id}`} className="group block no-underline">
                        <div className={cn(
                          'overflow-hidden rounded-lg border bg-card transition-colors',
                          isPending
                            ? 'border-border/50 opacity-60 group-hover:opacity-80'
                            : 'border-border group-hover:border-primary/60'
                        )}>
                          <div className="relative flex h-32 items-center justify-center bg-muted text-4xl">
                            🌍
                            {isPending && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                                <span className="rounded-full bg-muted-foreground/20 px-3 py-1 text-xs text-muted-foreground">
                                  待开发
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold text-foreground leading-snug">{example.title}</h3>
                              {example.level && (
                                <Badge variant={isPending ? undefined : LEVEL_VARIANT[example.level]} className="shrink-0">
                                  {LEVEL_LABELS[example.level]}
                                </Badge>
                              )}
                            </div>
                            <p className="mb-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{example.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {example.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )})}

                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
