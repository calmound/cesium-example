import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'scene-mode',
  title: '二三维切换',
  category: '基础操作',
  description: '在三维球、哥伦布视图（2.5D）、二维平面地图三种场景模式之间平滑切换，理解各模式的使用场景。',
  tags: ['二三维', '场景模式', '切换'],
  level: 'easy',
  files: {
    'main.ts': `// 二三维切换示例
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
  // 允许场景模式切换
  scene3DOnly: false,
})
viewerRef.current = viewer

// ── 添加几条中国主要城市连线 ─────────────────────
const coords = [
  [116.39, 39.9],  // 北京
  [121.47, 31.23], // 上海
  [113.26, 23.13], // 广州
  [104.06, 30.67], // 成都
  [106.55, 29.57], // 重庆
]

viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray(coords.flat()),
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.2,
      color: Cesium.Color.CYAN,
    }),
    clampToGround: false,
  },
})

coords.forEach(([lon, lat]) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: { pixelSize: 10, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
  })
})

// ── 模式切换序列 ───────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 35, 5000000),
  duration: 2,
  complete: () => {
    console.log('✅ 当前模式: 3D 球体 (SceneMode.SCENE3D)')

    // 2秒后切换到哥伦布视图（2.5D 展开地球）
    setTimeout(() => {
      viewer.scene.morphToColumbusView(2)
      console.log('🗺️  切换到哥伦布视图 (COLUMBUS_VIEW) - 地球展开为平面')
    }, 2500)

    // 6秒后切换到 2D 地图
    setTimeout(() => {
      viewer.scene.morphTo2D(2)
      console.log('📄 切换到 2D 地图 (SCENE2D) - 完全平面，禁用倾斜')
    }, 6000)

    // 10秒后回到 3D
    setTimeout(() => {
      viewer.scene.morphTo3D(2)
      console.log('🌍 回到 3D 球体 (SCENE3D)')
    }, 10000)
  },
})

console.log('🔄 场景模式切换演示（自动播放）：')
console.log('  3D → 哥伦布视图 → 2D → 3D')
console.log('  当前场景模式:', viewer.scene.mode)
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['SceneMode.SCENE3D / SCENE2D / COLUMBUS_VIEW', 'morphTo2D / morphTo3D 动画切换', 'morphTime 控制切换进度', '不同模式下坐标系差异'],
    points: ['COLUMBUS_VIEW 可展开地球表面', '切换时相机位置会自动重算', '2D 模式禁用倾斜视角'],
  },
}
