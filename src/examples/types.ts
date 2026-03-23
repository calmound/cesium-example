export interface ExampleMeta {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  level: 'easy' | 'medium' | 'hard'
  status?: 'done' | 'pending'
  cover?: string
  files: { [filename: string]: string }
  guide?: { features: string[]; points: string[] }
}

export const CATEGORIES = [
  '全部',
  '基础操作',
  '影像服务',
  '点标注',
  '线与路径',
  '面与几何体',
  '矢量数据',
  '地形分析',
  '3D Tiles',
  '空间分析',
  '水域特效',
  '视频融合',
  '场景与粒子',
  '材质与Shader',
  '数据可视化',
  '雷达与卫星',
  '综合应用',
] as const

export type Category = (typeof CATEGORIES)[number]
