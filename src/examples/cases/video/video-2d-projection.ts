import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'video-2d-projection',
  title: '视频 2D 投射',
  category: '视频融合',
  description: '将摄像机视频以平面投影方式叠加到地图上，实现视频与地图平面的空间对齐融合，支持 HLS/FLV 协议。',
  tags: ['视频投射', '2D', '平面融合'],
  level: 'medium',
  files: {
    'main.ts': `\
const videoElement = document.createElement('video')
videoElement.src = 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/videos/traffic.mp4'
videoElement.crossOrigin = 'anonymous'
videoElement.loop = true
videoElement.muted = true
videoElement.playsInline = true
videoElement.play().catch(() => {})

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

const centerLon = 116.39
const centerLat = 39.9

viewer.entities.add({
  rectangle: {
    coordinates: new Cesium.Rectangle(
      Cesium.Math.toRadians(centerLon - 0.01),
      Cesium.Math.toRadians(centerLat - 0.005),
      Cesium.Math.toRadians(centerLon + 0.01),
      Cesium.Math.toRadians(centerLat + 0.005)
    ),
    material: new Cesium.ImageMaterialProperty({
      image: new Cesium.VideoTexture({
        video: videoElement,
      }),
      color: Cesium.Color.WHITE,
    }),
    height: 0,
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 500),
  duration: 1.5,
})

console.log('Video 2D Projection example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['视频平面贴地对齐', 'Rectangle/Polygon 视频纹理', '坐标系配准（相机参数）', '多路视频叠加'],
    points: ['2D 投射适合正射航拍视频', '需要已知摄像机地理坐标和朝向', '视频分辨率影响贴图清晰度'],
  },
}
