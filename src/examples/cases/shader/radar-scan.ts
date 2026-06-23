import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'radar-scan',
  title: '雷达扫描材质',
  category: '材质与Shader',
  description: '使用扇形扫描区、旋转扫线和扩散圆环组合出可见的雷达效果，演示 CallbackProperty 驱动的动态扫描面。',
  tags: ['雷达', '扫描', '动态'],
  level: 'medium',
  files: {
    'main.ts': `// 雷达扫描材质示例
// 使用扇形扫描区 + 扫描线 + 扩散圆环组合出可见雷达效果

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

viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#07111f')
viewer.scene.skyAtmosphere.hueShift = -0.18
viewer.scene.skyAtmosphere.saturationShift = -0.35
viewer.scene.skyAtmosphere.brightnessShift = -0.2
viewer.scene.fog.enabled = false

const radarCenter = Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 18)
const radarFrame = Cesium.Transforms.eastNorthUpToFixedFrame(radarCenter)
const radarRange = 1200
const sweepWidth = Cesium.Math.toRadians(34)
const sweepSegments = 40

const radarState = {
  angle: Cesium.Math.toRadians(-50),
  pulse: 0,
}

function localToWorld(x, y, z = 0) {
  return Cesium.Matrix4.multiplyByPoint(
    radarFrame,
    Cesium.Cartesian3.fromElements(x, y, z),
    new Cesium.Cartesian3()
  )
}

function buildSweepPositions() {
  const positions = [radarCenter]
  const startAngle = radarState.angle - sweepWidth * 0.5

  for (let i = 0; i <= sweepSegments; i++) {
    const theta = startAngle + (sweepWidth * i) / sweepSegments
    const x = Math.cos(theta) * radarRange
    const y = Math.sin(theta) * radarRange
    positions.push(localToWorld(x, y))
  }

  return new Cesium.PolygonHierarchy(positions)
}

viewer.entities.add({
  position: radarCenter,
  ellipse: {
    semiMajorAxis: radarRange,
    semiMinorAxis: radarRange,
    height: 18,
    material: Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.05),
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#66ffcc').withAlpha(0.58),
    outlineWidth: 2,
  },
})

viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.CallbackProperty(buildSweepPositions, false),
    material: new Cesium.ColorMaterialProperty(
      Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.18)
    ),
    perPositionHeight: true,
    outline: false,
  },
})

viewer.entities.add({
  position: radarCenter,
  polyline: {
    positions: new Cesium.CallbackProperty(() => {
      const head = localToWorld(
        Math.cos(radarState.angle) * radarRange,
        Math.sin(radarState.angle) * radarRange
      )
      return [radarCenter, head]
    }, false),
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.22,
      color: Cesium.Color.fromCssColorString('#66ffcc').withAlpha(0.95),
    }),
  },
})

viewer.entities.add({
  position: radarCenter,
  ellipse: {
    semiMajorAxis: new Cesium.CallbackProperty(
      () => 220 + radarState.pulse * (radarRange - 220),
      false
    ),
    semiMinorAxis: new Cesium.CallbackProperty(
      () => 220 + radarState.pulse * (radarRange - 220),
      false
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        const alpha = 0.22 * (1.0 - radarState.pulse)
        return Cesium.Color.fromCssColorString('#66ffcc').withAlpha(alpha)
      }, false)
    ),
    height: 19,
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#66ffcc').withAlpha(0.52),
    outlineWidth: 1,
  },
})

viewer.entities.add({
  position: radarCenter,
  point: {
    pixelSize: 12,
    color: Cesium.Color.fromCssColorString('#f8fafc'),
    outlineColor: Cesium.Color.fromCssColorString('#00ff88'),
    outlineWidth: 3,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  label: {
    text: '雷达中心\\n扫描半径 1.2km',
    font: '600 13px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.82),
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -24),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})

viewer.scene.preUpdate.addEventListener(() => {
  radarState.angle += Cesium.Math.toRadians(1.65)
  if (radarState.angle > Cesium.Math.TWO_PI) {
    radarState.angle -= Cesium.Math.TWO_PI
  }

  radarState.pulse += 0.015
  if (radarState.pulse > 1) {
    radarState.pulse = 0
  }
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 2600),
  orientation: {
    heading: Cesium.Math.toRadians(8),
    pitch: Cesium.Math.toRadians(-42),
    roll: 0,
  },
  duration: 2,
  complete: () => console.log('📡 雷达扫描已启动'),
})

console.log('💡 雷达扫描：扇形扫描区 + 扫描线 + 扩散圆环')
console.log('🎯 可调整 radarRange 和 sweepWidth 改变探测范围与扇面宽度')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['扇形 PolygonHierarchy 扫描区', 'CallbackProperty 驱动扫掠角度', '扩散圆环半径循环变化', '扫描线突出方向感'],
    points: ['用局部 ENU 坐标生成扇形边界更稳定', '动态半径和透明度一起变化会更像真实雷达', '扇区 + 扫描线 + 外圈组合比单独整圆更容易读懂'],
  },
}
