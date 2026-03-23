import React from 'react'

interface FileExplorerProps {
  files: string[]
  activeFile: string
  onSelectFile: (filename: string) => void
}

const FILE_ICONS: Record<string, string> = {
  '.ts': '📄',
  '.css': '🎨',
  '.json': '{}',
  '.html': '🌐',
}

function getIcon(filename: string): string {
  const ext = filename.match(/\.[^.]+$/)?.[0] ?? ''
  return FILE_ICONS[ext] ?? '📄'
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onSelectFile }) => {
  return (
    <div style={{
      background: '#0f3460',
      borderBottom: '1px solid #2a2a4a',
      padding: '8px 0',
    }}>
      <div style={{ padding: '4px 12px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
        文件
      </div>
      {files.map((f) => (
        <div
          key={f}
          onClick={() => onSelectFile(f)}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeFile === f ? '#1a4a7a' : 'transparent',
            color: activeFile === f ? '#64b5f6' : '#c0c0c0',
            borderLeft: activeFile === f ? '2px solid #64b5f6' : '2px solid transparent',
          }}
        >
          <span>{getIcon(f)}</span>
          <span>{f}</span>
        </div>
      ))}
    </div>
  )
}
