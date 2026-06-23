import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'rectangle-circle',
  title: '矩形、圆与扇形',
  category: '面与几何体',
  description: '绘制矩形、圆形、椭圆、扇形等规则几何面，支持贴地、挤出、旋转等属性，配合 Primitive 实现大量渲染。',
  tags: ['矩形', '圆形', '扇形'],
  level: 'easy',
  files: {
    'main.ts': `// 矩形、圆与扇形示例
// 演示规则几何面的绘制

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

// ── 1. 矩形 ─────────────────────────────────────────────────
viewer.entities.add({
  name: '普通矩形',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(116.35, 39.90, 116.38, 39.93),
    material: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 2. 旋转矩形 ─────────────────────────────────────────────
viewer.entities.add({
  name: '旋转矩形',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(116.40, 39.88, 116.44, 39.92),
    rotation: Cesium.Math.toRadians(45),
    material: Cesium.Color.BLUE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 3. 圆形 ─────────────────────────────────────────────────
viewer.entities.add({
  name: '圆形',
  position: Cesium.Cartesian3.fromDegrees(116.47, 39.91),
  ellipse: {
    semiMajorAxis: 3000,
    semiMinorAxis: 3000,
    material: Cesium.Color.GREEN.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 4. 椭圆 ─────────────────────────────────────────────────
viewer.entities.add({
  name: '椭圆',
  position: Cesium.Cartesian3.fromDegrees(116.42, 39.93),
  ellipse: {
    semiMajorAxis: 4000,
    semiMinorAxis: 2000,
    rotation: Cesium.Math.toRadians(30),
    material: Cesium.Color.ORANGE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 5. 扇形（通过椭圆限制角度）────────────────────────────────
viewer.entities.add({
  name: '扇形',
  position: Cesium.Cartesian3.fromDegrees(116.50, 39.90),
  ellipse: {
    semiMajorAxis: 3000,
    semiMinorAxis: 3000,
    startAngle: Cesium.Math.toRadians(45),
    endAngle: Cesium.Math.toRadians(135),
    rotation: Cesium.Math.toRadians(0),
    material: Cesium.Color.PURPLE.withAlpha(0.6),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 6. 挤出圆柱 ─────────────────────────────────────────────
viewer.entities.add({
  name: '挤出圆柱',
  position: Cesium.Cartesian3.fromDegrees(116.37, 39.87),
  ellipse: {
    semiMajorAxis: 1500,
    semiMinorAxis: 1500,
    height: 0,
    extrudedHeight: 150,
    material: Cesium.Color.CYAN.withAlpha(0.7),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 7. 半圆（通过 startAngle/endAngle）──────────────────────
viewer.entities.add({
  name: '半圆区域',
  position: Cesium.Cartesian3.fromDegrees(116.53, 39.93),
  ellipse: {
    semiMajorAxis: 2500,
    semiMinorAxis: 2500,
    startAngle: Cesium.Math.toRadians(-90),
    endAngle: Cesium.Math.toRadians(90),
    material: Cesium.Color.YELLOW.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.45, 39.90, 25000),
  duration: 2,
  complete: () => console.log('⭕ 矩形、圆、扇形已加载'),
})

console.log('💡 RectangleGraphics 用于绘制矩形')
console.log('🔵 EllipseGraphics 用于绘制圆/椭圆/扇形')
console.log('📐 semiMajorAxis/semiMinorAxis 控制长半轴/短半轴')
console.log('🔪 startAngle/endAngle 用于创建扇形')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['RectangleGraphics 矩形', 'EllipseGraphics 圆/椭圆', '扇形（startAngle/stopAngle）', '正多边形近似圆形'],
    points: ['EllipseGraphics semiMajorAxis/semiMinorAxis 半轴（米）', '扇形通过限制角度范围实现', 'rotation 属性可旋转矩形'],
  },
}
