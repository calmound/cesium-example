import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExampleStore } from '@/store/example'
import { getExampleById } from '@/examples'
import { ExampleHeader } from '@/components/example/ExampleHeader'
import { FileTabs } from '@/components/example/FileTabs'
import { CodeEditor } from '@/components/example/CodeEditor'
import { PreviewFrame, type PreviewFrameHandle } from '@/components/example/PreviewFrame'
import { ConsolePanel, type LogEntry } from '@/components/example/ConsolePanel'
import { ExampleDescription } from '@/components/example/ExampleDescription'
import { Button } from '@/components/ui/button'
import type * as Monaco from 'monaco-editor'

let logIdCounter = 0

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    currentExample,
    activeFile,
    setCurrentExample,
    setActiveFile,
    updateFileContent,
    resetFileEdits,
    getMergedFiles,
  } = useExampleStore()

  const previewRef = useRef<PreviewFrameHandle>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [autoRun, setAutoRun] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Load example
  useEffect(() => {
    if (!id) return
    const example = getExampleById(id)
    if (!example) {
      setCurrentExample(null)
      return
    }
    setCurrentExample(example)
  }, [id, setCurrentExample])

  const handleRun = useCallback(() => {
    const files = getMergedFiles()
    previewRef.current?.run(files)
  }, [getMergedFiles])

  // Auto-run when example loads
  useEffect(() => {
    if (!currentExample) return
    setLogs([])
    handleRun()
  }, [currentExample?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeChange = useCallback(
    (value: string) => {
      if (!currentExample) return
      updateFileContent(currentExample.id, activeFile, value)

      if (autoRun) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = setTimeout(() => {
          handleRun()
        }, 800)
      }
    },
    [currentExample, activeFile, autoRun, updateFileContent, handleRun]
  )

  const handleReset = () => {
    if (!currentExample) return
    resetFileEdits(currentExample.id)
    setLogs([])
  }

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run()
  }

  const handleLog = useCallback((level: 'log' | 'warn' | 'info', message: string) => {
    setLogs((prev) => [...prev, { id: ++logIdCounter, level, message, timestamp: Date.now() }])
  }, [])

  const handleError = useCallback((message: string, stack?: string) => {
    setLogs((prev) => [
      ...prev,
      { id: ++logIdCounter, level: 'error' as const, message: stack ? `${message}\n${stack}` : message, timestamp: Date.now() },
    ])
  }, [])

  const handleRunStart = useCallback(() => setIsRunning(true), [])
  const handleRunSuccess = useCallback(() => setIsRunning(false), [])

  if (!id) return null

  if (!currentExample) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
        <span className="text-5xl font-bold">404</span>
        <p>案例 "{id}" 不存在</p>
        <Button onClick={() => navigate('/examples')}>返回列表</Button>
      </div>
    )
  }

  const mergedFiles = getMergedFiles()
  const fileNames = Object.keys(mergedFiles)
  const currentContent = mergedFiles[activeFile] ?? ''

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ExampleHeader
        title={currentExample.title}
        level={currentExample.level}
        autoRun={autoRun}
        isRunning={isRunning}
        onBack={() => navigate('/examples')}
        onRun={handleRun}
        onReset={handleReset}
        onToggleAutoRun={() => setAutoRun(!autoRun)}
        onFormat={handleFormat}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: editor */}
        <div className="flex w-[45%] shrink-0 flex-col overflow-hidden border-r border-border">
          <FileTabs
            files={fileNames}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
          />
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              filename={activeFile}
              value={currentContent}
              onChange={handleCodeChange}
              onEditorMount={(editor) => { editorRef.current = editor }}
            />
          </div>
        </div>

        {/* Right panel: preview + console + description */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <PreviewFrame
              ref={previewRef}
              onLog={handleLog}
              onError={handleError}
              onRunStart={handleRunStart}
              onRunSuccess={handleRunSuccess}
            />
          </div>
          <ConsolePanel logs={logs} onClear={() => setLogs([])} />
          <ExampleDescription example={currentExample} />
        </div>
      </div>
    </div>
  )
}
