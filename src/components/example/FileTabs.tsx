import React from 'react'
import { cn } from '@/lib/utils'

interface FileTabsProps {
  files: string[]
  activeFile: string
  onSelectFile: (filename: string) => void
}

const FILE_ICONS: Record<string, string> = {
  '.ts': '⬛',
  '.tsx': '⚛',
  '.css': '🎨',
  '.json': '{}',
  '.html': '🌐',
}

function getIcon(filename: string): string {
  const ext = filename.match(/\.[^.]+$/)?.[0] ?? ''
  return FILE_ICONS[ext] ?? '📄'
}

export const FileTabs: React.FC<FileTabsProps> = ({ files, activeFile, onSelectFile }) => {
  return (
    <div className="flex h-9 shrink-0 items-end gap-0 overflow-x-auto border-b border-border bg-card px-2 scrollbar-none">
      {files.map((f) => (
        <button
          key={f}
          onClick={() => onSelectFile(f)}
          className={cn(
            'relative flex h-9 items-center gap-1.5 border-b-2 px-3 text-xs whitespace-nowrap transition-colors',
            activeFile === f
              ? 'border-primary text-foreground font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          <span className="text-[10px]">{getIcon(f)}</span>
          <span>{f}</span>
        </button>
      ))}
    </div>
  )
}
