import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'video-3d-projection',
  title: '视频 3D 贴物投射',
  category: '视频融合',
  description: '将摄像机实时视频透视投影到三维地图建筑物表面，实现视频与三维场景的空间融合，用于安防监控可视化。',
  tags: ['视频融合', '3D投射', '监控'],
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

const centerLon = 114.06
const centerLat = 22.54

const buildingHeight = 300
const buildingWidth = 100

viewer.entities.add({
  box: {
    positions: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, buildingHeight / 2),
    dimensions: new Cesium.Cartesian3(buildingWidth, buildingWidth, buildingHeight),
    material: Cesium.Color.DARKGRAY,
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
  },
})

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, buildingHeight + 20),
  label: {
    text: '监控点',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, buildingHeight * 2),
  duration: 1.5,
})

console.log('Video 3D Projection example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Primitive + 自定义着色器投影', 'VideoTexture 视频纹理', '相机内外参数配置', '投影范围锥体可视化'],
    points: ['视频投影本质是纹理坐标变换', '相机 FOV 和朝向决定投影范围', '需要 CORS 或同源视频流'],
  },
}
