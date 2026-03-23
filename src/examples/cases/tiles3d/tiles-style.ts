import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-style',
  title: '3D Tiles 样式与属性查询',
  category: '3D Tiles',
  description: '使用 3D Tiles Styling 语言按属性字段条件着色，点击建筑物查询属性信息，实现分类渲染与数据联动。',
  tags: ['3DTiles', '样式', '属性查询'],
  level: 'medium',
  files: {
    'main.ts': `// 3D Tiles 样式与属性查询示例
// 演示使用 3D Tiles Styling 语言条件着色，点击查询属性

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
})
viewerRef.current = viewer

// ── 1. 加载 3D Tiles ───────────────────────────────────────────
const tileset = new Cesium.Cesium3DTileset.fromUrl(
  'https://data.macity.com/3dtiles/melbourne/tileset.json'
)

tileset.readyPromise.then(() => {
  viewer.scene.primitives.add(tileset)
  viewer.zoomTo(tileset)
})

// ── 2. 条件样式表达式 ──────────────────────────────────────────
// 根据 building 属性分类着色
const styledTileset = new Cesium.Cesium3DTileset.fromUrl(
  'https://data.macity.com/3dtiles/melbourne/tileset.json'
)

styledTileset.style = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ['height >= 200', 'rgba(200, 50, 50, 1)'],
      ['height >= 100', 'rgba(200, 150, 50, 1)'],
      ['height >= 50', 'rgba(50, 200, 100, 1)'],
      ['height >= 20', 'rgba(50, 150, 200, 1)'],
      ['true', 'rgba(100, 100, 100, 1)'],
    ],
  },
  show: 'height > 0',
  meta: {
    description: '"Building height: " + height + "m"',
  },
})

// ── 3. 默认样式（高度渐变）─────────────────────────────────────
let useHeightStyle = true

const heightStyle = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ['height >= 200', 'rgb(200, 50, 50)'],
      ['height >= 100', 'rgb(200, 150, 50)'],
      ['height >= 50', 'rgb(50, 200, 100)'],
      ['height >= 20', 'rgb(50, 150, 200)'],
      ['true', 'rgb(150, 150, 150)'],
    ],
  },
})

const categoryStyle = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ['Distance > 5000', 'rgb(255, 100, 100)'],
      ['Distance > 2000', 'rgb(255, 200, 100)'],
      ['Distance > 500', 'rgb(100, 255, 100)'],
      ['true', 'rgb(100, 100, 255)'],
    ],
  },
})

tileset.style = heightStyle

// ── 4. 点击查询属性 ───────────────────────────────────────────
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

handler.setInputAction((clickEvent: Cesium.ScreenSpaceEventHandler.Type) => {
  const pickedFeature = viewer.scene.pick(clickEvent.position)

  if (Cesium.defined(pickedFeature) && pickedFeature.primitive) {
    const feature = pickedFeature as Cesium.Cesium3DTileFeature

    console.log('===== 建筑属性 =====')
    console.log('Longitude:', feature.getProperty('Longitude'))
    console.log('Latitude:', feature.getProperty('Latitude'))
    console.log('Height:', feature.getProperty('height'))
    console.log('Coordinates:', feature.getProperty('coordinates'))

    // 获取所有属性名
    const propertyNames = feature.getPropertyIds()
    console.log('所有属性:', propertyNames)

    // 高亮选中建筑
    feature.color = Cesium.Color.YELLOW.withAlpha(0.5)

    // 显示属性信息弹窗
    const description = propertyNames
      .map((name) => \`<b>\${name}:</b> \${feature.getProperty(name)}\`)
      .join('<br>')

    viewer.selectedEntity = undefined
    const entity = viewer.entities.add({
      position: feature.position,
      label: {
        text: '点击查询',
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        backgroundColor: Cesium.Color.DARKGRAY.withAlpha(0.8),
        backgroundPadding: new Cesium.Cartesian2(5, 5),
        showBackground: true,
      },
    })

    // 3秒后移除临时标签
    setTimeout(() => {
      viewer.entities.remove(entity)
    }, 3000)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

// ── 5. 样式切换 ────────────────────────────────────────────────
function toggleStyle() {
  useHeightStyle = !useHeightStyle
  tileset.style = useHeightStyle ? heightStyle : categoryStyle
  console.log(\`样式切换: \${useHeightStyle ? '高度着色' : '分类着色'}\`)
}

// ── 6. GUI 提示 ────────────────────────────────────────────────
console.log('3D Tiles 样式控制：')
console.log('- 点击建筑查看属性信息')
console.log('- 根据高度或距离分类着色')
console.log('💡 Cesium3DTileStyle 支持 JavaScript 表达式')
console.log('💡 feature.getProperty() 获取属性值')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 400),
  duration: 2,
})

console.log('✓ 样式与属性查询示例已启动')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Cesium3DTileStyle 条件表达式', 'feature.getProperty 获取属性值', '按楼层/用途分类着色', '点击高亮选中建筑'],
    points: ['style.color 支持 JavaScript 表达式', 'feature 对象在 3DTILES_INSPECTOR 可查', 'conditions 数组按优先级匹配'],
  },
}
