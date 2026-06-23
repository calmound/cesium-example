import type { ExampleMeta } from './types'

// Basic - 基础操作
import { meta as viewerInit } from './cases/basic/viewer-init'
import { meta as cameraControl } from './cases/basic/camera-control'
import { meta as coordinateSystem } from './cases/basic/coordinate-system'
import { meta as mouseEvents } from './cases/basic/mouse-events'
import { meta as sceneMode } from './cases/basic/scene-mode'

// Imagery - 影像服务
import { meta as xyzTiles } from './cases/imagery/xyz-tiles'
import { meta as wmsService } from './cases/imagery/wms-service'
import { meta as wmtsService } from './cases/imagery/wmts-service'
import { meta as tiandituLayer } from './cases/imagery/tianditu-layer'
import { meta as imagery4490 } from './cases/imagery/imagery-4490'
import { meta as dynamicImagery } from './cases/imagery/dynamic-imagery'

// Annotation - 点标注
import { meta as pixelPoint } from './cases/annotation/pixel-point'
import { meta as billboardIcon } from './cases/annotation/billboard-icon'
import { meta as labelText } from './cases/annotation/label-text'
import { meta as divMarker } from './cases/annotation/div-marker'
import { meta as panoramaPoint } from './cases/annotation/panorama-point'
import { meta as clusterPoints } from './cases/annotation/cluster-points'
import { meta as draggablePoint } from './cases/annotation/draggable-point'

// Polyline - 线与路径
import { meta as polylineBasic } from './cases/polyline/polyline-basic'
import { meta as curvedLine } from './cases/polyline/curved-line'
import { meta as pipeLine } from './cases/polyline/pipe-line'
import { meta as migrationEffect } from './cases/polyline/migration-effect'
import { meta as flightPath } from './cases/polyline/flight-path'
import { meta as roamingRoute } from './cases/polyline/roaming-route'
import { meta as roadNetwork } from './cases/polyline/road-network'

// Geometry - 面与几何体
import { meta as polygonFace } from './cases/geometry/polygon-face'
import { meta as rectangleCircle } from './cases/geometry/rectangle-circle'
import { meta as wallGeometry } from './cases/geometry/wall-geometry'
import { meta as box3D } from './cases/geometry/box-3d'
import { meta as sphere3D } from './cases/geometry/sphere-3d'

// Vector - 矢量数据
import { meta as geojsonLoader } from './cases/vector/geojson-loader'
import { meta as kmlLoader } from './cases/vector/kml-loader'
import { meta as czmlAnimation } from './cases/vector/czml-animation'
import { meta as wfsQuery } from './cases/vector/wfs-query'
import { meta as routePlanning } from './cases/vector/route-planning'
import { meta as primitiveVector } from './cases/vector/primitive-vector'

// Terrain - 地形分析
import { meta as terrainBasic } from './cases/terrain/terrain-basic'
import { meta as terrainExcavation } from './cases/terrain/terrain-excavation'
import { meta as terrainFlattening } from './cases/terrain/terrain-flattening'
import { meta as contourLine } from './cases/terrain/contour-line'
import { meta as slopeAnalysis } from './cases/terrain/slope-analysis'
import { meta as floodAnalysis } from './cases/terrain/flood-analysis'
import { meta as undergroundMode } from './cases/terrain/underground-mode'

// Tiles3D - 3D Tiles
import { meta as tilesBasic } from './cases/tiles3d/tiles-basic'
import { meta as tilesOffset } from './cases/tiles3d/tiles-offset'
import { meta as tilesStyle } from './cases/tiles3d/tiles-style'
import { meta as tilesCustomShader } from './cases/tiles3d/tiles-custom-shader'
import { meta as tilesFlattening } from './cases/tiles3d/tiles-flattening'

// Analysis - 空间分析
import { meta as distanceMeasure } from './cases/analysis/distance-measure'
import { meta as viewshedAnalysis } from './cases/analysis/viewshed-analysis'
import { meta as sunshineAnalysis } from './cases/analysis/sunshine-analysis'
import { meta as bufferAnalysis } from './cases/analysis/buffer-analysis'
import { meta as volumeCalculation } from './cases/analysis/volume-calculation'

// Video - 视频融合
import { meta as videoMaterial } from './cases/video/video-material'
import { meta as video2DProjection } from './cases/video/video-2d-projection'
import { meta as video3DProjection } from './cases/video/video-3d-projection'
import { meta as videoEditor } from './cases/video/video-editor'

// Particle - 场景与粒子
import { meta as rainEffect } from './cases/particle/rain-effect'
import { meta as snowEffect } from './cases/particle/snow-effect'
import { meta as fogEffect } from './cases/particle/fog-effect'
import { meta as skyboxScene } from './cases/particle/skybox-scene'
import { meta as particleEffects } from './cases/particle/particle-effects'
import { meta as pointLight } from './cases/particle/point-light'
import { meta as volumeCloud } from './cases/particle/volume-cloud'

// Shader - 材质与Shader
import { meta as radarScan } from './cases/shader/radar-scan'
import { meta as diffusionPoint } from './cases/shader/diffusion-point'
import { meta as waterRipple } from './cases/shader/water-ripple'
import { meta as flowingLine } from './cases/shader/flowing-line'
import { meta as buildingFlicker } from './cases/shader/building-flicker'
import { meta as customShaderIntro } from './cases/shader/custom-shader-intro'

// Visualization - 数据可视化
import { meta as heatmap3d } from './cases/visualization/heatmap-3d'
import { meta as windField } from './cases/visualization/wind-field'
import { meta as hexagonHeatmap } from './cases/visualization/hexagon-heatmap'
import { meta as isocontour } from './cases/visualization/isocontour'
import { meta as oceanCurrent } from './cases/visualization/ocean-current'

// Comprehensive - 综合应用
import { meta as smartPark } from './cases/comprehensive/smart-park'
import { meta as smartTraffic } from './cases/comprehensive/smart-traffic'
import { meta as typhoonTrack } from './cases/comprehensive/typhoon-track'
import { meta as cityRoaming } from './cases/comprehensive/city-roaming'
import { meta as cesiumThreeIntegration } from './cases/comprehensive/cesium-three-integration'
import { meta as droneAerial } from './cases/comprehensive/drone-aerial'
import { meta as massiveDronePrimitive } from './cases/comprehensive/massive-drone-primitive'

const registry: ExampleMeta[] = [
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
  // 视频融合
  videoMaterial,
  video2DProjection,
  video3DProjection,
  videoEditor,
  // 场景与粒子
  rainEffect,
  snowEffect,
  fogEffect,
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
  // 综合应用
  smartPark,
  smartTraffic,
  typhoonTrack,
  cityRoaming,
  cesiumThreeIntegration,
  droneAerial,
  massiveDronePrimitive,
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

export type { ExampleMeta } from './types'
export { CATEGORIES } from './types'
export type { Category } from './types'
