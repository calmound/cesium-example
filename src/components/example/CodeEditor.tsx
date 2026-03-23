import React, { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'

interface CodeEditorProps {
  filename: string
  value: string
  onChange: (value: string) => void
  onEditorMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
}

function getLanguage(filename: string): string {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript'
  if (filename.endsWith('.css')) return 'css'
  if (filename.endsWith('.json')) return 'json'
  if (filename.endsWith('.html')) return 'html'
  return 'plaintext'
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filename,
  value,
  onChange,
  onEditorMount,
}) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    // Configure TypeScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      allowJs: true,
    })
    onEditorMount?.(editor)
  }

  return (
    <MonacoEditor
      height="100%"
      language={getLanguage(filename)}
      value={value}
      theme="vs-dark"
      onChange={(val) => onChange(val ?? '')}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  )
}
