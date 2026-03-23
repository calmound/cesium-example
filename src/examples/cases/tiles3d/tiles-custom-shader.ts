import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-custom-shader',
  title: '3D Tiles CustomShader',
  category: '3D Tiles',
  description: '为 3D Tiles 数据集编写自定义 GLSL 着色器，实现扫描线、泛光、UV 动画等高级渲染效果。',
  tags: ['CustomShader', 'GLSL', '着色器'],
  level: 'hard',
  files: {
    'main.ts': `// 3D Tiles CustomShader 示例
// 演示为 3D Tiles 编写自定义 GLSL 着色器，实现扫描线、泛光等效果

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

// ── 2. 创建 CustomShader ───────────────────────────────────────
// 自定义片元着色器：实现扫描线效果
const scanlineShader = new Cesium.CustomShader({
  fragmentShaderText: \`
    void main() {
      // 获取片段位置
      vec3 position = czm_viewport.xyy;

      // 扫描线效果
      float scanline = sin(position.y * 0.1 + czm_currentTime * 2.0) * 0.5 + 0.5;

      // 基础颜色（从材质获取）
      vec4 color = czm_globeFragColor;

      // 添加扫描线
      color.rgb += vec3(scanline * 0.1);

      czm_globeFragColor = color;
    }
  \`,
  uniforms: {
    u_time: Cesium.ShaderTimeType,
  },
})

// ── 3. 泛光效果着色器 ──────────────────────────────────────────
const glowShader = new Cesium.CustomShader({
  fragmentShaderText: \`
    void main() {
      // 获取材质输入
      czm_materialInput materialInput;
      czm_materialOutput materialOutput;

      // 基础颜色
      materialOutput.diffuse = vec3(0.8, 0.8, 1.0);
      materialOutput.alpha = 0.9;

      // 边缘发光效果
      float edgeGlow = pow(1.0 - materialInput.attributes?.height / 300.0, 2.0);
      materialOutput.emission = vec3(0.2, 0.5, 1.0) * edgeGlow;
    }
  \`,
})

// ── 4. UV 动画着色器 ───────────────────────────────────────────
const uvAnimShader = new Cesium.CustomShader({
  fragmentShaderText: \`
    void main() {
      // 获取 UV 坐标
      vec2 uv = czm_viewport.xy / czm_viewport.z;

      // UV 动画
      float wave = sin(uv.y * 10.0 + czm_currentTime * 3.0) * 0.5 + 0.5;

      // 混合颜色
      vec3 color1 = vec3(0.2, 0.5, 1.0);
      vec3 color2 = vec3(1.0, 0.5, 0.2);
      vec3 finalColor = mix(color1, color2, wave);

      czm_globeFragColor = vec4(finalColor, 0.8);
    }
  \`,
  uniforms: {
    u_time: Cesium.ShaderTimeType,
  },
})

// ── 5. 应用着色器 ─────────────────────────────────────────────
// 当前使用的着色器
let currentShader = scanlineShader

tileset.customShader = currentShader

// ── 6. 动态更新 uniform ────────────────────────────────────────
let time = 0

viewer.scene.preRender.addEventListener(() => {
  time += 0.016

  // 更新 uniform 时间变量
  if (tileset.customShader) {
    // Cesium 会自动更新 czm_currentTime
  }
})

// ── 7. 着色器切换 ─────────────────────────────────────────────
const shaderOptions = {
  scanline: scanlineShader,
  glow: glowShader,
  uvAnim: uvAnimShader,
}

function switchShader(name: string) {
  if (shaderOptions[name as keyof typeof shaderOptions]) {
    currentShader = shaderOptions[name as keyof typeof shaderOptions]
    tileset.customShader = currentShader
    console.log(\`切换着色器: \${name}\`)
  }
}

// ── 8. GUI 控制面板 ───────────────────────────────────────────
console.log('3D Tiles CustomShader 控制：')
console.log('- scanline: 扫描线效果')
console.log('- glow: 泛光边缘效果')
console.log('- uvAnim: UV 坐标动画')
console.log('💡 CustomShader 替换内置 PBR 着色器')
console.log('💡 czm_material 结构体控制输出')
console.log('💡 czm_currentTime 获取 Cesium 时间')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 400),
  duration: 2,
})

console.log('✓ CustomShader 示例已启动')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CustomShader API 编写 GLSL', 'fragmentShaderText 片元着色器', 'uniformMap 传入 uniform 变量', '时间驱动的动态效果'],
    points: ['CustomShader 替换内置 PBR 着色器', 'czm_material 结构体控制输出', 'uniform 更新需在 render loop 中设置'],
  },
}
