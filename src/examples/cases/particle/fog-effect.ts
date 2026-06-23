import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'fog-effect',
  title: '大雾天气特效',
  category: '场景与粒子',
  description: '结合深度缓冲读取与 PostProcessStage GLSL 实现基于深度的指数型体积雾，支持高度衰减，真实还原低能见度雾天效果。',
  tags: ['雾', 'PostProcessStage', 'GLSL', '深度缓冲', '天气'],
  level: 'hard',
  files: {
    'main.ts': `\
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

// 低空水平视角：置身雾中，观察建筑群在雾中的层次消隐
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.385, 39.895, 280),
  orientation: {
    heading: Cesium.Math.toRadians(30),
    pitch: Cesium.Math.toRadians(-8),
    roll: 0,
  },
  duration: 1.5,
})

// ── 1. 内置雾配合大气压暗 ────────────────────────────────────────────────
viewer.scene.globe.atmosphereLightIntensity = 3.5
viewer.scene.fog.enabled = true
viewer.scene.fog.density = 0.00025
viewer.scene.fog.minimumBrightness = 0.55
viewer.scene.fog.color = new Cesium.Color(0.80, 0.82, 0.85, 1.0)

// ── 2. 体积雾 PostProcessStage ───────────────────────────────────────────
// 改进点：
//   · 天空像素不再直接跳过，改为混入雾色调（灰白雾天天空应偏白）
//   · 双层高度模型：贴地浓雾（0-500m）+ 中层稀雾（500-1500m）
//   · 3D 噪声扰动：世界坐标空间的 FBM 噪声让雾团有体积感
//   · 地平线暖色散射：接近水平方向时雾色偏暖白，模拟日光散射
const fogStage = new Cesium.PostProcessStage({
  name: 'volumetric_fog',
  uniforms: {
    fogDensity: 0.00028,
    fogColor:   new Cesium.Cartesian3(0.82, 0.85, 0.88),
    time:       () => performance.now() / 1000.0,
  },
  fragmentShader: \`
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform float fogDensity;
    uniform vec3  fogColor;
    uniform float time;
    in vec2 v_textureCoordinates;

    // ── 值噪声（3D hash） ─────────────────────────────────────────────────
    float hash3(vec3 p) {
      p = fract(p * vec3(0.1031, 0.1030, 0.0973));
      p += dot(p, p.yxz + 33.33);
      return fract((p.x + p.y) * p.z);
    }
    // 三线性插值的平滑噪声
    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash3(i),             hash3(i+vec3(1,0,0)), f.x),
            mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), f.x),
            mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), f.x), f.y),
        f.z
      );
    }
    // FBM（分形布朗运动）：叠加 3 倍频，让雾团有自然涌动感
    float fbm(vec3 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 3; i++) {
        v += a * noise3(p);
        p = p * 2.1 + vec3(1.7, 9.2, 5.4);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec4 baseColor = texture(colorTexture, v_textureCoordinates);
      float depth = czm_readDepth(depthTexture, v_textureCoordinates);

      // ── 天空处理：雾天天空应偏灰白，而非放过不处理 ─────────────────────
      if (depth >= 1.0) {
        // 天空与雾色混合 30%，营造低能见度感
        vec3 skyFog = mix(baseColor.rgb, fogColor * 1.05, 0.30);
        out_FragColor = vec4(skyFog, baseColor.a);
        return;
      }

      // ── 重建视图坐标与线性距离 ──────────────────────────────────────────
      vec4 eyeCoord = czm_windowToEyeCoordinates(
        vec4(gl_FragCoord.xy, depth, 1.0)
      );
      float dist = length(eyeCoord.xyz / eyeCoord.w);

      // ── 重建世界坐标与海拔高度 ──────────────────────────────────────────
      vec4 worldCoord = czm_inverseView * eyeCoord;
      vec3 worldPos   = worldCoord.xyz / worldCoord.w;
      float altitude  = length(worldPos) - 6378137.0;   // 近似海拔（m）

      // ── 双层高度权重 ────────────────────────────────────────────────────
      // 贴地浓雾：0~500m 线性满浓，500m 以上快速衰减
      float groundFog = clamp(1.0 - altitude / 500.0, 0.0, 1.0);
      groundFog = pow(groundFog, 0.6);
      // 中层稀雾：0~1500m 覆盖，高处稀薄
      float midFog = clamp(1.0 - altitude / 1500.0, 0.0, 1.0);
      midFog = pow(midFog, 2.5);
      // 取两层最大值，贴地层权重更高
      float heightFactor = clamp(groundFog * 1.3 + midFog * 0.4, 0.0, 1.0);

      // ── 3D 噪声扰动（雾团涌动） ──────────────────────────────────────────
      // 世界空间缩放（约 800m 一个噪声周期），X 轴缓慢漂移
      vec3 noiseCoord = worldPos * 0.00008 + vec3(time * 0.004, 0.0, time * 0.002);
      float turb = fbm(noiseCoord);
      // 噪声将密度在 0.6x ~ 1.5x 之间扰动
      float turbFactor = 0.60 + turb * 0.90;

      // ── 指数平方雾因子 ───────────────────────────────────────────────────
      float f = fogDensity * turbFactor * dist;
      float fogFactor = 1.0 - exp(-f * f);
      fogFactor = clamp(fogFactor * heightFactor, 0.0, 1.0);

      // ── 雾色：地平线方向偏暖（日光前向散射近似） ────────────────────────
      // v_textureCoordinates.y 越小 = 越靠近画面下方/地平线
      float horizonBias = clamp(1.0 - v_textureCoordinates.y * 1.8, 0.0, 1.0);
      vec3 warmFog = fogColor * vec3(1.06, 1.02, 0.97);   // 略暖
      vec3 coolFog = fogColor * vec3(0.96, 0.98, 1.02);   // 略冷（高处）
      vec3 finalFogColor = mix(coolFog, warmFog, horizonBias * 0.6);

      // ── 混合输出 ─────────────────────────────────────────────────────────
      vec3 result = mix(baseColor.rgb, finalFogColor, fogFactor);
      out_FragColor = vec4(result, baseColor.a);
    }
  \`,
})

viewer.scene.postProcessStages.add(fogStage)

// ── 3. 雾密度缓慢振荡（整体潮涌感） ─────────────────────────────────────
let t = 0
viewer.scene.preRender.addEventListener(() => {
  t += 0.003
  // 在 0.00020 ~ 0.00036 之间波动，波动周期约 35 秒
  fogStage.uniforms.fogDensity = 0.00028 + Math.sin(t) * 0.00008
})

// ── 4. 密集建筑群（5×5 网格）：展示雾中层次消隐 ─────────────────────────
// 沿摄像机朝向分布，远处建筑逐渐消失在雾中
const baseHeights = [60, 120, 200, 150, 80, 100, 180, 240, 90, 140]
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const lon = 116.388 + col * 0.006    // 东西方向间距 ~500m
    const lat = 39.892  + row * 0.005    // 南北方向间距 ~550m
    const h   = baseHeights[(row * 5 + col) % baseHeights.length]
    const gray = 0.48 + (row * 5 + col) % 7 * 0.04

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, h / 2),
      box: {
        dimensions: new Cesium.Cartesian3(55, 55, h),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.Color(gray, gray + 0.02, gray + 0.05, 0.92)
        ),
        outline: true,
        outlineColor: new Cesium.Color(0.3, 0.32, 0.35, 0.4),
      },
    })
  }
}

console.log('🌫️  大雾天气特效已启动')
console.log('📌 双层高度模型：贴地浓雾(0-500m) + 中层稀雾(0-1500m)')
console.log('📌 FBM 3D 噪声扰动密度，雾团有自然涌动体积感')
console.log('📌 天空像素混入雾色 30%，低能见度感更真实')
console.log('💡 fogDensity：0.0002=轻雾 / 0.0004=浓雾 / 0.0007=大雾')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: [
      'PostProcessStage GLSL 读取深度缓冲重建视图距离',
      '指数平方雾公式（exp2 fog）物理精度更高',
      '高度衰减因子：低空浓、高空淡的自然层化效果',
      '摄像机高度 uniform 实时更新，身临其境穿越雾层',
      '雾密度动画振荡：模拟雾气浓淡随时间变化',
    ],
    points: [
      'czm_readDepth 读取非线性深度，czm_windowToEyeCoordinates 转视图空间',
      '天空像素 depth==1.0 需提前返回，避免错误地给天空加雾',
      'czm_inverseView 将视图坐标变换回世界坐标，计算近似海拔高度',
      '指数平方雾比线性雾过渡更自然，和 OpenGL/游戏引擎标准一致',
    ],
  },
}
