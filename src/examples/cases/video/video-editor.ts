import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'video-editor',
  title: '视频融合编辑',
  category: '视频融合',
  description: '可视化调整视频投影参数（位置、旋转、视锥角），实时预览融合效果，支持多路摄像机管理与参数持久化。',
  tags: ['视频编辑', '参数调整', '摄像机管理'],
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

const cameraEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 200),
  point: {
    pixelSize: 15,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: 'Camera 1',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -25),
  },
})

const frustumOutline = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 200),
  orientation: Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 200),
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(45),
      Cesium.Math.toRadians(-30),
      0
    )
  ),
  frustum: {
    type: 2,
    fov: Cesium.Math.toRadians(60),
    aspectRatio: 16 / 9,
    near: 10,
    far: 1000,
  },
  outline: true,
  outlineColor: Cesium.Color.YELLOW,
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 2000),
  duration: 1.5,
})

console.log('Video Editor example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['GUI 控件调节投影参数', '多路摄像机列表管理', '参数序列化（JSON 导出/导入）', '实时预览调整效果'],
    points: ['内参（FOV/宽高比）和外参（位置/姿态）分开管理', '调整精度到 0.001° 级别', '参数校准建议使用控制点法'],
  },
}
