// Messages sent from main page → iframe
export type MainToIframeMessage =
  | { type: 'RUN_CODE'; payload: { files: Record<string, string>; cesiumToken?: string } }

// Messages sent from iframe → main page
export type IframeToMainMessage =
  | { type: 'READY' }
  | { type: 'RUN_START' }
  | { type: 'RUN_SUCCESS' }
  | { type: 'LOG'; level: 'log' | 'warn' | 'info'; message: string }
  | { type: 'ERROR'; message: string; stack?: string }
