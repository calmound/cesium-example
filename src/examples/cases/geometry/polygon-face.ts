import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'polygon-face',
  title: '多边形面',
  category: '面与几何体',
  description: '绘制各类多边形：普通多边形、孔洞多边形、贴地多边形、挤出建筑体，对比 Entity 与 Primitive 批量渲染。',
  tags: ['多边形', 'PolygonGraphics', 'Primitive'],
  level: 'easy',
  files: {
    'main.ts': `// 多边形面示例
// 演示 PolygonGraphics 绘制各类多边形

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

// ── 1. 普通多边形 ───────────────────────────────────────────
viewer.entities.add({
  name: '普通多边形',
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([
      116.35, 39.90,
      116.38, 39.90,
      116.38, 39.93,
      116.35, 39.93,
    ]),
    material: Cesium.Color.BLUE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 2. 带孔洞的多边形 ────────────────────────────────────────
viewer.entities.add({
  name: '带孔洞多边形',
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        116.40, 39.88,
        116.45, 39.88,
        116.45, 39.92,
        116.40, 39.92,
      ]),
      [
        new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray([
            116.41, 39.89,
            116.44, 39.89,
            116.44, 39.91,
            116.41, 39.91,
          ])
        ),
      ]
    ),
    material: Cesium.Color.GREEN.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 3. 挤出高度的建筑体 ──────────────────────────────────────
viewer.entities.add({
  name: '挤出建筑体',
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([
      116.46, 39.88,
      116.48, 39.88,
      116.48, 39.90,
      116.46, 39.90,
    ]),
    extrudedHeight: 200,
    material: Cesium.Color.ORANGE.withAlpha(0.8),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 4. 贴地多边形 ───────────────────────────────────────────
viewer.entities.add({
  name: '贴地多边形',
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([
      116.35, 39.85,
      116.38, 39.85,
      116.38, 39.87,
      116.35, 39.87,
    ]),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    material: Cesium.Color.PURPLE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 5. 颜色渐变多边形 ───────────────────────────────────────
viewer.entities.add({
  name: '渐变多边形',
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([
      116.48, 39.92,
      116.52, 39.92,
      116.52, 39.95,
      116.48, 39.95,
    ]),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        return Cesium.Color.fromRandom({ alpha: 0.6 })
      }, false)
    ),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 6. 添加标签 ─────────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.45, 39.90),
  label: {
    text: '多边形示例',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.43, 39.90, 20000),
  duration: 2,
  complete: () => console.log('🔷 多边形示例已加载'),
})

console.log('💡 多边形类型: 普通/带孔洞/挤出高度/贴地/渐变')
console.log('🎨 extrudedHeight 用于创建建筑体效果')
console.log('🕳️ PolygonHierarchy 支持多级孔洞')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PolygonGraphics 多边形配置', 'PolygonHierarchy 孔洞多边形', 'extrudedHeight 挤出高度（建筑体）', 'Primitive 批量合并渲染'],
    points: ['孔洞多边形节点需逆时针', 'extrudedHeight 从地面挤出', 'PerInstanceColorAppearance 每实例着色'],
  },
}
