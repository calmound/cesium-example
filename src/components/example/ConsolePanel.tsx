import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LogEntry {
  id: number
  level: 'log' | 'warn' | 'info' | 'error'
  message: string
  timestamp: number
}

interface ConsolePanelProps {
  logs: LogEntry[]
  onClear: () => void
}

const LEVEL_CLASS: Record<string, string> = {
  log: 'text-foreground',
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400 border-l-2 border-red-500 pl-2',
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="flex h-48 shrink-0 flex-col border-t border-border bg-background">
      <div className="flex h-8 shrink-0 items-center border-b border-border px-3">
        <span className="flex-1 text-xs text-muted-foreground">控制台</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2 text-xs text-muted-foreground">
          清除
        </Button>
      </div>
      <div className="flex-1 overflow-auto px-0 py-1 font-mono">
        {logs.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground/50">运行代码后，控制台输出将显示在这里</p>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className={cn('px-3 py-0.5 text-xs leading-5 break-all', LEVEL_CLASS[entry.level])}>
              <span className="mr-2 text-muted-foreground/50">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              {entry.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
