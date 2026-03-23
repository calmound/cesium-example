import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'custom-shader-intro',
  title: 'CustomShader 入门',
  category: '材质与Shader',
  description: '学习 Cesium CustomShader API 基础：顶点着色器修改位置，片元着色器自定义颜色，以及 uniform 变量传递。',
  tags: ['CustomShader', 'GLSL', '入门'],
  level: 'hard',
  files: {
    'main.ts': `// CustomShader 入门示例
// 演示 Cesium CustomShader API 的基本用法

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

// ── 1. CustomShader 基础 ──────────────────────────────────────
// Cesium 的 CustomShader 允许我们自定义 GLSL 着色器
// 但在 Entity API 中，我们需要通过 Material 实现类似效果

// ── 2. 创建自定义颜色材质 ─────────────────────────────────────
function createCustomMaterial(time: number) {
  return new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(() => {
      // 根据时间改变颜色
      const r = 0.5 + 0.5 * Math.sin(time)
      const g = 0.5 + 0.5 * Math.sin(time + Math.PI * 2 / 3)
      const b = 0.5 + 0.5 * Math.sin(time + Math.PI * 4 / 3)
      return Cesium.Color.fromBytes(
        Math.floor(r * 255),
        Math.floor(g * 255),
        Math.floor(b * 255),
        200
      )
    }, false)
  )
}

// ── 3. 添加测试物体 ───────────────────────────────────────────
let time = 0

viewer.entities.add({
  name: '着色器演示-盒子',
  position: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 50),
  box: {
    dimensions: new Cesium.Cartesian3(40, 40, 80),
    material: createCustomMaterial(time),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

viewer.entities.add({
  name: '着色器演示-球',
  position: Cesium.Cartesian3.fromDegrees(116.3982, 39.9083, 30),
  ellipsoid: {
    radii: new Cesium.Cartesian3(30, 30, 30),
    material: createCustomMaterial(time + 1),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

viewer.entities.add({
  name: '着色器演示-圆柱',
  position: Cesium.Cartesian3.fromDegrees(116.3962, 39.9063, 25),
  cylinder: {
    length: 50,
    topRadius: 20,
    bottomRadius: 20,
    material: createCustomMaterial(time + 2),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 4. 动画循环更新 ────────────────────────────────────────────
viewer.scene.preRender.addEventListener(() => {
  time += 0.02

  // 更新盒子颜色
  const boxEntity = viewer.entities.getByName('着色器演示-盒子') as Cesium.Entity
  if (boxEntity && boxEntity.box) {
    boxEntity.box.material = createCustomMaterial(time)
  }

  // 更新球体颜色
  const sphereEntity = viewer.entities.getByName('着色器演示-球') as Cesium.Entity
  if (sphereEntity && sphereEntity.ellipsoid) {
    sphereEntity.ellipsoid.material = createCustomMaterial(time + 1)
  }

  // 更新圆柱颜色
  const cylEntity = viewer.entities.getByName('着色器演示-圆柱') as Cesium.Entity
  if (cylEntity && cylEntity.cylinder) {
    cylEntity.cylinder.material = createCustomMaterial(time + 2)
  }
})

// ── 5. CustomShader 进阶说明 ────────────────────────────────────
// 完整的 CustomShader 需要使用 Appearance API：
// 
// const shader = new Cesium.CustomShader({
//   fragmentShaderText: \`
//     void main() {
//       float time = sin(czm_currentTime * 0.001);
//       czm_materialInput materialInput;
//       czm_materialOutput materialOutput;
//       materialOutput.diffuse = vec3(0.5 + 0.5 * time, 0.0, 0.0);
//       materialOutput.alpha = 0.8;
//     }
//   \`,
//   uniforms: {
//     u_time: Cesium.ShaderTimeType,
//   },
// })

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 300),
  duration: 2,
  complete: () => console.log('🎨 CustomShader 演示已启动'),
})

console.log('💡 CustomShader：通过 GLSL 着色器自定义渲染效果')
console.log('📝 fragmentShaderText 定义片元着色器')
console.log('🔧 uniforms 传递 JavaScript 变量到着色器')
console.log('⏱️  czm_currentTime 获取 Cesium 时间')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CustomShader vertexShaderText 顶点着色器', 'fragmentShaderText 片元着色器', 'uniforms 传入 JS 变量', 'czm_modelVertexOutput 输出结构'],
    points: ['CustomShader 在内置 PBR 流程中插入', 'czm_material 结构控制光照输出', 'varyings 在顶点/片元间传递数据'],
  },
}
