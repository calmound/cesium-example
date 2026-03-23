import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'polyline-basic',
  title: '折线基础',
  category: '线与路径',
  description: '绘制各类折线：普通折线、贴地折线、发光线、虚线、箭头线，对比 Entity 与 Primitive 两种渲染方式。',
  tags: ['折线', 'PolylineGraphics', 'Primitive'],
  level: 'easy',
  files: {
    'main.ts': `// 折线基础示例：Entity vs Primitive 渲染对比
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

// ── Part 1: Entity PolylineGraphics（适合少量折线）────

viewer.entities.add({
  name: '普通折线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.9, 50000, 116.5, 39.9, 50000, 116.7, 40.1, 50000, 116.9, 40.0, 50000,
    ]),
    width: 3,
    material: Cesium.Color.RED,
  },
})

viewer.entities.add({
  name: '贴地折线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.3, 39.7, 116.5, 39.6, 116.7, 39.7, 116.9, 39.5,
    ]),
    width: 4,
    material: Cesium.Color.BLUE,
    clampToGround: true,
  },
})

viewer.entities.add({
  name: '发光线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.2, 39.5, 30000, 116.4, 39.4, 30000, 116.6, 39.3, 30000,
    ]),
    width: 6,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.4,
      color: Cesium.Color.CYAN,
    }),
  },
})

viewer.entities.add({
  name: '虚线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.3, 20000, 116.5, 39.2, 20000, 116.7, 39.1, 20000,
    ]),
    width: 3,
    material: new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.YELLOW,
    }),
  },
})

viewer.entities.add({
  name: '箭头线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.1, 40000, 116.5, 39.0, 40000, 116.7, 38.9, 40000,
    ]),
    width: 5,
    material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.LIME),
  },
})

console.log('✅ Entity 方式添加 5 种折线样式')

// ── Part 2: Primitive 高性能折线（适合大量折线）────
const primitiveLines = viewer.scene.primitives.add(new Cesium.PolylineCollection())

const lineCount = 50
for (let i = 0; i < lineCount; i++) {
  const startLon = 116.0 + Math.random() * 1.5
  const startLat = 38.5 + Math.random() * 1.5
  const endLon = startLon + (Math.random() - 0.5) * 0.5
  const endLat = startLat + (Math.random() - 0.5) * 0.5

  primitiveLines.add({
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      startLon, startLat, Math.random() * 50000,
      endLon, endLat, Math.random() * 50000,
    ]),
    width: 2,
    material: Cesium.Color.fromRandom({ alpha: 0.8 }),
  })
}

console.log(\`🚀 PolylineCollection 添加 \${lineCount} 条随机折线（高性能）\`)
console.log('💡 Entity 适合 < 100 条；PolylineCollection 适合 10000+ 条')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.5, 39.0, 400000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PolylineGraphics 折线配置', 'PolylinePrimitive 高性能折线', '贴地折线 clampToGround', 'PolylineDash / PolylineGlow / PolylineArrow 材质'],
    points: ['大量折线改用 GeometryInstance + Primitive 批量渲染', 'clampToGround 只对地表有效', '箭头密度由 material.repeat 控制'],
  },
}
