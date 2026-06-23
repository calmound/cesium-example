import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-custom-shader',
  title: '3D Tiles CustomShader',
  category: '3D Tiles',
  description: '围绕城市级 3D Tiles 模型展示三种具有门面感的 CustomShader 方案：能量扫光、垂直脉冲和冷色夜景包裹。',
  tags: ['CustomShader', '3DTiles', '夜景渲染'],
  level: 'hard',
  files: {
    'main.ts': `// 3D Tiles 门面型 CustomShader 案例
// 目标：把 CustomShader 做成能直接截图的城市视觉效果，而不是零散 GLSL 片段

async function boot() {
  container.style.position = 'relative'

  const viewer = new Cesium.Viewer(container, {
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
  })
  viewerRef.current = viewer

  const imageryProvider = await Cesium.createWorldImageryAsync()
  viewer.imageryLayers.removeAll()
  const baseImagery = viewer.imageryLayers.addImageryProvider(imageryProvider)
  baseImagery.brightness = 0.34
  baseImagery.contrast = 1.18
  baseImagery.gamma = 0.82
  baseImagery.saturation = 0.28

  viewer.scene.globe.depthTestAgainstTerrain = true
  viewer.scene.postProcessStages.fxaa.enabled = true
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#040812')
  viewer.scene.skyAtmosphere.show = true
  viewer.scene.skyBox.show = false
  viewer.scene.highDynamicRange = true
  viewer.scene.fog.enabled = false
  viewer.scene.requestRenderMode = true
  viewer.clock.shouldAnimate = true

  const panel = document.createElement('div')
  panel.className = 'shader-showcase-panel'
  panel.innerHTML = \`
    <div class="panel-kicker">3D Tiles Shader Showcase</div>
    <h3>CustomShader 门面案例</h3>
    <p class="panel-desc">同一个城市模型，切换三种夜景视觉策略：能量扫光、垂直脉冲、冷色包裹。</p>
    <div class="panel-status" data-role="status">正在准备城市模型...</div>

    <div class="panel-section">
      <div class="panel-label">视觉模式</div>
      <div class="chip-row">
        <button class="chip is-active" data-mode="energy">能量扫光</button>
        <button class="chip" data-mode="pulse">垂直脉冲</button>
        <button class="chip" data-mode="frost">冷色夜景</button>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-label">发光强度</div>
      <input class="intensity-slider" data-role="intensity" type="range" min="0.4" max="2.6" step="0.1" value="1.4" />
      <div class="metric-row">
        <div class="metric-card">
          <span class="metric-name">当前模式</span>
          <strong data-role="mode-label">能量扫光</strong>
        </div>
        <div class="metric-card">
          <span class="metric-name">强度</span>
          <strong data-role="intensity-label">1.4x</strong>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-label">模式说明</div>
      <div class="info-card" data-role="mode-desc">从底部向上扫过的蓝青色能量带，适合做数字城市主视觉。</div>
    </div>
  \`
  container.appendChild(panel)

  const statusEl = panel.querySelector('[data-role="status"]')
  const intensitySliderEl = panel.querySelector('[data-role="intensity"]')
  const modeLabelEl = panel.querySelector('[data-role="mode-label"]')
  const intensityLabelEl = panel.querySelector('[data-role="intensity-label"]')
  const modeDescEl = panel.querySelector('[data-role="mode-desc"]')

  const tileset = await Cesium.createOsmBuildingsAsync({
    maximumScreenSpaceError: 8,
    dynamicScreenSpaceError: true,
    skipLevelOfDetail: true,
  })

  tileset.style = new Cesium.Cesium3DTileStyle({
    color: "color('rgba(24, 33, 48, 0.92)')",
  })
  viewer.scene.primitives.add(tileset)

  let shaderTime = 0
  let intensity = 1.4

  const modeMeta = {
    energy: {
      label: '能量扫光',
      desc: '从底部向上扫过的蓝青色能量带，适合做数字城市主视觉。',
    },
    pulse: {
      label: '垂直脉冲',
      desc: '高度分层叠加节奏性脉冲，让建筑群看起来像正在通电的设备矩阵。',
    },
    frost: {
      label: '冷色夜景',
      desc: '整体压低底色，只保留冷色边缘和顶部泛光，适合表现夜景科技氛围。',
    },
  }

  function setStatus(text) {
    statusEl.textContent = text
  }

  function createEnergyShader() {
    return new Cesium.CustomShader({
      mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
      uniforms: {
        u_time: {
          type: Cesium.UniformType.FLOAT,
          value: 0,
        },
        u_intensity: {
          type: Cesium.UniformType.FLOAT,
          value: intensity,
        },
      },
      fragmentShaderText: \`
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          vec3 positionMC = fsInput.attributes.positionMC;
          float heightBand = fract((positionMC.z * 0.018) - u_time * 0.32);
          float sweep = smoothstep(0.05, 0.24, heightBand) * (1.0 - smoothstep(0.24, 0.42, heightBand));
          float edge = pow(1.0 - abs(fsInput.attributes.normalEC.z), 2.2);
          vec3 base = mix(vec3(0.015, 0.03, 0.055), vec3(0.02, 0.09, 0.16), clamp(positionMC.z * 0.0032, 0.0, 1.0));
          vec3 glow = vec3(0.12, 0.88, 1.0) * (sweep * 2.4 + edge * 0.72) * u_intensity;
          material.diffuse = mix(material.diffuse, base + glow * 0.12, 0.94);
          material.emissive += glow * 1.2;
          material.alpha = 1.0;
        }
      \`,
    })
  }

  function createPulseShader() {
    return new Cesium.CustomShader({
      mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
      uniforms: {
        u_time: {
          type: Cesium.UniformType.FLOAT,
          value: 0,
        },
        u_intensity: {
          type: Cesium.UniformType.FLOAT,
          value: intensity,
        },
      },
      fragmentShaderText: \`
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          vec3 positionMC = fsInput.attributes.positionMC;
          float stripes = 0.5 + 0.5 * sin(positionMC.z * 0.11 - u_time * 3.1);
          float pulse = 0.5 + 0.5 * sin(positionMC.z * 0.035 + u_time * 4.2);
          float roofGlow = smoothstep(55.0, 160.0, positionMC.z);
          vec3 lowColor = vec3(0.025, 0.04, 0.08);
          vec3 highColor = vec3(0.16, 0.28, 0.82);
          vec3 base = mix(lowColor, highColor, clamp(positionMC.z / 160.0, 0.0, 1.0));
          vec3 pulseColor = mix(vec3(0.0, 0.9, 1.0), vec3(0.35, 0.5, 1.0), stripes);
          vec3 emissive = pulseColor * (pulse * 1.25 + roofGlow * 0.62) * u_intensity;
          material.diffuse = mix(material.diffuse, base + emissive * 0.08, 0.9);
          material.emissive += emissive * 1.1;
          material.alpha = 1.0;
        }
      \`,
    })
  }

  function createFrostShader() {
    return new Cesium.CustomShader({
      mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
      uniforms: {
        u_time: {
          type: Cesium.UniformType.FLOAT,
          value: 0,
        },
        u_intensity: {
          type: Cesium.UniformType.FLOAT,
          value: intensity,
        },
      },
      fragmentShaderText: \`
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          vec3 positionMC = fsInput.attributes.positionMC;
          float edge = pow(1.0 - abs(fsInput.attributes.normalEC.z), 3.2);
          float roof = smoothstep(48.0, 155.0, positionMC.z);
          float shimmer = 0.5 + 0.5 * sin(u_time * 2.0 + positionMC.x * 0.02 + positionMC.y * 0.015);
          vec3 base = mix(vec3(0.01, 0.02, 0.04), vec3(0.03, 0.06, 0.095), roof);
          vec3 rim = vec3(0.62, 0.9, 1.0) * edge * (1.15 + shimmer * 0.45);
          vec3 roofGlow = vec3(0.3, 0.78, 1.0) * roof * 0.82;
          vec3 emissive = (rim + roofGlow) * u_intensity;
          material.diffuse = mix(material.diffuse, base + emissive * 0.06, 0.92);
          material.emissive += emissive * 1.18;
          material.alpha = 0.98;
        }
      \`,
    })
  }

  const shaders = {
    energy: createEnergyShader(),
    pulse: createPulseShader(),
    frost: createFrostShader(),
  }

  let currentMode = 'energy'

  function syncShaderUniforms() {
    Object.values(shaders).forEach((shader) => {
      shader.setUniform('u_time', shaderTime)
      shader.setUniform('u_intensity', intensity)
    })
  }

  function applyMode(mode) {
    currentMode = mode
    tileset.customShader = shaders[mode]
    modeLabelEl.textContent = modeMeta[mode].label
    modeDescEl.textContent = modeMeta[mode].desc
    setStatus(\`当前效果：\${modeMeta[mode].label}\`)
    viewer.scene.requestRender()
  }

  panel.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-mode')
      panel.querySelectorAll('[data-mode]').forEach((item) => item.classList.remove('is-active'))
      button.classList.add('is-active')
      applyMode(mode)
    })
  })

  intensitySliderEl.addEventListener('input', () => {
    intensity = Number(intensitySliderEl.value)
    intensityLabelEl.textContent = \`\${intensity.toFixed(1)}x\`
    syncShaderUniforms()
    setStatus(\`\${modeMeta[currentMode].label} 强度已调到 \${intensity.toFixed(1)}x\`)
    viewer.scene.requestRender()
  })

  viewer.scene.preRender.addEventListener((scene, time) => {
    shaderTime = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime)
    syncShaderUniforms()
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-74.0108, 40.7071, 780),
    orientation: {
      heading: Cesium.Math.toRadians(18),
      pitch: Cesium.Math.toRadians(-18),
      roll: 0,
    },
    duration: 2.6,
  })

  applyMode('energy')
  syncShaderUniforms()
  intensityLabelEl.textContent = \`\${intensity.toFixed(1)}x\`
  setStatus('模型已就绪，当前视角已定位到纽约下城高层建筑区。')

  console.log('✅ 3D Tiles CustomShader 门面案例已加载')
  console.log('🌃 三种模式：能量扫光 / 垂直脉冲 / 冷色夜景')
  console.log('🎛️ 支持实时切换模式和发光强度')
}

boot().catch((error) => {
  console.error('3D Tiles CustomShader 加载失败:', error)
  console.info('提示：当前案例已切换为 Cesium OSM Buildings 数据源，如仍失败，通常是 Ion token 或外网访问受限。')
})
`,
    'style.css': `.cesium-widget-credits {
  display: none !important;
}

#cesiumContainer {
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(44, 88, 135, 0.24), transparent 55%),
    linear-gradient(180deg, #02050c, #050a14 55%, #03060d);
}

.shader-showcase-panel {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 330px;
  padding: 16px;
  border: 1px solid rgba(116, 188, 255, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(4, 9, 18, 0.94), rgba(7, 15, 26, 0.9));
  color: #eef7ff;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.panel-kicker {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(92, 184, 255, 0.12);
  color: #8ad8ff;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shader-showcase-panel h3 {
  margin: 10px 0 6px;
  font-size: 22px;
  line-height: 1.15;
}

.panel-desc {
  margin: 0 0 12px;
  color: rgba(217, 232, 246, 0.76);
  font-size: 13px;
  line-height: 1.55;
}

.panel-status,
.info-card,
.metric-card {
  background: rgba(255, 255, 255, 0.05);
}

.panel-status {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  color: rgba(235, 244, 250, 0.86);
  font-size: 12px;
  line-height: 1.45;
}

.panel-section + .panel-section {
  margin-top: 14px;
}

.panel-label {
  margin-bottom: 8px;
  color: rgba(184, 204, 221, 0.76);
  font-size: 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid rgba(120, 170, 214, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #eef7ff;
  padding: 7px 11px;
  font-size: 12px;
  cursor: pointer;
  transition: 160ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  border-color: rgba(122, 220, 255, 0.38);
}

.chip.is-active {
  border-color: rgba(124, 234, 255, 0.55);
  background: linear-gradient(180deg, rgba(62, 155, 255, 0.32), rgba(28, 97, 204, 0.2));
}

.intensity-slider {
  width: 100%;
  accent-color: #6fd9ff;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.metric-card {
  padding: 12px;
  border-radius: 14px;
}

.metric-name {
  display: block;
  margin-bottom: 6px;
  color: rgba(194, 214, 228, 0.72);
  font-size: 11px;
}

.metric-card strong {
  font-size: 18px;
  font-weight: 600;
}

.info-card {
  min-height: 82px;
  padding: 12px;
  border-radius: 14px;
  color: rgba(233, 243, 250, 0.84);
  font-size: 12px;
  line-height: 1.58;
}
`,
  },
  guide: {
    features: ['CustomShader 直接接管 3D Tiles 材质输出', '通过 positionMC 和 normalEC 生成扫光、脉冲、边缘泛光', 'uniform 实时驱动时间和强度变化', '同一模型切换多种门面级视觉策略'],
    points: ['门面案例的重点是结果可感知，而不是堆砌 GLSL 语法', 'CustomShader 适合做建筑表面动态扫描、边缘发光和高度分层效果', '同组案例应区分职责：基础加载讲清价值，CustomShader 负责视觉上限'],
  },
}
