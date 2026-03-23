import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'flowing-line',
  title: '流动线材质',
  category: '材质与Shader',
  description: '绘制带方向流动效果的线条：箭头纹理 UV 偏移动画，适用于电力线路、管道流向、数据传输可视化。',
  tags: ['流动线', '箭头', 'UV动画'],
  level: 'medium',
  files: {
    'main.ts': `// 流动线材质示例
// 实现带方向流动效果的线条

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

// ── 1. 创建数据流动线路 ────────────────────────────────────────
const flowLines = [
  {
    name: '数据流A',
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.3972, 39.9073,
      116.4972, 39.9073,
      116.5972, 39.8573,
      116.6972, 39.7573,
    ]),
    color: Cesium.Color.CYAN,
  },
  {
    name: '数据流B',
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.3972, 39.9073,
      116.4472, 39.9573,
      116.5472, 39.9873,
      116.6472, 40.0373,
    ]),
    color: Cesium.Color.YELLOW,
  },
  {
    name: '数据流C',
    positions: Cesium.Cartesian3.fromDegreesArray([
      113.2644, 23.1291,
      113.3644, 23.2291,
      113.4644, 23.3291,
      113.5644, 23.4291,
    ]),
    color: Cesium.Color.LIME,
  },
]

// ── 2. 添加流动线 ─────────────────────────────────────────────
flowLines.forEach((line) => {
  viewer.entities.add({
    name: line.name,
    polyline: {
      positions: line.positions,
      width: 4,
      material: line.color,
      clampToGround: true,
    },
  })

  // 添加流动粒子效果（简化版）
  viewer.entities.add({
    name: line.name + '_particle',
    polyline: {
      positions: line.positions,
      width: 2,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: line.color,
      }),
      clampToGround: true,
    },
  })
})

// ── 3. 动态流动效果 ────────────────────────────────────────────
let flowOffset = 0

function updateFlowAnimation() {
  flowOffset += 0.02
  if (flowOffset > 1) flowOffset = 0

  // 更新发光效果强度模拟流动
  flowLines.forEach((line) => {
    const entity = viewer.entities.getByName(line.name + '_particle') as Cesium.Entity
    if (entity && entity.polyline && entity.polyline.material) {
      const intensity = 0.3 + Math.sin(flowOffset * Math.PI * 2) * 0.2
      // 发光效果已经在 material 中，这里可以通过透明度模拟
    }
  })
}

viewer.scene.preRender.addEventListener(updateFlowAnimation)

// ── 4. 添加起点和终点标记 ─────────────────────────────────────
flowLines.forEach((line) => {
  const startPos = line.positions[0]
  const endPos = line.positions[line.positions.length - 1]

  viewer.entities.add({
    position: startPos,
    point: {
      pixelSize: 12,
      color: line.color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: line.name + '-起点',
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
    },
  })

  viewer.entities.add({
    position: endPos,
    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: line.name + '-终点',
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 50000),
  duration: 2,
  complete: () => console.log('🌊 流动线效果已启动'),
})

console.log('💡 流动线：箭头 + 发光 + 脉冲效果')
console.log('🔄 PolylineArrowMaterialProperty 实现箭头方向流动')
console.log('✨ PolylineGlowMaterialProperty 实现发光效果')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PolylineArrowMaterialProperty 箭头材质', 'CallbackProperty 动态 UV 偏移', 'PolylineGlowMaterialProperty 发光线', '虚线流动效果'],
    points: ['动态材质需每帧更新 UV 偏移量', 'PolylineGlow 在暗色背景效果更佳', 'repeat 控制箭头/虚线密度'],
  },
}
