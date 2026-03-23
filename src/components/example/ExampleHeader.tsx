import React from 'react'
import { ArrowLeft, Play, RotateCcw, WrapText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface ExampleHeaderProps {
  title: string
  level?: 'easy' | 'medium' | 'hard'
  autoRun: boolean
  isRunning: boolean
  onBack: () => void
  onRun: () => void
  onReset: () => void
  onToggleAutoRun: () => void
  onFormat: () => void
}

const LEVEL_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
}
const LEVEL_LABELS: Record<string, string> = { easy: '入门', medium: '中级', hard: '高级' }

export const ExampleHeader: React.FC<ExampleHeaderProps> = ({
  title,
  level,
  autoRun,
  isRunning,
  onBack,
  onRun,
  onReset,
  onToggleAutoRun,
  onFormat,
}) => {
  return (
    <TooltipProvider delayDuration={400}>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
        {/* Back */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>返回列表</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        {/* Title + level */}
        <span className="flex-1 truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        {level && (
          <Badge variant={LEVEL_VARIANT[level]}>{LEVEL_LABELS[level]}</Badge>
        )}

        <Separator orientation="vertical" className="h-5" />

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onFormat} className="text-muted-foreground hover:text-foreground">
              <WrapText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>格式化代码</TooltipContent>
        </Tooltip>

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={autoRun}
            onChange={onToggleAutoRun}
            className="cursor-pointer accent-primary"
          />
          自动运行
        </label>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onReset} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重置代码</TooltipContent>
        </Tooltip>

        <Button
          onClick={onRun}
          disabled={isRunning}
          size="sm"
          className="gap-1.5 min-w-[80px]"
        >
          {isRunning ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />运行中</>
          ) : (
            <><Play className="h-3.5 w-3.5" />运行</>
          )}
        </Button>
      </header>
    </TooltipProvider>
  )
}
