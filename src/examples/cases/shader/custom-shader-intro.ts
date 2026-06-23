import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'custom-shader-intro',
  title: 'CustomShader 入门',
  category: '材质与Shader',
  description: '使用一个内嵌 glTF 盒子模型演示 Cesium CustomShader：vertexMain 轻微位移，fragmentMain 做高度渐变与脉冲发光，理解 uniforms 与 varyings 的基础用法。',
  tags: ['CustomShader', 'GLSL', '入门'],
  level: 'hard',
  files: {
    'main.ts': `// CustomShader 入门示例
// 目标：使用真正的 Cesium.CustomShader 改写 Model 的顶点和片元阶段

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
    baseLayer: new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: 'OpenStreetMap contributors',
      })
    ),
  })
  viewerRef.current = viewer

  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#08111f')
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#08111f')
  viewer.scene.fog.enabled = false
  viewer.scene.skyAtmosphere.show = false
  viewer.scene.postProcessStages.fxaa.enabled = true

  function bytesToBase64(bytes) {
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j])
      }
    }
    return btoa(binary)
  }

  function buildIntroModelDataUri() {
    const faces = [
      { normal: [0, 1, 0], corners: [[-1, 1, -3], [1, 1, -3], [1, 1, 3], [-1, 1, 3]] },
      { normal: [0, -1, 0], corners: [[1, -1, -3], [-1, -1, -3], [-1, -1, 3], [1, -1, 3]] },
      { normal: [1, 0, 0], corners: [[1, 1, -3], [1, -1, -3], [1, -1, 3], [1, 1, 3]] },
      { normal: [-1, 0, 0], corners: [[-1, -1, -3], [-1, 1, -3], [-1, 1, 3], [-1, -1, 3]] },
      { normal: [0, 0, 1], corners: [[-1, 1, 3], [1, 1, 3], [1, -1, 3], [-1, -1, 3]] },
      { normal: [0, 0, -1], corners: [[-1, -1, -3], [1, -1, -3], [1, 1, -3], [-1, 1, -3]] },
    ]

    const positions = []
    const normals = []
    const indices = []

    faces.forEach((face, faceIndex) => {
      const startIndex = faceIndex * 4
      face.corners.forEach((corner) => {
        positions.push(corner[0], corner[1], corner[2])
        normals.push(face.normal[0], face.normal[1], face.normal[2])
      })
      indices.push(
        startIndex,
        startIndex + 1,
        startIndex + 2,
        startIndex,
        startIndex + 2,
        startIndex + 3
      )
    })

    const positionArray = new Float32Array(positions)
    const normalArray = new Float32Array(normals)
    const indexArray = new Uint16Array(indices)
    const binary = new Uint8Array(
      positionArray.byteLength + normalArray.byteLength + indexArray.byteLength
    )

    binary.set(new Uint8Array(positionArray.buffer), 0)
    binary.set(new Uint8Array(normalArray.buffer), positionArray.byteLength)
    binary.set(
      new Uint8Array(indexArray.buffer),
      positionArray.byteLength + normalArray.byteLength
    )

    const gltf = {
      asset: {
        version: '2.0',
        generator: 'cesium-example-custom-shader-intro',
      },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [
        {
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1,
              },
              indices: 2,
              material: 0,
            },
          ],
        },
      ],
      materials: [
        {
          doubleSided: true,
          pbrMetallicRoughness: {
            baseColorFactor: [0.16, 0.42, 0.78, 1.0],
            metallicFactor: 0.08,
            roughnessFactor: 0.58,
          },
        },
      ],
      buffers: [
        {
          uri: \`data:application/octet-stream;base64,\${bytesToBase64(binary)}\`,
          byteLength: binary.byteLength,
        },
      ],
      bufferViews: [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: positionArray.byteLength,
          target: 34962,
        },
        {
          buffer: 0,
          byteOffset: positionArray.byteLength,
          byteLength: normalArray.byteLength,
          target: 34962,
        },
        {
          buffer: 0,
          byteOffset: positionArray.byteLength + normalArray.byteLength,
          byteLength: indexArray.byteLength,
          target: 34963,
        },
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 24,
          type: 'VEC3',
          min: [-1, -1, -3],
          max: [1, 1, 3],
        },
        {
          bufferView: 1,
          componentType: 5126,
          count: 24,
          type: 'VEC3',
        },
        {
          bufferView: 2,
          componentType: 5123,
          count: 36,
          type: 'SCALAR',
        },
      ],
    }

    return URL.createObjectURL(
      new Blob([JSON.stringify(gltf)], { type: 'model/gltf+json' })
    )
  }

  const shader = new Cesium.CustomShader({
    mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
    uniforms: {
      u_time: {
        type: Cesium.UniformType.FLOAT,
        value: 0,
      },
      u_strength: {
        type: Cesium.UniformType.FLOAT,
        value: 1.0,
      },
    },
    varyings: {
      v_height: Cesium.VaryingType.FLOAT,
    },
    vertexShaderText: \`
      void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
        float height = clamp((vsInput.attributes.positionMC.z + 3.0) / 6.0, 0.0, 1.0);
        v_height = height;

        float lift = sin(u_time * 2.2 + height * 8.0) * 0.02 * u_strength;
        vsOutput.positionMC += vsInput.attributes.normal * lift;
      }
    \`,
    fragmentShaderText: \`
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        float pulse = 0.5 + 0.5 * sin(u_time * 3.2 + v_height * 10.0);
        float rim = pow(1.0 - abs(fsInput.attributes.normalEC.z), 2.0);

        vec3 lowColor = vec3(0.05, 0.12, 0.22);
        vec3 highColor = vec3(0.12, 0.72, 1.0);
        vec3 gradient = mix(lowColor, highColor, v_height);
        vec3 scanColor = vec3(0.0, 0.95, 1.0) * (0.25 + pulse * 0.75);

        material.diffuse = mix(material.diffuse, gradient + scanColor * 0.12, 0.9);
        material.emissive += scanColor * 0.85 + rim * vec3(0.08, 0.35, 0.65);
        material.alpha = 1.0;
      }
    \`,
  })

  const modelUrl = buildIntroModelDataUri()
  try {
    const model = await Cesium.Model.fromGltfAsync({
      url: modelUrl,
      scene: viewer.scene,
      scale: 48,
      minimumPixelSize: 120,
      allowPicking: false,
      customShader: shader,
    })
    viewer.scene.primitives.add(model)
  } finally {
    URL.revokeObjectURL(modelUrl)
  }

  const startTime = performance.now()
  viewer.scene.preRender.addEventListener(() => {
    shader.setUniform('u_time', (performance.now() - startTime) / 1000.0)
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 920),
    orientation: {
      heading: Cesium.Math.toRadians(20),
      pitch: Cesium.Math.toRadians(-24),
      roll: 0,
    },
    duration: 2,
  })

  console.log('已加载一个内嵌 glTF 盒子模型，CustomShader 直接作用于 Model。')
  console.log('vertexMain 使用 positionMC 和 normal 做轻微位移，fragmentMain 使用 v_height 做颜色渐变。')
  console.log('uniform u_time 由 JavaScript 每帧更新，展示了时间驱动的动画写法。')
}

boot().catch((error) => {
  console.error('CustomShader 入门示例加载失败:', error)
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['内嵌 glTF Model 承载 CustomShader', 'vertexMain 修改 positionMC 实现轻微位移', 'fragmentMain 基于 v_height 和 normalEC 着色', 'uniforms 由 JavaScript 每帧更新'],
    points: ['CustomShader 适用于 Model 和 3D Tiles，不适用于普通 Entity', 'vertexMain 负责几何变化，fragmentMain 负责颜色和发光', '真正项目里要记得销毁 CustomShader 资源'],
  },
}
