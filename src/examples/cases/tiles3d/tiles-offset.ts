import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-offset',
  title: '3D Tiles 位置偏移纠正',
  category: '3D Tiles',
  description: '修正 3D Tiles 数据集因坐标基准差异造成的位置偏移，通过矩阵变换将数据对齐到正确地理位置。',
  tags: ['3DTiles', '偏移', '坐标纠正'],
  level: 'medium',
  files: {
    'main.ts': `// 3D Tiles 位置偏移纠正示例
// 演示通过 modelMatrix 矩阵变换修正坐标偏移

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
})
viewerRef.current = viewer

// ── 1. 加载带偏移的 3D Tiles ───────────────────────────────────
const tileset = new Cesium.Cesium3DTileset.fromUrl(
  'https://data.macity.com/3dtiles/melbourne/tileset.json'
)

tileset.readyPromise.then(() => {
  viewer.scene.primitives.add(tileset)
  viewer.zoomTo(tileset)
})

// ── 2. 原始位置（无偏移）标记 ──────────────────────────────────
const originalEntity = viewer.entities.add({
  name: '原始位置',
  position: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 0),
  point: {
    pixelSize: 20,
    color: Cesium.Color.RED.withAlpha(0.8),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '原始位置',
    font: '14px sans-serif',
    fillColor: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -10),
  },
})

// ── 3. 定义偏移量（单位：米）───────────────────────────────────
const offsetX = 0
const offsetY = 0
const offsetZ = 10 // 高度偏移

// ── 4. 应用 modelMatrix 变换 ───────────────────────────────────
// 方法：创建局部 ENU 坐标系，然后应用平移
const center = tileset.boundingSphere.center
const enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(center)

// 创建平移矩阵
const translation = Cesium.Matrix4.fromTranslation(
  new Cesium.Cartesian3(offsetX, offsetY, offsetZ)
)

// 组合变换：ENU坐标 * 平移
tileset.modelMatrix = Cesium.Matrix4.multiply(
  enuTransform,
  translation,
  new Cesium.Matrix4()
)

// ── 5. 偏移后位置标记 ──────────────────────────────────────────
const offsetEntity = viewer.entities.add({
  name: '偏移后位置',
  position: Cesium.Cartesian3.fromDegrees(
    144.9631 + offsetX / 111320,
    -37.814 + offsetY / 111320,
    offsetZ
  ),
  point: {
    pixelSize: 20,
    color: Cesium.Color.GREEN.withAlpha(0.8),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '偏移后 (+10m Z)',
    font: '14px sans-serif',
    fillColor: Cesium.Color.GREEN,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -10),
  },
})

// ── 6. 旋转纠正示例 ────────────────────────────────────────────
// 创建旋转变换（绕 Z 轴旋转 45 度）
const rotationZ = Cesium.Matrix4.fromRotationZ(Cesium.Math.toRadians(45))

// 创建新的 modelMatrix：平移 * 旋转
const correctedMatrix = Cesium.Matrix4.multiply(
  translation,
  rotationZ,
  new Cesium.Matrix4()
)

// 应用到另一个瓦片集（如果有的话）
// tileset2.modelMatrix = Cesium.Matrix4.multiply(enuTransform, correctedMatrix, new Cesium.Matrix4())

// ── 7. GUI 参数调节 ────────────────────────────────────────────
let currentOffset = { x: 0, y: 0, z: 10 }
let heading = 0

function updateTilesetTransform() {
  const center = tileset.boundingSphere.center
  const enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(center)

  const translation = Cesium.Matrix4.fromTranslation(
    new Cesium.Cartesian3(currentOffset.x, currentOffset.y, currentOffset.z)
  )

  // 添加旋转变换
  const rotationZ = Cesium.Matrix4.fromRotationZ(Cesium.Math.toRadians(heading))

  const transform = Cesium.Matrix4.multiply(
    enuTransform,
    Cesium.Matrix4.multiply(translation, rotationZ, new Cesium.Matrix4()),
    new Cesium.Matrix4()
  )

  tileset.modelMatrix = transform
}

// 模拟 GUI 更新
console.log('3D Tiles 偏移控制：')
console.log('- offsetX/Y/Z: 坐标偏移量（米）')
console.log('- heading: 绕 Z 轴旋转角度')
console.log('💡 modelMatrix 直接修改 4×4 变换矩阵')
console.log('💡 偏移量需在本地坐标系（ENU）下计算')

// ── 8. 飞行视角 ────────────────────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 300),
  duration: 2,
})

console.log('✓ 偏移纠正示例已启动')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['tileset.modelMatrix 变换矩阵修改', 'Transforms.eastNorthUpToFixedFrame 局部坐标系', 'Matrix4.multiplyByTranslation 平移', 'HeadingPitchRoll 旋转对齐'],
    points: ['modelMatrix 直接修改 4×4 变换矩阵', '偏移量需在本地坐标系（ENU）下计算', '可通过 GUI 实时调节偏移参数'],
  },
}
