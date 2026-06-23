import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'box-3d',
  title: '立体盒子与圆锥',
  category: '面与几何体',
  description: '绘制三维盒子、圆锥、四棱锥，光锥等立体几何体，展示统计柱状图（圆锥/盒子编码数值）应用场景。',
  tags: ['盒子', '圆锥', '立体几何'],
  level: 'easy',
  files: {
    'main.ts': `// 立体盒子与圆锥示例
// 演示 BoxGraphics 和 CylinderGraphics 绘制立体几何

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

// ── 1. 统计柱状图数据 ────────────────────────────────────────
const cityData = [
  { name: '北京', value: 2154, color: Cesium.Color.RED },
  { name: '上海', value: 2428, color: Cesium.Color.ORANGE },
  { name: '深圳', value: 1756, color: Cesium.Color.YELLOW },
  { name: '广州', value: 1530, color: Cesium.Color.GREEN },
  { name: '成都', value: 1330, color: Cesium.Color.CYAN },
]

const maxValue = Math.max(...cityData.map(d => d.value))

// ── 2. 添加柱状图（使用 Box）───────────────────────────────
cityData.forEach((city, index) => {
  const height = (city.value / maxValue) * 300
  const x = index * 800 - 1600

  viewer.entities.add({
    name: city.name,
    position: Cesium.Cartesian3.fromDegrees(116.39 + x / 111000, 39.90, height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(400, 400, height),
      material: city.color.withAlpha(0.8),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
    },
    label: {
      text: city.name + '\\n' + city.value + '万',
      font: 'bold 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -20),
    },
  })
})

// ── 3. 圆锥体 ─────────────────────────────────────────────
viewer.entities.add({
  name: '圆锥体',
  position: Cesium.Cartesian3.fromDegrees(116.55, 39.93, 50),
  cylinder: {
    length: 150,
    topRadius: 0,
    bottomRadius: 80,
    material: Cesium.Color.PURPLE.withAlpha(0.7),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 4. 圆柱体 ─────────────────────────────────────────────
viewer.entities.add({
  name: '圆柱体',
  position: Cesium.Cartesian3.fromDegrees(116.55, 39.88, 50),
  cylinder: {
    length: 120,
    topRadius: 40,
    bottomRadius: 40,
    material: Cesium.Color.BLUE.withAlpha(0.7),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 5. 截断圆锥（圆台）────────────────────────────────────
viewer.entities.add({
  name: '圆台',
  position: Cesium.Cartesian3.fromDegrees(116.58, 39.90, 50),
  cylinder: {
    length: 100,
    topRadius: 50,
    bottomRadius: 30,
    material: Cesium.Color.GREEN.withAlpha(0.7),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 6. 旋转的盒子 ─────────────────────────────────────────
viewer.entities.add({
  name: '旋转盒子',
  position: Cesium.Cartesian3.fromDegrees(116.53, 39.85, 30),
  box: {
    dimensions: new Cesium.Cartesian3(60, 60, 60),
    material: Cesium.Color.ORANGE.withAlpha(0.8),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    rotation: new Cesium.CallbackProperty(() => {
      return Cesium.Quaternion.fromAxisAngle(
        Cesium.Cartesian3.UNIT_Z,
        Cesium.Math.toRadians(Date.now() / 50 % 360)
      )
    }, false),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.47, 39.90, 15000),
  duration: 2,
  complete: () => console.log('📊 立体几何示例已加载'),
})

console.log('💡 BoxGraphics 用于绘制立方体/长方体')
console.log('🔘 CylinderGraphics 用于绘制圆柱/圆锥/圆台')
console.log('📊 高度可编码数值实现柱状图效果')
console.log('🔄 rotation 属性控制旋转角度')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['BoxGraphics 盒子', 'CylinderGraphics 圆柱/圆锥', '四棱锥（自定义 Geometry）', '圆锥追踪体动画'],
    points: ['CylinderGraphics topRadius=0 即为圆锥', '立体几何可用于统计图表', 'Primitive 合并渲染 10000+ 个几何体'],
  },
}
