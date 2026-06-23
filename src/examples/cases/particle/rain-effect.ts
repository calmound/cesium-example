import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'rain-effect',
  title: '雨天特效',
  category: '场景与粒子',
  description: '使用 PostProcessStage 自定义 GLSL 着色器实现屏幕空间雨滴条纹动画，配合大气昏暗、场景雾效模拟真实暴雨视觉。',
  tags: ['雨', 'PostProcessStage', 'GLSL', '天气'],
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

// 飞到北京上空，中等高度以便观察雨效
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 3000),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-30), roll: 0 },
  duration: 1.5,
})

// ── 1. 大气与场景配置：模拟阴天昏暗效果 ────────────────────────────────
viewer.scene.globe.atmosphereLightIntensity = 5.0
viewer.scene.globe.atmosphereMieAnisotropy = 0.95

// 浅灰色雾气，增加景深感
viewer.scene.fog.enabled = true
viewer.scene.fog.density = 0.00015
viewer.scene.fog.minimumBrightness = 0.5
viewer.scene.fog.color = new Cesium.Color(0.65, 0.67, 0.70, 1.0)

// ── 2. 雨滴 PostProcessStage GLSL 着色器 ────────────────────────────────
// 技术原理：在屏幕空间将画面划分为网格，每格内用 hash 函数随机放置
// 一条垂直雨丝，利用 time uniform 驱动雨丝向下流动。
// 多层叠加（近→远）产生景深视差感。
const rainStage = new Cesium.PostProcessStage({
  name: 'rain_effect',
  uniforms: {
    // 运行时间（秒），驱动雨滴动画
    time: () => performance.now() / 1000.0,
    // 雨量强度 0~1
    intensity: 0.85,
    // 雨滴倾斜角度（弧度），模拟侧风
    windAngle: Cesium.Math.toRadians(-12),
  },
  fragmentShader: \`
    uniform sampler2D colorTexture;
    uniform float time;
    uniform float intensity;
    uniform float windAngle;
    in vec2 v_textureCoordinates;

    // 简单 2D 哈希，用于在网格中随机放置雨滴
    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    // 绘制单层雨丝，返回该像素的雨滴亮度
    // UV 坐标系：Y=0 屏幕底部，Y=1 屏幕顶部
    // 雨从上（Y=1）落向下（Y=0），dropY 随时间递减
    float rainLayer(vec2 uv, float speed, float scale, float seed) {
      // 以 windAngle 旋转 UV，使雨丝倾斜（模拟侧风）
      float cosA = cos(windAngle), sinA = sin(windAngle);
      vec2 ruv = vec2(uv.x * cosA - uv.y * sinA,
                      uv.x * sinA + uv.y * cosA);

      // 缩放到当前层级的格子坐标（X 格子更窄，Y 格子更高）
      // 注意：不对 grid.y 做时间偏移，避免整个网格反向滚动
      vec2 grid = ruv * vec2(scale * 0.4, scale);

      vec2 cellId  = floor(grid);
      vec2 cellUV  = fract(grid);

      // 在格子内随机横向位置（每格固定，不随时间变化）
      float dropX = hash21(cellId + seed);
      // 雨滴垂直位置：fract(phase - time*...) 随时间递减
      // 递减 = UV-Y 减小 = 屏幕上向下移动 = 正确的下落方向
      float phase = hash21(cellId + seed + 7.3);
      float dropY = fract(phase - time * speed * 0.55);

      // 横向距离：控制雨丝宽度
      float dx = abs(cellUV.x - dropX);
      // dy > 0 表示当前像素在雨滴头部上方（UV-Y 更大 = 屏幕更高）
      // 尾迹在头部上方（雨从上落下，已经过的路径在上面）
      float dy = cellUV.y - dropY;

      float streak =
        smoothstep(0.022, 0.0, dx)          // 横向细线宽度
        * smoothstep(-0.02, 0.03, dy)       // 头部：在头稍下方开始渐入
        * max(0.0, 1.0 - dy / 0.38);        // 尾迹：从头部向上线性衰减

      return streak;
    }

    void main() {
      vec4 baseColor = texture(colorTexture, v_textureCoordinates);
      vec2 uv = v_textureCoordinates;

      // 雨滴颜色：带蓝色调的半透明白
      vec3 rainColor = vec3(0.75, 0.82, 0.92);
      float rain = 0.0;

      // 叠加 6 层，不同速度/密度模拟近中远层次感
      rain += rainLayer(uv, 2.2, 40.0,  0.00) * 0.9;
      rain += rainLayer(uv, 1.8, 28.0,  3.71) * 0.7;
      rain += rainLayer(uv, 1.5, 18.0,  7.53) * 0.55;
      rain += rainLayer(uv, 1.2, 12.0, 11.20) * 0.4;
      rain += rainLayer(uv, 0.9,  8.0, 15.88) * 0.3;
      rain += rainLayer(uv, 0.7,  5.0, 19.40) * 0.2;

      rain *= intensity;

      // 整体画面略微压暗（阴雨天亮度下降）
      vec3 darken = baseColor.rgb * 0.78;
      // 混入雨丝亮度
      vec3 result = mix(darken, rainColor, clamp(rain * 0.6, 0.0, 0.45));

      out_FragColor = vec4(result, baseColor.a);
    }
  \`,
})

viewer.scene.postProcessStages.add(rainStage)

// ── 3. 雷声提示（控制台模拟） ───────────────────────────────────────────
let thunderTimer = 0
viewer.scene.preRender.addEventListener((scene, time) => {
  thunderTimer += 0.016
  if (thunderTimer > 8 + Math.random() * 12) {
    thunderTimer = 0
    console.log('⚡ 雷声：' + (Math.random() > 0.5 ? '远雷低鸣...' : '近雷轰鸣！'))
  }
})

console.log('🌧️  雨天特效已启动')
console.log('📌 PostProcessStage GLSL 实现屏幕空间雨丝动画')
console.log('💡 intensity uniform 可动态调节雨量：0（小雨） → 1（暴雨）')
console.log('💡 windAngle uniform 可调节雨丝倾斜角度，模拟侧风方向')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: [
      'PostProcessStage 自定义 GLSL 实现屏幕空间雨丝',
      '多层雨丝叠加（6层）模拟近中远景深视差',
      '随机 hash 函数控制雨滴位置与速度相位',
      '侧风角度旋转 UV 实现倾斜雨效',
      'scene.fog 配合大气参数模拟阴雨天氛围',
    ],
    points: [
      '雨丝用屏幕空间方案（PostProcessStage）比 3D 粒子性能更优',
      'intensity / windAngle 均为 uniform，可在运行时动态修改',
      '多层叠加时近层速度快、密度高，远层速度慢、密度低',
      'fog.minimumBrightness 防止画面过暗失去细节',
    ],
  },
}
