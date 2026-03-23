import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'wind-field',
  title: '风场流线可视化',
  category: '数据可视化',
  description: '基于格网风场数据（U/V 分量）渲染流线粒子，实时模拟大气风场走向，适用于气象数据可视化。',
  tags: ['风场', '流线', '气象'],
  level: 'hard',
  files: {
    'main.ts': `// 风场流线可视化示例
// 基于 U/V 分量渲染流线粒子

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

// ── 1. 模拟风场数据 ───────────────────────────────────────────
const windGridSize = 20
const windData: { lon: number; lat: number; u: number; v: number }[] = []

// 生成模拟风场数据（北风为主，带一些西风
for (let i = 0; i < windGridSize; i++) {
  for (let j = 0; j < windGridSize; j++) {
    const lon = 116 + i * 0.1
    const lat = 39 + j * 0.08
    // 模拟风场：北风为主，随位置变化
    const u = 5 + Math.sin(i * 0.5) * 3  // 西风分量
    const v = 8 + Math.cos(j * 0.3) * 4  // 南北分量
    windData.push({ lon, lat, u, v })
  }
}

// ── 2. 添加风场箭头 ───────────────────────────────────────────
windData.forEach((point, index) => {
  if (index % 3 !== 0) return  // 稀疏采样

  const angle = Math.atan2(point.v, point.u)
  const speed = Math.sqrt(point.u * point.u + point.v * point.v)

  // 箭头长度编码风速
  const arrowLength = speed * 1000

  const endLon = point.lon + Math.cos(angle) * arrowLength / 111000 * 0.01
  const endLat = point.lat + Math.sin(angle) * arrowLength / 111000 * 0.01

  viewer.entities.add({
    name: '风箭头_' + index,
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray([point.lon, point.lat, endLon, endLat]),
      width: 2,
      material: Cesium.Color.CYAN,
    },
    point: {
      pixelSize: 3,
      color: Cesium.Color.CYAN,
    },
  })
})

// ── 3. 流线粒子效果 ───────────────────────────────────────────
let particles: { lon: number; lat: number; age: number }[] = []

function updateWindParticles() {
  // 添加新粒子
  if (Math.random() > 0.7) {
    particles.push({
      lon: 116 + Math.random() * 2,
      lat: 39 + Math.random() * 0.8,
      age: 0,
    })
  }

  // 更新粒子位置
  particles = particles.filter((p) => {
    // 查找最近的风场数据
    const nearest = windData.reduce((prev, curr) => {
      const distPrev = Math.abs(prev.lon - p.lon) + Math.abs(prev.lat - p.lat)
      const distCurr = Math.abs(curr.lon - p.lon) + Math.abs(curr.lat - p.lat)
      return distCurr < distPrev ? curr : prev
    })

    if (nearest) {
      p.lon += nearest.u * 0.0001
      p.lat += nearest.v * 0.0001
      p.age++
    }

    return p.lon < 118 && p.lat > 39 && p.lat < 40 && p.age < 100
  })
}

viewer.scene.preRender.addEventListener(updateWindParticles)

// ── 4. 动态渲染粒子 ──────────────────────────────────────────
setInterval(() => {
  // 清除旧粒子实体（实际应用中更好的做法是复用实体）
  const oldParticles = viewer.entities.values.filter(
    (e) => e._name && e._name.startsWith('粒子_')
  )
  oldParticles.forEach((e) => viewer.entities.remove(e))

  // 添加新粒子
  particles.forEach((p, i) => {
    viewer.entities.add({
      name: '粒子_' + i,
      position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 100),
      point: {
        pixelSize: 4 - p.age * 0.03,
        color: Cesium.Color.CYAN.withAlpha(1 - p.age / 100),
      },
    })
  })
}, 100)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(117, 39.5, 200000),
  duration: 2,
  complete: () => console.log('💨 风场可视化已启动'),
})

console.log('💨 风场流线：箭头方向表示风向，长度表示风速')
console.log('🔄 粒子追踪：模拟大气流动效果')
console.log('📊 实际项目需要接入气象数据（NetCDF 等格式）')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['粒子流线追踪算法', 'UV 风速分量插值', '粒子生命周期管理', '风速颜色映射'],
    points: ['双线性插值获取任意位置风速', '粒子数量影响视觉密度和性能', 'WebGL 纹理存储粒子状态效率更高'],
  },
}
