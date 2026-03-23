import type { ExampleMeta } from './types'

export const basicHelloWorld: ExampleMeta = {
  id: 'basic-hello-world',
  title: 'Hello World',
  category: '基础入门',
  description: '创建最简单的 Cesium 三维地球，使用 OpenStreetMap 底图，无需 Ion Token，演示相机飞行定位。',
  tags: ['viewer', '入门', '相机'],
  level: 'easy',
  files: {
    'main.ts': `// 创建 Cesium Viewer（使用 OpenStreetMap 底图，无需 Ion Token）
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  // 使用 OSM 底图，绕过 Ion Token 限制
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})

// 将 viewer 注册到 viewerRef，供沙箱清理时销毁
viewerRef.current = viewer

// 飞行至北京天安门广场
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3912, 39.9073, 1500000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  },
  duration: 2.5,
})

// 添加一个点标记
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.3912, 39.9073, 0),
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '天安门广场',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -18),
  },
})

console.log('✅ Cesium Viewer 初始化完成')
console.log('📍 已添加天安门广场标记')
console.log('🎥 相机飞行中...')
`,
    'style.css': `/* 自定义 Cesium 工具栏样式 */
.cesium-viewer-toolbar {
  top: 8px;
  right: 8px;
}

.cesium-widget-credits {
  display: none !important;
}
`,
  },
  guide: {
    features: [
      '创建 Cesium.Viewer 并禁用默认 UI 控件',
      '使用 UrlTemplateImageryProvider 加载 OpenStreetMap 底图',
      '使用 camera.flyTo() 实现相机飞行动画',
      '添加 Entity（点 + 标签）标记地理位置',
    ],
    points: [
      'Viewer 构造时通过 baseLayer 指定底图，避免依赖 Ion Token',
      'viewerRef.current = viewer 让沙箱在下次运行时自动销毁旧实例',
      'Cesium.Cartesian3.fromDegrees(经度, 纬度, 高度) 是最常用的坐标转换方法',
      'Entity API 是添加点、线、面等矢量数据的高层接口',
    ],
  },
}
