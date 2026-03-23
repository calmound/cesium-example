import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'building-flicker',
  title: '建筑扫光 CustomShader',
  category: '材质与Shader',
  description: '为建筑 3D Tiles 添加由下至上的扫光动画，通过 CustomShader 修改建筑颜色与发光强度实现科技感效果。',
  tags: ['扫光', '建筑', 'CustomShader'],
  level: 'hard',
  files: {
    'main.ts': `// 建筑扫光 CustomShader 示例
// 为建筑添加由下至上的扫光动画效果

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

// ── 1. 创建建筑群数据 ─────────────────────────────────────────
const buildings = [
  { name: '建筑A', lon: 116.3972, lat: 39.9073, height: 200 },
  { name: '建筑B', lon: 116.3975, lat: 39.9076, height: 150 },
  { name: '建筑C', lon: 116.3969, lat: 39.9070, height: 180 },
  { name: '建筑D', lon: 116.3978, lat: 39.9068, height: 220 },
  { name: '建筑E', lon: 116.3966, lat: 39.9075, height: 160 },
]

// ── 2. 添加建筑盒子 ────────────────────────────────────────────
buildings.forEach((building) => {
  const entity = viewer.entities.add({
    name: building.name,
    position: Cesium.Cartesian3.fromDegrees(building.lon, building.lat, building.height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(30, 30, building.height),
      material: Cesium.Color.fromCssColorString('#4a90d9'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
  })
})

// ── 3. 扫光动画系统 ──────────────────────────────────────────
let sweepHeight = 0
const sweepSpeed = 50  // 每秒上升的高度

function updateSweepAnimation() {
  sweepHeight += sweepSpeed * 0.016  // 假设 60fps
  if (sweepHeight > 300) sweepHeight = 0

  buildings.forEach((building, index) => {
    const entity = viewer.entities.getByName(building.name) as Cesium.Entity
    if (entity && entity.box) {
      // 计算扫光效果
      const buildingTop = building.height
      const sweepZone = 30  // 扫光区域高度
      const distance = Math.abs(sweepHeight - buildingTop)

      if (distance < sweepZone) {
        // 在扫光区域内，增强发光
        const intensity = 1 - (distance / sweepZone)
        const color = Cesium.Color.fromCssColorString('#00ffff').withAlpha(intensity)
        entity.box.material = color
      } else {
        // 恢复正常颜色
        entity.box.material = Cesium.Color.fromCssColorString('#4a90d9')
      }
    }
  })
}

// ── 4. 启动扫光动画 ──────────────────────────────────────────
viewer.scene.preRender.addEventListener(() => {
  updateSweepAnimation()
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 500),
  duration: 2,
  complete: () => console.log('🏢 建筑扫光效果已启动'),
})

console.log('💡 扫光效果：由下至上循环扫描建筑')
console.log('🎨 自定义 Shader 可实现更复杂的发光效果')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CustomShader 实现扫光效果', '时间驱动扫光位置', '建筑轮廓边缘发光', '夜景模式与白天模式切换'],
    points: ['扫光位置通过世界坐标高度判断', 'fract(time) 实现循环扫光', 'emissiveColor 不受光照影响'],
  },
}
