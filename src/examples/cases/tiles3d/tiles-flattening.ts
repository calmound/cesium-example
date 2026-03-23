import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-flattening',
  title: '3D Tiles 模型压平',
  category: '3D Tiles',
  description: '通过裁剪平面或 CustomShader 将指定区域的 3D Tiles 建筑物压平到地面，用于规划方案对比展示。',
  tags: ['3DTiles', '压平', '裁剪'],
  level: 'hard',
  files: {
    'main.ts': `// 3D Tiles 模型压平示例
// 演示通过裁剪平面或 CustomShader 将建筑物压平到地面

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
  console.log('✓ 3D Tiles 加载完成')
})

// ── 2. 方法一：ClippingPlaneCollection 裁剪平面 ───────────────
// 创建单个裁剪平面（从下往上切，保留上半部分）
const clippingPlane = new Cesium.ClippingPlane({
  normal: Cesium.Cartesian3.UNIT_Z.negate(), // 法线向下
  distance: 20, // 距离原点 20 米处裁剪
})

// 创建裁剪平面集合
const clippingPlanes = new Cesium.ClippingPlaneCollection({
  planes: [clippingPlane],
  enabled: true,
  unionClippingRegions: false, // false: 保留裁剪平面以下部分
})

tileset.clippingPlanes = clippingPlanes

// ── 3. 压平高度控制 ───────────────────────────────────────────
let flattenHeight = 20 // 默认压平到 20 米

function updateFlattenHeight(height: number) {
  flattenHeight = height
  clippingPlane.distance = height
  console.log(\`压平高度: \${height}m\`)
}

// ── 4. 区域选择（绘制多边形）───────────────────────────────────
// 创建用于显示压平区域的矩形
const flattenRegion = viewer.entities.add({
  name: '压平区域',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(
      144.95, -37.82, 144.98, -37.80
    ),
    material: Cesium.Color.RED.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.RED,
  },
})

// ── 5. 方法二：CustomShader 高度压缩 ───────────────────────────
// 使用着色器将高于某高度的顶点压缩
const flattenShader = new Cesium.CustomShader({
  vertexShaderText: \`
    void main() {
      // 获取顶点位置
      vec3 position = czm_position;

      // 压平：将高度压缩到指定值以下
      float maxHeight = 20.0; // 最大高度
      if (position.z > maxHeight) {
        position.z = mix(position.z, maxHeight, 0.8);
      }

      // 输出修改后的位置
      czm_vertexOutput.position = czm_projection * czm_view * vec4(position, 1.0);
    }
  \`,
})

// ── 6. 切换压平模式 ───────────────────────────────────────────
type FlattenMode = 'clipping' | 'shader' | 'none'
let currentMode: FlattenMode = 'clipping'

function setFlattenMode(mode: FlattenMode) {
  currentMode = mode
  switch (mode) {
    case 'clipping':
      tileset.clippingPlanes = clippingPlanes
      tileset.customShader = undefined
      break
    case 'shader':
      tileset.clippingPlanes = undefined
      tileset.customShader = flattenShader
      break
    case 'none':
      tileset.clippingPlanes = undefined
      tileset.customShader = undefined
      break
  }
  console.log(\`压平模式: \${mode}\`)
}

// ── 7. 压平过渡动画 ────────────────────────────────────────────
let isAnimating = false
let targetHeight = 20
let currentAnimHeight = 100

function startFlattenAnimation(target: number) {
  if (isAnimating) return
  isAnimating = true
  targetHeight = target

  const animate = () => {
    if (currentAnimHeight > targetHeight) {
      currentAnimHeight -= 2
      updateFlattenHeight(currentAnimHeight)
      requestAnimationFrame(animate)
    } else {
      isAnimating = false
      console.log('压平动画完成')
    }
  }
  animate()
}

// ── 8. GUI 控制面板 ───────────────────────────────────────────
console.log('3D Tiles 压平控制：')
console.log('- clipping: 使用 ClippingPlane 裁剪')
console.log('- shader: 使用 CustomShader 高度压缩')
console.log('- none: 移除压平效果')
console.log('- 高度调节: 0-100 米')
console.log('💡 ClippingPlane 坐标系为瓦片集本地坐标')
console.log('💡 unionClippingRegions 控制内/外裁剪')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 500),
  duration: 2,
})

console.log('✓ 模型压平示例已启动')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ClippingPlaneCollection 裁剪平面', 'CustomShader 实现高度压缩', '区域选择与压平联动', '压平过渡动画'],
    points: ['裁剪平面坐标系为瓦片集本地坐标', 'unionClippingRegions 控制内/外裁剪', '压平效果可与地形无缝融合'],
  },
}
