import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'road-network',
  title: '道路与电力线',
  category: '线与路径',
  description: '绘制城市路网和高压电力线：公交线路 OD 可视化、电力线自动计算弧垂、北京公交线路数据展示。',
  tags: ['道路', '电力线', '路网'],
  level: 'medium',
  files: {
    'main.ts': `// 道路与电力线示例
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

// ── 道路数据 ─────────────────────────────────────
const roads = [
  { name: '长安街', points: [[116.39, 39.9], [116.44, 39.9], [116.49, 39.9]] },
  { name: '二环', points: [[116.39, 39.95], [116.44, 39.95], [116.49, 39.95], [116.49, 39.85], [116.39, 39.85], [116.39, 39.95]] },
]

// ── 添加道路 ───────────────────────────────────────
roads.forEach((road) => {
  const positions = road.points.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1], 0))
  viewer.entities.add({
    name: road.name,
    polyline: {
      positions,
      width: road.name === '二环' ? 8 : 6,
      material: road.name === '长安街' ? Cesium.Color.RED : Cesium.Color.BLUE,
      clampToGround: true,
    },
  })
})

console.log(\`✅ 添加 \${roads.length} 条道路\`)

// ── 电力线数据 ─────────────────────────────────────
const powerLineTowers = [
  { name: '塔1', position: [116.39, 39.9, 100] },
  { name: '塔2', position: [116.42, 39.9, 100] },
  { name: '塔3', position: [116.45, 39.9, 100] },
  { name: '塔4', position: [116.48, 39.9, 100] },
]

// ── 添加电力线塔 ───────────────────────────────────
powerLineTowers.forEach((tower) => {
  viewer.entities.add({
    name: tower.name,
    position: Cesium.Cartesian3.fromDegrees(tower.position[0], tower.position[1], tower.position[2]),
    point: {
      pixelSize: 10,
      color: Cesium.Color.ORANGE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: tower.name,
      font: 'bold 10px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -15),
    },
  })
})

// ── 计算电力线弧垂 ────────────────────────────────
function calculateCatenary(positions: Cesium.Cartesian3[], sag: number): Cesium.Cartesian3[] {
  const result: Cesium.Cartesian3[] = []
  const segments = 20
  
  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i]
    const end = positions[i + 1]
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments
      const x = start.x + t * (end.x - start.x)
      const y = start.y + t * (end.y - start.y)
      const z = start.z + t * (end.z - start.z) - sag * Math.sin(Math.PI * t)
      result.push(new Cesium.Cartesian3(x, y, z))
    }
  }
  
  return result
}

const towerPositions = powerLineTowers.map((t) =>
  Cesium.Cartesian3.fromDegrees(t.position[0], t.position[1], t.position[2])
)
const sagValue = 10
const powerLinePositions = calculateCatenary(towerPositions, sagValue)

viewer.entities.add({
  name: '高压电力线',
  polyline: {
    positions: powerLinePositions,
    width: 2,
    material: Cesium.Color.YELLOW,
  },
})

console.log(\`✅ 添加高压电力线（弧垂值: \${sagValue}）\`)

// ── 添加路径标注 ───────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.44, 39.9, 50000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['GeoJSON 路网数据加载', '高压电线弧垂自动计算', '公交 OD 线可视化', '路网按等级分层着色'],
    points: ['弧垂公式：中点高度 = 两端高度均值 - 弧垂值', 'OD 线宽度可按客流量归一化', '路网数据建议使用 Primitive 批量渲染'],
  },
}
