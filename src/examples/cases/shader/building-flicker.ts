import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'building-flicker',
  title: '建筑扫光 CustomShader',
  category: '材质与Shader',
  description: '为建筑 3D Tiles 添加由下至上的扫光动画，通过 CustomShader 修改建筑颜色与发光强度实现科技感效果。',
  tags: ['扫光', '建筑', 'CustomShader'],
  level: 'hard',
  files: {
    'main.ts': `// 建筑扫光 CustomShader 示例
// 注意：CustomShader 需要挂在 Model / Cesium3DTileset 上，普通 Entity.box 不支持 customShader。

async function boot() {
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
  const baseLayer = viewer.imageryLayers.addImageryProvider(imageryProvider)
  baseLayer.brightness = 0.4
  baseLayer.contrast = 1.12
  baseLayer.saturation = 0.3

  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#030711')
  viewer.scene.highDynamicRange = true
  viewer.scene.postProcessStages.fxaa.enabled = true
  viewer.scene.globe.depthTestAgainstTerrain = true
  viewer.scene.requestRenderMode = true
  viewer.clock.shouldAnimate = true

  const tileset = await Cesium.createOsmBuildingsAsync({
    maximumScreenSpaceError: 8,
    dynamicScreenSpaceError: true,
    skipLevelOfDetail: true,
  })

  tileset.style = new Cesium.Cesium3DTileStyle({
    color: "color('rgba(18, 28, 40, 0.94)')",
  })

  const shader = new Cesium.CustomShader({
    mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
    uniforms: {
      u_time: {
        type: Cesium.UniformType.FLOAT,
        value: 0,
      },
      u_scanWidth: {
        type: Cesium.UniformType.FLOAT,
        value: 0.16,
      },
      u_glowStrength: {
        type: Cesium.UniformType.FLOAT,
        value: 1.35,
      },
    },
    fragmentShaderText: \`
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        vec3 positionMC = fsInput.attributes.positionMC;
        vec3 normalEC = fsInput.attributes.normalEC;

        float heightRatio = clamp(positionMC.z / 220.0, 0.0, 1.0);
        float sweepHead = fract(u_time * 0.22);
        float sweepBand = fract(heightRatio - sweepHead + 1.0);
        float sweep = smoothstep(0.0, u_scanWidth, sweepBand) * (1.0 - smoothstep(u_scanWidth, u_scanWidth * 2.1, sweepBand));

        float edge = pow(1.0 - abs(normalEC.z), 2.4);
        float roofGlow = smoothstep(0.72, 1.0, heightRatio);

        vec3 baseColor = mix(vec3(0.02, 0.035, 0.06), vec3(0.04, 0.1, 0.18), heightRatio);
        vec3 scanColor = vec3(0.0, 0.95, 1.0) * sweep * 2.2;
        vec3 rimColor = vec3(0.18, 0.72, 1.0) * edge * 0.55;
        vec3 topColor = vec3(0.08, 0.55, 0.95) * roofGlow * 0.35;

        vec3 emissive = (scanColor + rimColor + topColor) * u_glowStrength;

        material.diffuse = mix(material.diffuse, baseColor + emissive * 0.08, 0.94);
        material.emissive += emissive;
        material.alpha = 1.0;
      }
    \`,
  })

  tileset.customShader = shader
  viewer.scene.primitives.add(tileset)

  viewer.scene.preRender.addEventListener((scene, time) => {
    const seconds = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime)
    shader.setUniform('u_time', seconds)
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.3975, 39.9085, 900),
    orientation: {
      heading: Cesium.Math.toRadians(-25),
      pitch: Cesium.Math.toRadians(-28),
      roll: 0,
    },
    duration: 2.4,
    complete: () => console.log('🏢 建筑扫光 CustomShader 已启动'),
  })

  console.log('💡 当前示例已改为真实的 3D Tiles CustomShader')
  console.log('🌃 扫光基于建筑模型高度比例自下而上循环播放')
}

boot().catch((error) => {
  console.error('建筑扫光加载失败:', error)
  console.info('提示：OSM Buildings 依赖 Cesium ion token 和外网访问。')
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CustomShader 实现扫光效果', '时间驱动扫光位置', '建筑轮廓边缘发光', '夜景模式与白天模式切换'],
    points: ['扫光位置通过世界坐标高度判断', 'fract(time) 实现循环扫光', 'emissiveColor 不受光照影响'],
  },
}
