import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'sphere-3d',
  title: '球、半球与椭球',
  category: '面与几何体',
  description: '绘制球体、半球（雷达探测范围）、椭球等弧面几何体，实现多种尺寸与颜色的批量渲染。',
  tags: ['球体', '半球', '椭球'],
  level: 'easy',
  files: {
    'main.ts': `// 球、半球与椭球示例
// 演示 EllipsoidGraphics 绘制球体和椭球

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

viewer.scene.globe.depthTestAgainstTerrain = false
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000

function addAnchor(position, color, text) {
  viewer.entities.add({
    position,
    point: {
      pixelSize: 10,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text,
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.85),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -22),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
}

// ── 1. 球体 ───────────────────────────────────────────────
const spherePosition = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 120)
viewer.entities.add({
  name: '球体',
  position: spherePosition,
  ellipsoid: {
    radii: new Cesium.Cartesian3(140, 140, 140),
    material: Cesium.Color.fromCssColorString('#4da3ff').withAlpha(0.45),
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#bfe1ff'),
    outlineWidth: 2,
    stackPartitions: 48,
    slicePartitions: 48,
  },
})
addAnchor(spherePosition, Cesium.Color.fromCssColorString('#4da3ff'), '球体')

// ── 2. 椭球体 ──────────────────────────────────────────────
const ellipsoidPosition = Cesium.Cartesian3.fromDegrees(116.43, 39.88, 90)
viewer.entities.add({
  name: '椭球体',
  position: ellipsoidPosition,
  ellipsoid: {
    radii: new Cesium.Cartesian3(180, 120, 85),
    material: Cesium.Color.fromCssColorString('#5fe3b8').withAlpha(0.42),
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#b8ffe7'),
    outlineWidth: 2,
    stackPartitions: 48,
    slicePartitions: 48,
  },
})
addAnchor(ellipsoidPosition, Cesium.Color.fromCssColorString('#5fe3b8'), '椭球体')

// ── 3. 雷达探测范围（半球）──────────────────────────────────
const hemispherePosition = Cesium.Cartesian3.fromDegrees(116.47, 39.91, 60)
viewer.entities.add({
  name: '雷达范围-半球',
  position: hemispherePosition,
  ellipsoid: {
    radii: new Cesium.Cartesian3(320, 320, 180),
    material: Cesium.Color.fromCssColorString('#ff6b6b').withAlpha(0.24),
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#ff9e9e'),
    outlineWidth: 2,
    stackPartitions: 64,
    slicePartitions: 64,
    minimumCone: 0,
    maximumCone: Cesium.Math.PI_OVER_TWO,
  },
})
addAnchor(hemispherePosition, Cesium.Color.fromCssColorString('#ff6b6b'), '朝上半球')

// ── 4. 扇形探测区域 ───────────────────────────────────────
const sectorPosition = Cesium.Cartesian3.fromDegrees(116.51, 39.89, 50)
viewer.entities.add({
  name: '扇形探测',
  position: sectorPosition,
  ellipsoid: {
    radii: new Cesium.Cartesian3(260, 260, 140),
    minimumClock: Cesium.Math.toRadians(-45),
    maximumClock: Cesium.Math.toRadians(45),
    minimumCone: Cesium.Math.toRadians(45),
    maximumCone: Cesium.Math.toRadians(90),
    material: Cesium.Color.fromCssColorString('#ffb347').withAlpha(0.35),
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#ffd08a'),
    outlineWidth: 2,
    stackPartitions: 64,
    slicePartitions: 64,
  },
})
addAnchor(sectorPosition, Cesium.Color.fromCssColorString('#ffb347'), '扇形探测')

// ── 5. 同心球体（探测范围圈层）─────────────────────────────
;[80, 160, 240, 320].forEach((radius, index) => {
  viewer.entities.add({
    name: '范围圈层-' + radius,
    position: Cesium.Cartesian3.fromDegrees(116.42, 39.93, 10),
    ellipsoid: {
      radii: new Cesium.Cartesian3(radius, radius, radius * 0.5),
      material: Cesium.Color.fromAlpha(
        Cesium.Color.fromCssColorString('#ff6600'),
        0.22 - index * 0.035
      ),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#ff6600'),
      outlineWidth: 1,
      stackPartitions: 32,
      slicePartitions: 32,
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.46, 39.9, 5200),
  orientation: {
    heading: Cesium.Math.toRadians(-18),
    pitch: Cesium.Math.toRadians(-24),
    roll: 0,
  },
  duration: 2,
  complete: () => console.log('🔵 球体示例已加载'),
})

console.log('💡 EllipsoidGraphics 用于绘制球体/椭球')
console.log('🌓 雷达探测范围可用半球或扇形表示')
console.log('🔗 同心球体可用于表示距离圈层或强度等级')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['EllipsoidGraphics 椭球/球体', '半球与扇形椭球裁剪', '同心圈层范围展示', '球体作为雷达探测范围'],
    points: ['EllipsoidGraphics 三轴半径控制形状', '半球通过 minimumCone/maximumCone 裁剪', 'minimumClock/maximumClock 可限制水平角范围'],
  },
}
