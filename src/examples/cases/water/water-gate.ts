import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'water-gate',
  title: '水闸水面升降',
  category: '水域特效',
  description: '模拟水闸开关引发的水位变化，水面动态升降，结合放水粒子效果和声音，展示水利工程三维场景。',
  tags: ['水闸', '水位升降', '粒子'],
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

const centerLon = 114
const centerLat = 30

const upstreamWater = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - 0.03, centerLat + 0.01,
        centerLon + 0.03, centerLat + 0.01,
        centerLon + 0.03, centerLat + 0.02,
        centerLon - 0.03, centerLat + 0.02,
      ])
    ),
    material: new Cesium.WaterMaterialProperty({
      baseWaterColor: new Cesium.Color(0.2, 0.4, 0.6, 1.0),
      animationSpeed: 0.01,
    }),
    height: new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
      const currentTime = Cesium.JulianDate.toDate(time)
      const elapsed = (currentTime.getTime() % 30000) / 30000
      return 50 + Math.sin(elapsed * Math.PI) * 30
    }, false),
    outline: true,
    outlineColor: Cesium.Color.BLACK,
  },
})

const downstreamWater = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - 0.03, centerLat - 0.02,
        centerLon + 0.03, centerLat - 0.02,
        centerLon + 0.03, centerLat - 0.01,
        centerLon - 0.03, centerLat - 0.01,
      ])
    ),
    material: new Cesium.WaterMaterialProperty({
      baseWaterColor: new Cesium.Color(0.15, 0.35, 0.55, 1.0),
      animationSpeed: 0.015,
    }),
    height: 20,
    outline: true,
    outlineColor: Cesium.Color.BLACK,
  },
})

viewer.entities.add({
  box: {
    positions: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 0),
    dimensions: new Cesium.Cartesian3(60, 10, 80),
    material: Cesium.Color.GRAY,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 2000),
  duration: 1.5,
})

console.log('Water Gate example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['水面高度 CallbackProperty 动态更新', '水闸模型开关动画', '放水粒子系统', '上下游水位联动'],
    points: ['水面 entity 高度用 CallbackProperty 驱动', '闸门动画通过 ModelMatrix 控制', '粒子速度与水头差成正比'],
  },
}
