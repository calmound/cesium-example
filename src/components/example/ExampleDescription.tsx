import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ExampleMeta } from '@/examples/types'

interface ExampleDescriptionProps {
  example: ExampleMeta
}

export const ExampleDescription: React.FC<ExampleDescriptionProps> = ({ example }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="shrink-0 border-t border-border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors"
      >
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="font-medium">{example.title}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {example.tags.map((t) => `#${t}`).join(' ')}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
          <p>{example.description}</p>

          {example.guide?.features && example.guide.features.length > 0 && (
            <div>
              <p className="mb-1.5 font-medium text-foreground">功能特性</p>
              <ul className="list-disc space-y-1 pl-4">
                {example.guide.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {example.guide?.points && example.guide.points.length > 0 && (
            <div>
              <p className="mb-1.5 font-medium text-foreground">学习要点</p>
              <ul className="list-disc space-y-1 pl-4">
                {example.guide.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
