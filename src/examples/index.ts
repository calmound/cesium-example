import type { ExampleMeta } from './types'
import { basicHelloWorld } from './basic-hello-world'
import {
  // 基础操作
  viewerInit,
  cameraControl,
  coordinateSystem,
  mouseEvents,
  sceneMode,
  // 影像服务
  xyzTiles,
  wmsService,
  wmtsService,
  tiandituLayer,
  imagery4490,
  dynamicImagery,
  // 点标注
  pixelPoint,
  billboardIcon,
  labelText,
  divMarker,
  panoramaPoint,
  clusterPoints,
  draggablePoint,
  // 线与路径
  polylineBasic,
  curvedLine,
  pipeLine,
  migrationEffect,
  flightPath,
  roamingRoute,
  roadNetwork,
  // 面与几何体
  polygonFace,
  rectangleCircle,
  wallGeometry,
  box3D,
  sphere3D,
  militarySymbol,
  // 矢量数据
  geojsonLoader,
  kmlLoader,
  czmlAnimation,
  wfsQuery,
  routePlanning,
  primitiveVector,
  // 地形分析
  terrainBasic,
  terrainExcavation,
  terrainFlattening,
  contourLine,
  slopeAnalysis,
  floodAnalysis,
  undergroundMode,
  // 3D Tiles
  tilesBasic,
  tilesOffset,
  tilesStyle,
  tilesCustomShader,
  tilesFlattening,
  // 空间分析
  distanceMeasure,
  viewshedAnalysis,
  sunshineAnalysis,
  bufferAnalysis,
  volumeCalculation,
  // 水域特效
  waterSurface,
  floodSimulation,
  dynamicRiver,
  waterGate,
  // 视频融合
  videoMaterial,
  video2DProjection,
  video3DProjection,
  videoEditor,
  // 场景与粒子
  weatherEffects,
  skyboxScene,
  particleEffects,
  pointLight,
  volumeCloud,
  // 材质与Shader
  radarScan,
  diffusionPoint,
  waterRipple,
  flowingLine,
  buildingFlicker,
  customShaderIntro,
  // 数据可视化
  heatmap3d,
  windField,
  hexagonHeatmap,
  isocontour,
  oceanCurrent,
  // 雷达与卫星
  radarCoverage,
  satelliteTrack,
  uavTrack,
  coneSensor,
  // 综合应用
  smartPark,
  smartTraffic,
  typhoonTrack,
  cityRoaming,
  cesiumThreeIntegration,
} from './catalog'

const registry: ExampleMeta[] = [
  basicHelloWorld,
  // 基础操作
  viewerInit,
  cameraControl,
  coordinateSystem,
  mouseEvents,
  sceneMode,
  // 影像服务
  xyzTiles,
  wmsService,
  wmtsService,
  tiandituLayer,
  imagery4490,
  dynamicImagery,
  // 点标注
  pixelPoint,
  billboardIcon,
  labelText,
  divMarker,
  panoramaPoint,
  clusterPoints,
  draggablePoint,
  // 线与路径
  polylineBasic,
  curvedLine,
  pipeLine,
  migrationEffect,
  flightPath,
  roamingRoute,
  roadNetwork,
  // 面与几何体
  polygonFace,
  rectangleCircle,
  wallGeometry,
  box3D,
  sphere3D,
  militarySymbol,
  // 矢量数据
  geojsonLoader,
  kmlLoader,
  czmlAnimation,
  wfsQuery,
  routePlanning,
  primitiveVector,
  // 地形分析
  terrainBasic,
  terrainExcavation,
  terrainFlattening,
  contourLine,
  slopeAnalysis,
  floodAnalysis,
  undergroundMode,
  // 3D Tiles
  tilesBasic,
  tilesOffset,
  tilesStyle,
  tilesCustomShader,
  tilesFlattening,
  // 空间分析
  distanceMeasure,
  viewshedAnalysis,
  sunshineAnalysis,
  bufferAnalysis,
  volumeCalculation,
  // 水域特效
  waterSurface,
  floodSimulation,
  dynamicRiver,
  waterGate,
  // 视频融合
  videoMaterial,
  video2DProjection,
  video3DProjection,
  videoEditor,
  // 场景与粒子
  weatherEffects,
  skyboxScene,
  particleEffects,
  pointLight,
  volumeCloud,
  // 材质与Shader
  radarScan,
  diffusionPoint,
  waterRipple,
  flowingLine,
  buildingFlicker,
  customShaderIntro,
  // 数据可视化
  heatmap3d,
  windField,
  hexagonHeatmap,
  isocontour,
  oceanCurrent,
  // 雷达与卫星
  radarCoverage,
  satelliteTrack,
  uavTrack,
  coneSensor,
  // 综合应用
  smartPark,
  smartTraffic,
  typhoonTrack,
  cityRoaming,
  cesiumThreeIntegration,
]

export function registerExample(example: ExampleMeta) {
  registry.push(example)
}

export function getAllExamples(): ExampleMeta[] {
  return registry
}

export function getExampleById(id: string): ExampleMeta | undefined {
  return registry.find((e) => e.id === id)
}

export function getExamplesByCategory(category: string): ExampleMeta[] {
  if (category === '全部') return registry
  return registry.filter((e) => e.category === category)
}
