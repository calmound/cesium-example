import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'drone-aerial',
  title: '无人机航拍模拟',
  category: '综合应用',
  description: '无人机航拍模拟系统，演示飞行区域边界绘制、分步视角切换、无人机沿路线飞行、视锥追踪拍摄区域。',
  tags: ['无人机', '航拍', '飞行模拟'],
  level: 'hard',
  files: {
    'main.ts': `// 无人机航拍模拟系统

const BOUNDARY_COORDS = [
  [116.069898, 31.303655],
  [116.098708, 31.322126],
  [116.108063, 31.311256],
  [116.079317, 31.292959],
  [116.069898, 31.303655]
]

const ROUTE_POINTS = [
  [116.077374, 31.294215, 500],
  [116.107153, 31.312963, 500],
  [116.103816, 31.316868, 500],
  [116.074092, 31.297972, 500],
  [116.070680, 31.301908, 500],
  [116.100465, 31.320893, 500]
]

const CAMERA_VIEWS = [
  { lat: 31.261244, lng: 116.087805, alt: 4571.19, heading: 2.3, pitch: -45.4, roll: 357.6, stop: 4 },
  { lat: 31.299649, lng: 116.129938, alt: 2725.83, heading: 290.2, pitch: -34, roll: 358.1, stop: 4 },
  { lat: 31.288891, lng: 116.106146, alt: 4268.26, heading: 325.4, pitch: -55.7, roll: 357.5 }
]

const FLIGHT_SPEED = 300
const FRUSTUM_FOV = 30
const FRUSTUM_ASPECT = 4 / 3
const FRUSTUM_LENGTH = 800

const COLORS = [
  new Cesium.Color(1, 0, 0, 0.25),
  new Cesium.Color(0, 1, 0, 0.25),
  new Cesium.Color(0, 0.5, 1, 0.25),
  new Cesium.Color(1, 1, 0, 0.25),
  new Cesium.Color(1, 0, 1, 0.25)
]

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

let droneEntity
let frustumLineEntity
let scanLineEntity
let flightPositionProperty
let colorIndex = 0
let frameNum = 0
let capturedPolygons = []
let flightStarted = false
let flightTrail = []

// 初始相机位置
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.103599, 31.265081, 6178),
  orientation: {
    heading: Cesium.Math.toRadians(348),
    pitch: Cesium.Math.toRadians(-54)
  },
  duration: 0
})

// 1. 绘制飞行区域边界线
function drawBoundary() {
  viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(BOUNDARY_COORDS.flat()),
      material: Cesium.Color.YELLOW.withAlpha(0.15),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      fill: true
    }
  })
}

// 2. 绘制飞行轨迹线（静态）
function drawFlightPath() {
  const pathPositions = ROUTE_POINTS.map(p => Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]))
  viewer.entities.add({
    polyline: {
      positions: pathPositions,
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN.withAlpha(0.6),
        dashLength: 16
      }),
      clampToGround: true
    }
  })
}

// 3. 边界线闪烁动画
function startBoundaryFlicker() {
  const boundaryEntity = viewer.entities.values[0]
  let flickerCount = 0
  let alternate = false

  const flickerInterval = setInterval(() => {
    alternate = !alternate
    boundaryEntity.polygon.outlineColor = alternate
      ? Cesium.Color.RED
      : Cesium.Color.YELLOW

    flickerCount++
    if (flickerCount >= 6) {
      clearInterval(flickerInterval)
      boundaryEntity.polygon.fill = false
      boundaryEntity.polygon.outline = false
      if (!flightStarted) {
        flightStarted = true
        startRoam()
      }
    }
  }, 500)
}

// 4. 分步视角切换
function setCameraViewList(views) {
  let index = 0

  function flyToNext() {
    if (index >= views.length) return

    const view = views[index]
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(view.lng, view.lat, view.alt),
      orientation: {
        heading: Cesium.Math.toRadians(view.heading),
        pitch: Cesium.Math.toRadians(view.pitch),
        roll: Cesium.Math.toRadians(view.roll)
      },
      duration: 2,
      complete: () => {
        index++
        if (index < views.length) {
          setTimeout(flyToNext, (view.stop || 2) * 1000)
        }
      }
    })
  }

  flyToNext()
}

// 5. 开始航拍漫游
function startRoam() {
  setCameraViewList(CAMERA_VIEWS)
  createFlightRoute()
}

function createFlightRoute() {
  let totalDistance = 0
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    totalDistance += calculateDistance(ROUTE_POINTS[i - 1], ROUTE_POINTS[i])
  }

  const positionProperty = new Cesium.SampledPositionProperty()
  flightPositionProperty = positionProperty
  const startTime = Cesium.JulianDate.now()

  ROUTE_POINTS.forEach((point, i) => {
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      i * (totalDistance / ROUTE_POINTS.length) / FLIGHT_SPEED,
      new Cesium.JulianDate()
    )
    const cartesian = Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2])
    positionProperty.addSample(time, cartesian)
  })

  // 无人机实体（使用组合几何体表示）
  droneEntity = viewer.entities.add({
    position: positionProperty,
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    box: {
      dimensions: new Cesium.Cartesian3(30, 30, 15),
      material: Cesium.Color.DARKGREY.withAlpha(0.9),
      outline: true,
      outlineColor: Cesium.Color.CYAN
    }
  })

  // 飞行轨迹动态尾巴
  viewer.entities.add({
    position: positionProperty,
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    path: {
      show: true,
      leadTime: 0,
      trailTime: 5,
      width: 8,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.CYAN
      })
    }
  })

  createScanVisualization(positionProperty)

  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    (totalDistance / FLIGHT_SPEED) * 2.5,
    new Cesium.JulianDate()
  )

  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime
  viewer.clock.currentTime = startTime.clone()
  viewer.clock.shouldAnimate = true
  viewer.clock.multiplier = 1

  viewer.scene.preRender.addEventListener(onPreRender)
}

// 6. 创建扫描可视化（视锥边框 + 扫描线）
function createScanVisualization(positionProperty) {
  // 视锥边框线
  frustumLineEntity = viewer.entities.add({
    position: new Cesium.CallbackProperty(() => {
      return positionProperty.getValue(viewer.clock.currentTime)
    }, false),
    orientation: new Cesium.CallbackProperty(() => {
      return droneEntity ? droneEntity.orientation.getValue(viewer.clock.currentTime) : Cesium.Quaternion.IDENTITY
    }, false),
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        const pos = positionProperty.getValue(viewer.clock.currentTime)
        if (!pos) return []
        const ground = calculateGroundProjection(pos)
        return ground
      }, false),
      width: 3,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.5,
        color: Cesium.Color.LIME
      }),
      clampToGround: false
    }
  })

  // 扫描线（从无人机到地面中心）
  scanLineEntity = viewer.entities.add({
    position: new Cesium.CallbackProperty(() => {
      return positionProperty.getValue(viewer.clock.currentTime)
    }, false),
    orientation: new Cesium.CallbackProperty(() => {
      return droneEntity ? droneEntity.orientation.getValue(viewer.clock.currentTime) : Cesium.Quaternion.IDENTITY
    }, false),
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        const pos = positionProperty.getValue(viewer.clock.currentTime)
        if (!pos) return []
        const groundPos = calculateGroundCenter(pos)
        return [pos, groundPos]
      }, false),
      width: 2,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
      clampToGround: false
    }
  })
}

// 7. 计算视锥地面投影（统一使用此函数）
function calculateGroundProjection(dronePosition) {
  const groundCenter = calculateGroundCenter(dronePosition)
  const groundCartographic = Cesium.Cartographic.fromCartesian(groundCenter)
  const droneCartographic = Cesium.Cartographic.fromCartesian(dronePosition)
  const altitude = Math.max(droneCartographic.height - groundCartographic.height, 1)

  const halfHorizontalFov = Cesium.Math.toRadians(FRUSTUM_FOV / 2)
  const halfVerticalFov = Math.atan(Math.tan(halfHorizontalFov) / FRUSTUM_ASPECT)
  const halfWidth = altitude * Math.tan(halfHorizontalFov)
  const halfLength = altitude * Math.tan(halfVerticalFov)

  const forward = getFlightDirection(dronePosition)
  const up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(groundCenter, new Cesium.Cartesian3())
  const right = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(forward, up, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )

  const forwardOffset = Cesium.Cartesian3.multiplyByScalar(forward, halfLength, new Cesium.Cartesian3())
  const rightOffset = Cesium.Cartesian3.multiplyByScalar(right, halfWidth, new Cesium.Cartesian3())
  const backwardOffset = Cesium.Cartesian3.negate(forwardOffset, new Cesium.Cartesian3())
  const leftOffset = Cesium.Cartesian3.negate(rightOffset, new Cesium.Cartesian3())

  const frontLeft = Cesium.Cartesian3.add(
    Cesium.Cartesian3.add(groundCenter, forwardOffset, new Cesium.Cartesian3()),
    leftOffset,
    new Cesium.Cartesian3()
  )
  const frontRight = Cesium.Cartesian3.add(
    Cesium.Cartesian3.add(groundCenter, forwardOffset, new Cesium.Cartesian3()),
    rightOffset,
    new Cesium.Cartesian3()
  )
  const backRight = Cesium.Cartesian3.add(
    Cesium.Cartesian3.add(groundCenter, backwardOffset, new Cesium.Cartesian3()),
    rightOffset,
    new Cesium.Cartesian3()
  )
  const backLeft = Cesium.Cartesian3.add(
    Cesium.Cartesian3.add(groundCenter, backwardOffset, new Cesium.Cartesian3()),
    leftOffset,
    new Cesium.Cartesian3()
  )

  return [frontLeft, frontRight, backRight, backLeft, frontLeft]
}

// 8. 计算地面中心点
function calculateGroundCenter(dronePosition) {
  const centerCartographic = Cesium.Cartographic.fromCartesian(dronePosition)
  return Cesium.Cartesian3.fromDegrees(
    centerCartographic.longitude * (180 / Math.PI),
    centerCartographic.latitude * (180 / Math.PI),
    0
  )
}

function getFlightDirection(dronePosition) {
  if (!flightPositionProperty) {
    return new Cesium.Cartesian3(0, 1, 0)
  }

  const currentTime = viewer.clock.currentTime
  const nextTime = Cesium.JulianDate.addSeconds(currentTime, 0.2, new Cesium.JulianDate())
  const prevTime = Cesium.JulianDate.addSeconds(currentTime, -0.2, new Cesium.JulianDate())
  const nextPosition = flightPositionProperty.getValue(nextTime)
  const prevPosition = flightPositionProperty.getValue(prevTime)

  let velocity = nextPosition && prevPosition
    ? Cesium.Cartesian3.subtract(nextPosition, prevPosition, new Cesium.Cartesian3())
    : nextPosition
      ? Cesium.Cartesian3.subtract(nextPosition, dronePosition, new Cesium.Cartesian3())
      : prevPosition
        ? Cesium.Cartesian3.subtract(dronePosition, prevPosition, new Cesium.Cartesian3())
        : undefined

  if (!velocity || Cesium.Cartesian3.magnitudeSquared(velocity) === 0) {
    velocity = Cesium.Cartesian3.UNIT_Y
  }

  const up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(dronePosition, new Cesium.Cartesian3())
  const verticalComponent = Cesium.Cartesian3.multiplyByScalar(
    up,
    Cesium.Cartesian3.dot(velocity, up),
    new Cesium.Cartesian3()
  )
  const tangentVelocity = Cesium.Cartesian3.subtract(velocity, verticalComponent, new Cesium.Cartesian3())

  if (Cesium.Cartesian3.magnitudeSquared(tangentVelocity) === 0) {
    return Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, up, new Cesium.Cartesian3())
  }

  return Cesium.Cartesian3.normalize(tangentVelocity, new Cesium.Cartesian3())
}

// 9. 预渲染事件
function onPreRender() {
  if (!droneEntity || !viewer.clock.shouldAnimate) return

  const time = viewer.clock.currentTime
  const position = droneEntity.position.getValue(time)
  if (!position) return

  frameNum++

  // 每30帧绘制一个拍摄区域多边形
  if (frameNum % 30 === 0) {
    const groundProjection = calculateGroundProjection(position)

    if (groundProjection.length >= 4) {
      const polygon = viewer.entities.add({
        polygon: {
          hierarchy: groundProjection.slice(0, 4),
          material: COLORS[colorIndex % COLORS.length],
          perPositionHeight: false,
          zIndex: colorIndex
        }
      })
      capturedPolygons.push(polygon)
      colorIndex++
    }
  }

  // 每120帧清理旧实体，避免过多实体影响性能
  if (frameNum % 120 === 0 && capturedPolygons.length > 30) {
    const toRemove = capturedPolygons.splice(0, 15)
    toRemove.forEach(p => viewer.entities.remove(p))
  }
}

// 10. 计算两点间距离
function calculateDistance(coord1, coord2) {
  const lat1Rad = Cesium.Math.toRadians(coord1[1])
  const lat2Rad = Cesium.Math.toRadians(coord2[1])
  const lng1Rad = Cesium.Math.toRadians(coord1[0])
  const lng2Rad = Cesium.Math.toRadians(coord2[0])

  const dLat = lat2Rad - lat1Rad
  const dLng = lng2Rad - lng1Rad

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return 6371000 * c
}

// 初始化
drawBoundary()
drawFlightPath()
setTimeout(startBoundaryFlicker, 1000)

console.log('无人机航拍模拟已启动')
console.log('黄色边框为飞行区域，闪烁后开始航拍')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['飞行区域边界线绘制与闪烁', '飞行轨迹可视化（虚线）', '分步视角切换动画', '无人机沿预设路线飞行与轨迹尾巴', '视锥边框扫描动画', '地面拍摄区域多边形标记'],
    points: ['使用 PolylineGlowMaterialProperty 实现发光轨迹', 'CallbackProperty 实时更新视锥和扫描线位置', '每30帧绘制一个拍摄区域覆盖地面'],
  },
}
