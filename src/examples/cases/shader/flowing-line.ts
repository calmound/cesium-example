import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'flowing-line',
  title: '流动线材质',
  category: '材质与Shader',
  description: '使用箭头主线、发光底线和沿路径跑动的粒子表达方向与流速，适用于电力线路、管道流向、数据传输可视化。',
  tags: ['流动线', '箭头', '粒子'],
  level: 'medium',
  files: {
    'main.ts': `// 流动线材质示例
// 使用箭头主线 + 跑动粒子表达方向与流速

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

viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#07111f')
viewer.scene.skyAtmosphere.hueShift = -0.14
viewer.scene.skyAtmosphere.saturationShift = -0.22
viewer.scene.skyAtmosphere.brightnessShift = -0.18
viewer.scene.fog.enabled = false

const cityCoords = {
  北京: [116.39, 39.9],
  上海: [121.47, 31.23],
  广州: [113.26, 23.13],
  成都: [104.06, 30.67],
}

Object.entries(cityCoords).forEach(([name, [lon, lat]]) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
    point: {
      pixelSize: 8,
      color: Cesium.Color.fromCssColorString('#ffd166'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: name,
      font: '600 13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -14),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
})

const flowRoutes = [
  { name: '北京→上海', from: cityCoords.北京, to: cityCoords.上海, flow: 860, color: '#4dd7ff' },
  { name: '北京→广州', from: cityCoords.北京, to: cityCoords.广州, flow: 640, color: '#35f2c7' },
  { name: '北京→成都', from: cityCoords.北京, to: cityCoords.成都, flow: 430, color: '#ffd166' },
]

viewer.scene.globe.depthTestAgainstTerrain = false

function getArcPoint(from, to, t, peakHeight) {
  const lon = Cesium.Math.lerp(from[0], to[0], t)
  const lat = Cesium.Math.lerp(from[1], to[1], t)
  const height = Math.sin(t * Math.PI) * peakHeight
  return Cesium.Cartesian3.fromDegrees(lon, lat, height)
}

function buildArcPoints(route, samples = 80) {
  const start = Cesium.Cartesian3.fromDegrees(route.from[0], route.from[1], 0)
  const end = Cesium.Cartesian3.fromDegrees(route.to[0], route.to[1], 0)
  const distance = Cesium.Cartesian3.distance(start, end)
  const peakHeight = distance * 0.16
  const positions = []

  for (let i = 0; i <= samples; i++) {
    positions.push(getArcPoint(route.from, route.to, i / samples, peakHeight))
  }

  return { positions, peakHeight }
}

function createPathSampler(positions) {
  const segmentLengths = []
  let totalLength = 0

  for (let i = 0; i < positions.length - 1; i++) {
    const length = Cesium.Cartesian3.distance(positions[i], positions[i + 1])
    segmentLengths.push(length)
    totalLength += length
  }

  return {
    getPointAt(t) {
      if (positions.length === 0) {
        return new Cesium.Cartesian3()
      }

      if (positions.length === 1) {
        return Cesium.Cartesian3.clone(positions[0], new Cesium.Cartesian3())
      }

      const normalized = ((t % 1) + 1) % 1
      const target = normalized * totalLength
      let accumulated = 0

      for (let i = 0; i < segmentLengths.length; i++) {
        const segmentLength = segmentLengths[i]
        const nextAccumulated = accumulated + segmentLength

        if (target <= nextAccumulated || i === segmentLengths.length - 1) {
          const localT = segmentLength === 0 ? 0 : (target - accumulated) / segmentLength
          return Cesium.Cartesian3.lerp(
            positions[i],
            positions[i + 1],
            Cesium.Math.clamp(localT, 0, 1),
            new Cesium.Cartesian3()
          )
        }

        accumulated = nextAccumulated
      }

      return Cesium.Cartesian3.clone(positions[positions.length - 1], new Cesium.Cartesian3())
    },
  }
}

const maxFlow = Math.max(...flowRoutes.map((route) => route.flow))
function flowToWidth(flow) {
  return 1.4 + (flow / maxFlow) * 2.6
}

const routes = flowRoutes.map((route) => {
  const { positions, peakHeight } = buildArcPoints(route)
  const sampler = createPathSampler(positions)
  return { ...route, positions, peakHeight, sampler, color: Cesium.Color.fromCssColorString(route.color) }
})

routes.forEach((route) => {
  const width = flowToWidth(route.flow)
  viewer.entities.add({
    polyline: {
      positions: route.positions,
      width: width + 2.8,
      material: Cesium.Color.fromCssColorString('#07111f').withAlpha(0.38),
    },
  })

  viewer.entities.add({
    polyline: {
      positions: route.positions,
      width,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.16,
        color: route.color.withAlpha(0.78),
      }),
    },
  })

  viewer.entities.add({
    polyline: {
      positions: route.positions,
      width: Math.max(2, width - 1),
      material: new Cesium.PolylineArrowMaterialProperty(route.color.withAlpha(0.96)),
    },
  })
})

const particleCollection = viewer.scene.primitives.add(new Cesium.BillboardCollection())

function createParticleImage() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return canvas
  }

  const gradient = ctx.createRadialGradient(16, 16, 2, 16, 16, 14)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.35, 'rgba(125,211,252,0.9)')
  gradient.addColorStop(1, 'rgba(56,189,248,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  return canvas
}

const particleImage = createParticleImage()
const particles = []

routes.forEach((route, routeIndex) => {
  const flowRatio = route.flow / maxFlow
  const particleCount = 2

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount
    const position = route.sampler.getPointAt(t)
    const scale = 0.8 + flowRatio * 0.75

    const billboard = particleCollection.add({
      position,
      image: particleImage,
      width: 16 * scale,
      height: 16 * scale,
      color: route.color.withAlpha(0.85),
      scaleByDistance: new Cesium.NearFarScalar(800000, 1, 7000000, 0.45),
    })

    particles.push({
      routeIndex,
      t,
      speed: 0.0028 + flowRatio * 0.0038 + i * 0.0009,
      scale,
      billboard,
    })
  }
})

viewer.scene.preUpdate.addEventListener(() => {
  particles.forEach((particle) => {
    const route = routes[particle.routeIndex]
    particle.t += particle.speed
    if (particle.t > 1) {
      particle.t -= 1
    }

    particle.billboard.position = route.sampler.getPointAt(particle.t)
    particle.billboard.color = route.color.withAlpha(0.42 + Math.sin(particle.t * Math.PI) * 0.45)
    particle.billboard.width = 16 * particle.scale
    particle.billboard.height = 16 * particle.scale
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(112, 33.5, 4200000),
  orientation: {
    heading: Cesium.Math.toRadians(5),
    pitch: Cesium.Math.toRadians(-42),
    roll: 0,
  },
  duration: 2.4,
  complete: () => console.log('🌊 流动线效果已启动'),
})

console.log('💡 流动线：箭头主线 + 发光底线 + 跑动粒子')
console.log('🔄 方向由 PolylineArrowMaterialProperty 表达，流速由移动粒子表达')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PolylineArrowMaterialProperty 箭头方向', 'PolylineGlowMaterialProperty 发光底线', 'BillboardCollection 跑动粒子', '按路径长度采样保证粒子匀速'],
    points: ['静态线材质适合表达路径，粒子更适合表达流动', '粒子速度可按 flow 值映射，方向感会更明确', '弧线主干比直线更容易读出城市间流向'],
  },
}
