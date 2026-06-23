import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-basic',
  title: '3D Tiles 基础加载',
  category: '3D Tiles',
  description: '以可见的细节切换、模式对比和点击反馈展示 3D Tiles 的核心价值：大尺度模型流式加载、精度控制和交互浏览。',
  tags: ['3DTiles', '流式加载', 'SSE'],
  level: 'medium',
  files: {
    'main.ts': `// 3D Tiles 分类入口案例
// 目标：让用户一眼看懂 3D Tiles 的加载、细节层次和基础交互

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
  viewer.imageryLayers.addImageryProvider(imageryProvider)

  viewer.scene.globe.depthTestAgainstTerrain = true
  viewer.scene.fxaa = true
  viewer.scene.postProcessStages.fxaa.enabled = true
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#08101c')
  viewer.scene.skyAtmosphere.show = true
  viewer.scene.fog.enabled = true
  viewer.scene.requestRenderMode = true

  const panel = document.createElement('div')
  panel.className = 'tiles-entry-panel'
  panel.innerHTML = \`
    <div class="panel-kicker">3D Tiles Entry</div>
    <h3>3D Tiles 基础加载</h3>
    <p class="panel-desc">用一个城市级模型，演示 3D Tiles 的流式加载、精度控制和浏览交互。</p>
    <div class="panel-status" data-role="status">正在连接瓦片服务...</div>

    <div class="panel-section">
      <div class="panel-label">细节精度（SSE）</div>
      <div class="chip-row">
        <button class="chip is-active" data-sse="6">精细</button>
        <button class="chip" data-sse="16">平衡</button>
        <button class="chip" data-sse="40">性能</button>
      </div>
      <input class="sse-slider" data-role="sse-slider" type="range" min="4" max="48" step="2" value="6" />
      <div class="panel-hint">数值越小，模型越精细，但加载和渲染开销更高。</div>
    </div>

    <div class="panel-section">
      <div class="panel-label">浏览模式</div>
      <div class="chip-row">
        <button class="chip is-active" data-style="original">原始纹理</button>
        <button class="chip" data-style="white">纯白体块</button>
        <button class="chip" data-style="wireframe">线框检查</button>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-label">当前指标</div>
      <div class="metric-grid">
        <div class="metric-card">
          <span class="metric-name">SSE</span>
          <strong data-role="metric-sse">6</strong>
        </div>
        <div class="metric-card">
          <span class="metric-name">模式</span>
          <strong data-role="metric-style">原始纹理</strong>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-label">点击反馈</div>
      <div class="selection-card" data-role="selection-card">点击建筑或模型表面，查看当前选中状态。</div>
    </div>
  \`
  container.appendChild(panel)

  const statusEl = panel.querySelector('[data-role="status"]')
  const selectionCardEl = panel.querySelector('[data-role="selection-card"]')
  const metricSseEl = panel.querySelector('[data-role="metric-sse"]')
  const metricStyleEl = panel.querySelector('[data-role="metric-style"]')
  const sliderEl = panel.querySelector('[data-role="sse-slider"]')

  const tileset = await Cesium.createOsmBuildingsAsync({
    maximumScreenSpaceError: 6,
    dynamicScreenSpaceError: true,
    skipLevelOfDetail: true,
    immediatelyLoadDesiredLevelOfDetail: false,
  })

  viewer.scene.primitives.add(tileset)
  viewer.scene.requestRender()

  let currentStyle = 'original'
  let selectedFeature = null
  let selectedFeatureColor = null

  const styleLabels = {
    original: '原始纹理',
    white: '纯白体块',
    wireframe: '线框检查',
  }

  const whiteboxStyle = new Cesium.Cesium3DTileStyle({
    color: "color('rgba(236,242,248,0.96)')",
  })

  function setStatus(text, variant) {
    statusEl.textContent = text
    statusEl.className = 'panel-status'
    if (variant) statusEl.classList.add(\`is-\${variant}\`)
  }

  function setSse(value) {
    tileset.maximumScreenSpaceError = value
    metricSseEl.textContent = String(value)
    sliderEl.value = String(value)
    setStatus(\`当前 SSE = \${value}，\${value <= 8 ? '细节最丰富' : value <= 20 ? '平衡浏览' : '偏性能模式'}\`, 'ready')
    viewer.scene.requestRender()
  }

  function setStyle(mode) {
    currentStyle = mode
    metricStyleEl.textContent = styleLabels[mode]
    tileset.debugWireframe = mode === 'wireframe'
    tileset.style = mode === 'white' || mode === 'wireframe' ? whiteboxStyle : undefined
    setStatus(\`已切换到\${styleLabels[mode]}\`, 'ready')
    viewer.scene.requestRender()
  }

  function clearSelection() {
    if (selectedFeature && selectedFeatureColor) {
      selectedFeature.color = selectedFeatureColor
    }
    selectedFeature = null
    selectedFeatureColor = null
  }

  function describeFeature(feature) {
    const propertyIds = typeof feature.getPropertyIds === 'function' ? feature.getPropertyIds() : []
    const heightKey = propertyIds.find((id) => /height/i.test(id))
    const levelKey = propertyIds.find((id) => /level|floor/i.test(id))
    const nameKey = propertyIds.find((id) => /name|id/i.test(id))

    const lines = [
      '<strong>已选中模型表面</strong>',
      \`模式：\${styleLabels[currentStyle]}\`,
      heightKey ? \`高度属性：\${feature.getProperty(heightKey)}\` : '高度属性：当前数据未暴露',
      levelKey ? \`楼层属性：\${feature.getProperty(levelKey)}\` : '楼层属性：当前数据未暴露',
      nameKey ? \`标识字段：\${feature.getProperty(nameKey)}\` : '标识字段：未读取到',
    ]

    selectionCardEl.innerHTML = lines.map((line) => \`<div>\${line}</div>\`).join('')
  }

  panel.querySelectorAll('[data-sse]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.getAttribute('data-sse'))
      panel.querySelectorAll('[data-sse]').forEach((item) => item.classList.remove('is-active'))
      button.classList.add('is-active')
      setSse(value)
    })
  })

  sliderEl.addEventListener('input', () => {
    const value = Number(sliderEl.value)
    panel.querySelectorAll('[data-sse]').forEach((item) => {
      item.classList.toggle('is-active', Number(item.getAttribute('data-sse')) === value)
    })
    setSse(value)
  })

  panel.querySelectorAll('[data-style]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-style')
      panel.querySelectorAll('[data-style]').forEach((item) => item.classList.remove('is-active'))
      button.classList.add('is-active')
      setStyle(mode)
    })
  })

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((movement) => {
    const picked = viewer.scene.pick(movement.position)

    clearSelection()

    if (!Cesium.defined(picked) || !(picked instanceof Cesium.Cesium3DTileFeature)) {
      selectionCardEl.textContent = '点击建筑或模型表面，查看当前选中状态。'
      viewer.scene.requestRender()
      return
    }

    selectedFeature = picked
    selectedFeatureColor = Cesium.Color.clone(picked.color, new Cesium.Color())
    picked.color = Cesium.Color.fromCssColorString('#7af4ff').withAlpha(0.9)
    describeFeature(picked)
    viewer.scene.requestRender()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-74.01215, 40.70685, 2200),
    orientation: {
      heading: Cesium.Math.toRadians(22),
      pitch: Cesium.Math.toRadians(-32),
      roll: 0,
    },
    duration: 2.4,
  })

  setStatus('模型已就绪，当前视角已定位到纽约下城建筑区。', 'ready')
  setStyle('original')
  setSse(6)

  console.log('✅ 3D Tiles 基础入口案例已加载')
  console.log('🏙️ 当前数据集：Cesium OSM Buildings（纽约下城）')
  console.log('🎛️ 可切换 SSE 精度模式与浏览模式')
  console.log('🖱️ 点击模型表面可以查看选中反馈')
}

boot().catch((error) => {
  console.error('3D Tiles 基础加载失败:', error)
})
`,
    'style.css': `.cesium-widget-credits {
  display: none !important;
}

#cesiumContainer {
  overflow: hidden;
}

.tiles-entry-panel {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 320px;
  padding: 16px;
  border: 1px solid rgba(127, 169, 201, 0.24);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(8, 19, 33, 0.94), rgba(4, 10, 18, 0.9));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  color: #f3f8fb;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  backdrop-filter: blur(12px);
  z-index: 10;
}

.panel-kicker {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(102, 191, 255, 0.14);
  color: #8fd8ff;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tiles-entry-panel h3 {
  margin: 10px 0 6px;
  font-size: 22px;
  line-height: 1.1;
}

.panel-desc {
  margin: 0 0 12px;
  color: rgba(222, 235, 245, 0.75);
  font-size: 13px;
  line-height: 1.55;
}

.panel-status {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(234, 244, 251, 0.82);
  font-size: 12px;
  line-height: 1.45;
}

.panel-status.is-ready {
  background: rgba(74, 153, 255, 0.15);
  color: #dff4ff;
}

.panel-section + .panel-section {
  margin-top: 14px;
}

.panel-label {
  margin-bottom: 8px;
  color: rgba(194, 214, 228, 0.78);
  font-size: 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid rgba(128, 164, 194, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #edf6fb;
  padding: 7px 11px;
  font-size: 12px;
  cursor: pointer;
  transition: 160ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  border-color: rgba(133, 212, 255, 0.46);
}

.chip.is-active {
  border-color: rgba(117, 220, 255, 0.7);
  background: linear-gradient(180deg, rgba(92, 183, 255, 0.3), rgba(54, 135, 255, 0.22));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.sse-slider {
  width: 100%;
  margin-top: 10px;
  accent-color: #73d8ff;
}

.panel-hint {
  margin-top: 6px;
  color: rgba(180, 198, 212, 0.74);
  font-size: 11px;
  line-height: 1.5;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-card {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
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

.selection-card {
  min-height: 86px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(234, 242, 247, 0.85);
  font-size: 12px;
  line-height: 1.55;
}
`,
  },
  guide: {
    features: ['Cesium3DTileset.fromUrl 加载城市级瓦片集', 'maximumScreenSpaceError 细节层次切换', '原始纹理 / 纯白体块 / 线框三种浏览模式', '点击模型表面给出选中反馈'],
    points: ['3D Tiles 适合大尺度模型的流式加载与分层细节调度', 'SSE 越小，建筑细节越丰富，但网络与渲染成本越高', '入口案例应先讲清 3D Tiles 的价值，再扩展到样式、Shader 和纠偏'],
  },
}
