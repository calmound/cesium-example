import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'snow-effect',
  title: '雪天特效',
  category: '场景与粒子',
  description: '通过 ParticleSystem 粒子系统模拟真实雪花飘落，使用 Canvas 动态生成雪花纹理，结合重力与随机侧漂实现自然飘雪效果。',
  tags: ['雪', '粒子系统', 'ParticleSystem', '天气'],
  level: 'medium',
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

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 2500),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-25), roll: 0 },
  duration: 1.5,
})

// ── 1. 冬日大气：偏白偏冷 ───────────────────────────────────────────────
viewer.scene.globe.atmosphereLightIntensity = 6.0
viewer.scene.globe.atmosphereMieAnisotropy = 0.92
viewer.scene.fog.enabled = true
viewer.scene.fog.density = 0.00008
viewer.scene.fog.minimumBrightness = 0.75
viewer.scene.fog.color = new Cesium.Color(0.90, 0.92, 0.95, 1.0)

// ── 2. 雪花 PostProcessStage GLSL ───────────────────────────────────────
// 原理与雨效相同：屏幕空间网格 + hash 随机定位 + time 驱动下落
// 雪花特点：① 速度慢  ② 横向左右飘移  ③ 粒子为软边圆形（非线条）
const snowStage = new Cesium.PostProcessStage({
  name: 'snow_effect',
  uniforms: {
    time:      () => performance.now() / 1000.0,
    intensity: 0.9,
    windX:     0.012,   // 水平风速（正=向右漂）
  },
  fragmentShader: \`
    uniform sampler2D colorTexture;
    uniform float time;
    uniform float intensity;
    uniform float windX;
    in vec2 v_textureCoordinates;

    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    // 绘制单层雪花，返回该像素亮度
    // UV Y=0 底部，Y=1 顶部；雪花从上(Y=1)向下(Y=0)落
    float snowLayer(vec2 uv, float speed, float scale, float seed) {
      vec2 grid   = uv * vec2(scale * 0.7, scale);
      vec2 cellId = floor(grid);
      vec2 cellUV = fract(grid);

      // 每个格子内雪花的固定横向位置
      float flakeX = hash21(cellId + seed);
      // 纵向位置随时间递减（向下落）
      float phase  = hash21(cellId + seed + 5.3);
      float flakeY = fract(phase - time * speed * 0.09);

      // 横向飘移：正弦波模拟风吹左右摇摆
      float driftSeed = hash21(cellId + seed + 11.7);
      float drift = sin(time * (0.4 + driftSeed * 0.6) + driftSeed * 6.28) * 0.12
                  + windX * time * speed * 0.4;
      // 加漂移后的横向中心，clamp 防止跑出格子
      float cx = clamp(flakeX + drift, 0.05, 0.95);

      // 到雪花中心的距离（略压扁，模拟正面视角的圆形雪花）
      float dx = (cellUV.x - cx) * 1.1;
      float dy =  cellUV.y - flakeY;
      float dist = sqrt(dx * dx + dy * dy);

      // 大小随 hash 略有差异（0.6x ~ 1.0x）
      float sizeFactor = 0.6 + hash21(cellId + seed + 3.1) * 0.4;
      float radius = 0.045 * sizeFactor;

      // 软圆形：核心亮，边缘羽化
      float flake = smoothstep(radius, radius * 0.3, dist);
      return flake;
    }

    void main() {
      vec4 baseColor = texture(colorTexture, v_textureCoordinates);
      vec2 uv = v_textureCoordinates;

      vec3 snowColor = vec3(0.95, 0.97, 1.0);  // 略带蓝调的白
      float snow = 0.0;

      // 5 层叠加：近层大而慢，远层小而快，产生景深感
      snow += snowLayer(uv, 1.0, 10.0,  0.00) * 1.0;   // 近景：大雪花慢落
      snow += snowLayer(uv, 1.3, 16.0,  4.27) * 0.85;
      snow += snowLayer(uv, 1.6, 24.0,  8.91) * 0.65;
      snow += snowLayer(uv, 2.0, 34.0, 13.50) * 0.45;
      snow += snowLayer(uv, 2.4, 48.0, 18.73) * 0.30;  // 远景：小雪花快落

      snow *= intensity;

      // 画面整体偏冷白（雪天光漫反射）
      vec3 brightened = mix(baseColor.rgb, vec3(0.92, 0.94, 0.97), 0.08);
      // 叠加雪花亮点
      vec3 result = mix(brightened, snowColor, clamp(snow * 0.75, 0.0, 0.55));

      out_FragColor = vec4(result, baseColor.a);
    }
  \`,
})

viewer.scene.postProcessStages.add(snowStage)

// ── 3. 地面积雪 overlay ──────────────────────────────────────────────────
viewer.entities.add({
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(115.5, 39.4, 117.2, 40.5),
    material: new Cesium.ColorMaterialProperty(new Cesium.Color(1, 1, 1, 0.22)),
    height: 5,
  },
})

console.log('❄️  雪天特效已启动（PostProcessStage GLSL 屏幕空间雪花）')
console.log('💡 intensity：0.5=小雪 / 0.9=中雪 / 1.5=暴雪')
console.log('💡 windX：正值向右飘，负值向左飘，0=无风直落')
console.log('💡 5 层叠加产生近大远小的景深透视感')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: [
      'PostProcessStage GLSL 屏幕空间雪花，无需 3D 粒子系统',
      '5 层叠加（近大远小），产生真实景深透视感',
      '正弦波横向漂移 + windX uniform 模拟风向',
      '软圆形 SDF（距离场）绘制雪花，边缘自然羽化',
      '尺寸随机变化（0.6x~1.0x），避免雪花大小一致的单调感',
    ],
    points: [
      'smoothstep(radius, radius*0.3, dist) 实现软圆形，核心亮边缘渐隐',
      '近层 scale 小（格子大/雪花大）速度慢；远层 scale 大速度快',
      'windX 累积偏移 = windX * time * speed * 0.4，速度快层漂移更明显',
      '画面整体向冷白色偏移 8%，营造雪天漫反射光感',
    ],
  },
}
