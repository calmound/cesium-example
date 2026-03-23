import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'cone-sensor',
  title: '圆锥体传感器',
  category: '雷达与卫星',
  description: '渲染卫星/无人机搭载的传感器观测锥体：固定竖直朝上、任意方向指向，计算地面覆盖范围椭圆。',
  tags: ['圆锥体', '传感器', '覆盖范围'],
  level: 'medium',
  files: {
    'main.ts': `// 圆锥体传感器示例
// 渲染卫星/无人机搭载的传感器观测锥体：固定竖直朝上、任意方向指向，计算地面覆盖范围椭圆

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

// ── 1. 卫星位置 ───────────────────────────────────────────────
const satellitePosition = Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 500000)

// 添加卫星标记
viewer.entities.add({
  position: satellitePosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '卫星传感器',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// ── 2. 固定朝上的圆锥体 ─────────────────────────────────────────
viewer.entities.add({
  position: satellitePosition,
  cylinder: {
    length: 400000,
    topRadius: 0,
    bottomRadius: 200000,
    material: Cesium.Color.CYAN.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
    numberOfVerticalLines: 32,
    slices: 64,
  },
})

// ── 3. 倾斜传感器（任意方向） ───────────────────────────────────
const tiltedPosition = Cesium.Cartesian3.fromDegrees(116.6, 39.8, 400000)

viewer.entities.add({
  position: tiltedPosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.ORANGE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '倾斜传感器',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// 使用 headingPitchRoll 创建朝向
const heading = Cesium.Math.toRadians(45)  // 方位角
const pitch = Cesium.Math.toRadians(-30)   // 俯仰角
const roll = Cesium.Math.toRadians(0)
const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
const orientation = Cesium.Transforms.headingPitchRollQuaternion(tiltedPosition, hpr)

viewer.entities.add({
  position: tiltedPosition,
  orientation: orientation,
  cylinder: {
    length: 350000,
    topRadius: 0,
    bottomRadius: 180000,
    material: Cesium.Color.ORANGE.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.ORANGE,
    slices: 64,
  },
})

// ── 4. 动态旋转扫描锥体 ─────────────────────────────────────────
const scanningPosition = Cesium.Cartesian3.fromDegrees(116.8, 39.9, 600000)

viewer.entities.add({
  position: scanningPosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
  },
  label: {
    text: '扫描传感器',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

let scanHeading = 0
viewer.entities.add({
  position: scanningPosition,
  orientation: new Cesium.CallbackProperty(() => {
    scanHeading += 0.01
    if (scanHeading > Math.PI * 2) scanHeading -= Math.PI * 2
    const hpr = new Cesium.HeadingPitchRoll(scanHeading, Cesium.Math.toRadians(-45), 0)
    return Cesium.Transforms.headingPitchRollQuaternion(scanningPosition, hpr)
  }, false),
  cylinder: {
    length: 300000,
    topRadius: 0,
    bottomRadius: 150000,
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        return Cesium.Color.YELLOW.withAlpha(0.25)
      }, false)
    ),
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
    slices: 64,
  },
})

// ── 5. 地面投影椭圆计算 ─────────────────────────────────────────
// 计算传感器在地面上的覆盖区域
function calculateGroundEllipse(
  sensorPosition: Cesium.Cartesian3,
  coneHeight: number,
  coneRadius: number
) {
  const cartographic = Cesium.Cartographic.fromCartesian(sensorPosition)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)

  const positions: Cesium.Cartesian3[] = []
  const segments = 64

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = coneRadius * Math.cos(angle)
    const y = coneRadius * Math.sin(angle)
    const dLon = (x / 111000) * 0.01
    const dLat = (y / 111000) * 0.01
    positions.push(Cesium.Cartesian3.fromDegrees(lon + dLon, lat + dLat, 0))
  }

  return positions
}

// 添加地面投影椭圆
viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.CallbackProperty(() => {
      const positions = calculateGroundEllipse(satellitePosition, 400000, 200000)
      return new Cesium.PolygonHierarchy(positions)
    }, false),
    material: Cesium.Color.CYAN.withAlpha(0.1),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
  },
})

// ── 6. 相机飞入 ────────────────────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.6, 39.85, 1000000),
  duration: 2,
  complete: () => console.log('🔭 圆锥体传感器已加载'),
})

console.log('📌 青色 - 固定朝上传感器')
console.log('📌 橙色 - 倾斜传感器（45° 方位角，-30° 俯仰角）')
console.log('📌 黄色 - 动态扫描传感器')
console.log('💡 地面椭圆为传感器可视范围投影')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CylinderGraphics 圆锥体配置', '传感器朝向 HeadingPitchRoll', '地面投影椭圆计算', '覆盖范围随高度动态更新'],
    points: ['圆锥 topRadius=0 即为标准圆锥', '地面投影椭圆需考虑地球曲率', 'Entity 追踪时锥体随载体姿态更新'],
  },
}
