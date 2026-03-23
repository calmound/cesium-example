import React, { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react'
import type { IframeToMainMessage } from '@/runtime/sandbox/message'

export interface PreviewFrameHandle {
  run: (files: Record<string, string>, cesiumToken?: string) => void
}

interface PreviewFrameProps {
  onLog: (level: 'log' | 'warn' | 'info', message: string) => void
  onError: (message: string, stack?: string) => void
  onRunStart: () => void
  onRunSuccess: () => void
}

export const PreviewFrame = forwardRef<PreviewFrameHandle, PreviewFrameProps>(
  ({ onLog, onError, onRunStart, onRunSuccess }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const isReadyRef = useRef(false)
    const pendingFilesRef = useRef<{ files: Record<string, string>; token?: string } | null>(null)

    const sendRun = useCallback((files: Record<string, string>, cesiumToken?: string) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'RUN_CODE', payload: { files, cesiumToken } },
        '*'
      )
    }, [])

    useImperativeHandle(ref, () => ({
      run: (files, cesiumToken) => {
        if (isReadyRef.current) {
          sendRun(files, cesiumToken)
        } else {
          pendingFilesRef.current = { files, token: cesiumToken }
        }
      },
    }))

    useEffect(() => {
      const handler = (event: MessageEvent) => {
        if (event.source !== iframeRef.current?.contentWindow) return
        const msg = event.data as IframeToMainMessage
        switch (msg.type) {
          case 'READY':
            isReadyRef.current = true
            if (pendingFilesRef.current) {
              sendRun(pendingFilesRef.current.files, pendingFilesRef.current.token)
              pendingFilesRef.current = null
            }
            break
          case 'RUN_START':
            onRunStart()
            break
          case 'RUN_SUCCESS':
            onRunSuccess()
            break
          case 'LOG':
            onLog(msg.level, msg.message)
            break
          case 'ERROR':
            onError(msg.message, msg.stack)
            break
        }
      }

      window.addEventListener('message', handler)
      return () => window.removeEventListener('message', handler)
    }, [sendRun, onLog, onError, onRunStart, onRunSuccess])

    // Reset ready state when iframe reloads
    const handleIframeLoad = () => {
      isReadyRef.current = false
    }

    return (
      <iframe
        ref={iframeRef}
        src="/sandbox/iframe.html"
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#000',
        }}
        sandbox="allow-scripts allow-same-origin"
        title="Cesium Preview"
      />
    )
  }
)

PreviewFrame.displayName = 'PreviewFrame'
