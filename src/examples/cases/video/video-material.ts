import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'video-material',
  title: '视频材质（面状）',
  category: '视频融合',
  description: '将视频流作为纹理贴在多边形或矩形面上，支持 MP4、HLS（m3u8）、FLV 多种协议的视频源。',
  tags: ['视频材质', 'HLS', 'FLV'],
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
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - 0.01, centerLat - 0.005,
        centerLon + 0.01, centerLat - 0.005,
        centerLon + 0.01, centerLat + 0.005,
        centerLon - 0.01, centerLat + 0.005,
      ])
    ),
    material: new Cesium.ImageMaterialProperty({
      image: new Cesium.VideoTexture({
        video: videoElement,
      }),
      color: Cesium.Color.WHITE,
    }),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 1000),
  duration: 1.5,
})

console.log('Video Material example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['HTML Video 元素作为纹理源', 'HLS.js 播放 HLS 直播流', 'flv.js 播放 FLV 直播流', '视频纹理自动循环播放'],
    points: ['VideoTexture 需要 video.play() 触发', 'HLS 流需要引入 hls.js 库', '跨域视频需配置 CORS'],
  },
}
