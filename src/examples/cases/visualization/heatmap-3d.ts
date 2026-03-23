import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'heatmap-3d',
  title: '三维热力图',
  category: '数据可视化',
  description: '将二维热力数据立体化，用柱体高度和颜色双重编码数值强度，适用于人流密度、污染浓度等空间分布展示。',
  tags: ['热力图', '三维', '数据可视化'],
  level: 'medium',
  files: {
    'main.ts': `// 三维热力图示例
// 用柱体高度和颜色双重编码数值强度

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

// ── 1. 模拟热力数据点 ────────────────────────────────────────
const heatData = [
  { lon: 116.3972, lat: 39.9073, value: 95 },  // 北京
  { lon: 121.4737, lat: 31.2304, value: 88 },  // 上海
  { lon: 113.2644, lat: 23.1291, value: 75 },  // 广州
  { lon: 104.0658, lat: 30.6571, value: 65 },  // 成都
  { lon: 120.1536, lat: 30.2875, value: 72 },  // 杭州
  { lon: 114.0581, lat: 22.5437, value: 82 },  // 深圳
  { lon: 112.9823, lat: 28.1124, value: 55 },  // 长沙
  { lon: 106.5577, lat: 29.5589, value: 60 },  // 重庆
  { lon: 108.9482, lat: 34.3416, value: 50 },  // 西安
  { lon: 117.2155, lat: 31.8206, value: 58 },  // 合肥
]

// ── 2. 颜色映射函数 ──────────────────────────────────────────
function getHeatColor(value: number): Cesium.Color {
  // 归一化到 0-1
  const t = (value - 50) / 50
  if (t < 0.25) {
    return Cesium.Color.fromCssColorString('#0000ff').lerp(Cesium.Color.fromCssColorString('#00ff00'), t * 4)
  } else if (t < 0.5) {
    return Cesium.Color.fromCssColorString('#00ff00').lerp(Cesium.Color.fromCssColorString('#ffff00'), (t - 0.25) * 4)
  } else if (t < 0.75) {
    return Cesium.Color.fromCssColorString('#ffff00').lerp(Cesium.Color.fromCssColorString('#ff0000'), (t - 0.5) * 4)
  } else {
    return Cesium.Color.fromCssColorString('#ff0000').lerp(Cesium.Color.fromCssColorString('#8b0000'), (t - 0.75) * 4)
  }
}

// ── 3. 添加热力柱体 ──────────────────────────────────────────
heatData.forEach((point) => {
  const height = point.value * 500  // 高度编码数值

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, height / 2),
    cylinder: {
      length: height,
      topRadius: 3000,
      bottomRadius: 3000,
      material: getHeatColor(point.value).withAlpha(0.8),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    description: \`
      <div style="padding: 10px;">
        <h3>热力点</h3>
        <p><b>经度:</b> \${point.lon.toFixed(4)}</p>
        <p><b>纬度:</b> \${point.lat.toFixed(4)}</p>
        <p><b>数值:</b> \${point.value}</p>
      </div>
    \`,
  })

  // 添加底部标签
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    label: {
      text: point.value.toString(),
      font: 'bold 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  })
})

// ── 4. 添加图例 ──────────────────────────────────────────────
const legendData = [
  { value: 50, label: '低' },
  { value: 65, label: '中低' },
  { value: 75, label: '中' },
  { value: 85, label: '中高' },
  { value: 95, label: '高' },
]

console.log('📊 已添加', heatData.length, '个热力数据点')
console.log('🎨 颜色映射: 蓝->绿->黄->红->深红')
console.log('📏 柱体高度编码数值强度')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 32, 8000000),
  duration: 2,
  complete: () => console.log('🌡️ 三维热力图已加载'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Cylinder/Box 高度编码数值', '色阶映射（Color Ramp）', '数值归一化处理', '动态更新与动画'],
    points: ['高度编码比颜色更直观', '色阶推荐冷暖色系增强对比', '大数据量改用 Primitive 批量渲染'],
  },
}
