/**
 * 万级无人机群体飞行系统
 * 支持多种飞行模式：螺旋飞行、编队散开、波浪涌动、旋转编队
 */

export interface DronePosition {
  lon: number
  lat: number
  altitude: number
  heading: number
}

export interface FlightMode {
  name: string
  duration: number // 周期（秒）
  calculate: (droneId: number, row: number, col: number, time: number, baseLayout: any) => DronePosition
}

// 基础参数
const baseConfig = {
  rows: 100,
  columns: 100,
  spacingMeters: 95,
  centerLon: 116.3912,
  centerLat: 39.9073,
  baseAltitude: 250,
  modelScale: 8,
}

// 坐标转换函数
function metersToLongitudeDegrees(meters: number, latitude: number) {
  return meters / (111320 * Math.cos((latitude * Math.PI) / 180))
}

function metersToLatitudeDegrees(meters: number) {
  return meters / 110540
}

// ============ 飞行模式定义 ============

/**
 * 模式 1: 网格螺旋旋转
 * 整个 100×100 网格绕中心点旋转，同时上下浮动
 */
export const helicalRotationMode: FlightMode = {
  name: '螺旋旋转',
  duration: 40,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat, baseAltitude } = baseConfig
    const progress = (time % 40) / 40 // 0-1

    // 当前位置相对中心的距离和角度
    const baseX = baseLayout.x
    const baseY = baseLayout.y
    const distance = Math.sqrt(baseX * baseX + baseY * baseY)
    let angle = Math.atan2(baseY, baseX)

    // 旋转
    angle += progress * Math.PI * 2
    const rotatedX = Math.cos(angle) * distance
    const rotatedY = Math.sin(angle) * distance

    // 螺旋高度变化
    const heightOffset = Math.sin(progress * Math.PI * 2) * 120
    const altitude = baseLayout.altitude + heightOffset

    // 旋转时改变 heading
    const heading = baseLayout.heading + progress * Math.PI * 2

    return {
      lon: centerLon + metersToLongitudeDegrees(rotatedX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(rotatedY),
      altitude: Math.max(50, altitude),
      heading: heading,
    }
  },
}

/**
 * 模式 2: 编队散开收拢
 * 分成 10 个编队，从中心向外散开再收拢
 */
export const swarmScatterMode: FlightMode = {
  name: '编队散开',
  duration: 50,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat } = baseConfig
    const progress = (time % 50) / 50

    // 根据无人机ID分配到不同编队 (0-9)
    const swarmId = Math.floor((row * baseConfig.columns + col) / 1000) % 10
    const phaseOffset = (swarmId / 10) * Math.PI * 2

    // 散开/收拢动画
    const scatterPhase = Math.sin(progress * Math.PI * 2 + phaseOffset)
    const scatterDistance = scatterPhase * 800 // ±800米

    // 应用散开偏移
    const baseX = baseLayout.x
    const baseY = baseLayout.y
    const distance = Math.sqrt(baseX * baseX + baseY * baseY)
    const angle = Math.atan2(baseY, baseX)

    const offsetX = Math.cos(angle) * scatterDistance
    const offsetY = Math.sin(angle) * scatterDistance

    // 高度跟随散开动画
    const heightOffset = Math.abs(scatterPhase) * 150
    const altitude = baseLayout.altitude + heightOffset

    return {
      lon: centerLon + metersToLongitudeDegrees(baseX + offsetX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(baseY + offsetY),
      altitude: Math.max(100, altitude),
      heading: baseLayout.heading + scatterPhase * 0.5,
    }
  },
}

/**
 * 模式 3: 波浪涌动
 * 行波效应，从一侧向另一侧传播
 */
export const waveMode: FlightMode = {
  name: '波浪涌动',
  duration: 30,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat } = baseConfig
    const progress = (time % 30) / 30

    // 波浪方向：从左到右
    const waveFront = progress * baseConfig.columns
    const distance = Math.abs(col - waveFront)
    const waveStrength = Math.exp(-(distance * distance) / 300)

    // 高度波动（波浪沿列传播）
    const waveHeight = Math.sin((col / baseConfig.columns + progress) * Math.PI * 4) * waveStrength * 200
    const altitude = baseLayout.altitude + waveHeight

    // 横向摇晃
    const sway = Math.sin((col / baseConfig.columns + progress) * Math.PI * 6) * waveStrength * 150
    const offsetX = sway

    const heading = baseLayout.heading + waveStrength * Math.sin(progress * Math.PI * 2) * 0.3

    return {
      lon: centerLon + metersToLongitudeDegrees(baseLayout.x + offsetX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(baseLayout.y),
      altitude: Math.max(100, altitude),
      heading: heading,
    }
  },
}

/**
 * 模式 4: 漩涡运动
 * 整个编队形成漩涡，向上升起
 */
export const vortexMode: FlightMode = {
  name: '漩涡上升',
  duration: 45,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat } = baseConfig
    const progress = (time % 45) / 45

    const baseX = baseLayout.x
    const baseY = baseLayout.y
    const distance = Math.sqrt(baseX * baseX + baseY * baseY)
    let angle = Math.atan2(baseY, baseX)

    // 漩涡：旋转角度与距离中心的距离成正比
    const rotationMultiplier = distance / 5000 // 远离中心旋转更快
    angle += progress * Math.PI * 4 * rotationMultiplier

    // 计算旋转后的坐标
    const rotatedX = Math.cos(angle) * distance
    const rotatedY = Math.sin(angle) * distance

    // 向上升起
    const heightGain = progress * 600
    const altitude = baseLayout.altitude + heightGain

    // 旋转时改变 heading
    const heading = baseLayout.heading + progress * Math.PI * 4

    return {
      lon: centerLon + metersToLongitudeDegrees(rotatedX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(rotatedY),
      altitude: Math.max(50, altitude),
      heading: heading,
    }
  },
}

/**
 * 模式 5: 分队编队飞行
 * 分成 4 个编队，各自沿不同方向飞行
 */
export const formationMode: FlightMode = {
  name: '分队编队',
  duration: 60,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat, rows, columns } = baseConfig
    const progress = (time % 60) / 60

    // 分成 4 个象限编队
    const isTopHalf = row < rows / 2
    const isLeftHalf = col < columns / 2
    let formationId = 0
    if (isTopHalf && isLeftHalf) formationId = 0 // 左上：向北
    else if (isTopHalf && !isLeftHalf) formationId = 1 // 右上：向东
    else if (!isTopHalf && isLeftHalf) formationId = 2 // 左下：向西
    else formationId = 3 // 右下：向南

    // 各编队飞行方向
    const directions = [
      { dx: 0, dy: 1200 }, // 向北
      { dx: 1200, dy: 0 }, // 向东
      { dx: -1200, dy: 0 }, // 向西
      { dx: 0, dy: -1200 }, // 向南
    ]

    const dir = directions[formationId]
    const offsetX = dir.dx * Math.sin(progress * Math.PI)
    const offsetY = dir.dy * Math.sin(progress * Math.PI)

    // 高度随编队运动
    const altitude = baseLayout.altitude + Math.sin(progress * Math.PI) * 200

    // 编队内部的细微波动
    const internalWave = Math.sin((row + col) * 0.1 + progress * Math.PI * 2) * 50
    const finalAltitude = altitude + internalWave

    return {
      lon: centerLon + metersToLongitudeDegrees(baseLayout.x + offsetX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(baseLayout.y + offsetY),
      altitude: Math.max(100, finalAltitude),
      heading: baseLayout.heading + (progress - 0.5) * 0.6,
    }
  },
}

/**
 * 模式 6: 复杂群体运动（混合模式）
 * 结合旋转、波浪、高度变化的综合运动
 */
export const complexSwarmMode: FlightMode = {
  name: '复杂群体',
  duration: 80,
  calculate(droneId, row, col, time, baseLayout) {
    const { centerLon, centerLat } = baseConfig
    const progress = (time % 80) / 80

    const baseX = baseLayout.x
    const baseY = baseLayout.y
    const distance = Math.sqrt(baseX * baseX + baseY * baseY)
    let angle = Math.atan2(baseY, baseX)

    // 主旋转运动
    const rotation = progress * Math.PI * 2
    angle += rotation * 0.8

    // 波浪形变形（根据行号）
    const waveAmplitude = Math.sin((row / baseConfig.rows) * Math.PI * 2 + progress * Math.PI) * 400
    const waveDistance = distance + waveAmplitude

    // 计算最终坐标
    const rotatedX = Math.cos(angle) * waveDistance
    const rotatedY = Math.sin(angle) * waveDistance

    // 复杂高度变化：旋转 + 波浪 + 编队内部
    const rotationHeight = Math.sin(rotation) * 150
    const waveHeight = Math.sin((row / baseConfig.rows + progress) * Math.PI * 4) * 120
    const internalHeight = Math.sin((col / baseConfig.columns) * Math.PI * 2) * 80
    const altitude = baseLayout.altitude + rotationHeight + waveHeight + internalHeight

    const heading = baseLayout.heading + rotation

    return {
      lon: centerLon + metersToLongitudeDegrees(rotatedX, centerLat),
      lat: centerLat + metersToLatitudeDegrees(rotatedY),
      altitude: Math.max(50, altitude),
      heading: heading,
    }
  },
}

// ============ 飞行模式列表 ============

export const flightModes: FlightMode[] = [
  helicalRotationMode,
  swarmScatterMode,
  waveMode,
  vortexMode,
  formationMode,
  complexSwarmMode,
]

// ============ 飞行系统控制器 ============

export class DroneFlightController {
  currentModeIndex: number = 0
  isAnimating: boolean = false
  animationTime: number = 0
  updateCallback: ((droneId: number, position: DronePosition) => void) | null = null

  constructor() {
    this.currentModeIndex = 0
  }

  getCurrentMode(): FlightMode {
    return flightModes[this.currentModeIndex]
  }

  switchMode(modeIndex: number) {
    if (modeIndex >= 0 && modeIndex < flightModes.length) {
      this.currentModeIndex = modeIndex
      this.animationTime = 0
      console.log(`切换飞行模式：${this.getCurrentMode().name}`)
    }
  }

  nextMode() {
    this.switchMode((this.currentModeIndex + 1) % flightModes.length)
  }

  start() {
    this.isAnimating = true
    console.log('开始飞行动画')
  }

  pause() {
    this.isAnimating = false
    console.log('暂停飞行动画')
  }

  resume() {
    this.isAnimating = true
    console.log('继续飞行动画')
  }

  reset() {
    this.animationTime = 0
    this.isAnimating = false
    console.log('重置飞行状态')
  }

  update(deltaTime: number, droneData: any[]) {
    if (!this.isAnimating) return

    this.animationTime += deltaTime

    const mode = this.getCurrentMode()
    const { rows, columns } = baseConfig

    for (let i = 0; i < droneData.length; i++) {
      const drone = droneData[i]
      const row = Math.floor(i / columns)
      const col = i % columns

      const position = mode.calculate(i, row, col, this.animationTime, drone.baseLayout)

      if (this.updateCallback) {
        this.updateCallback(i, position)
      }
    }
  }

  getModeList() {
    return flightModes.map((mode, index) => ({
      id: index,
      name: mode.name,
      duration: mode.duration,
    }))
  }
}

export default {
  flightModes,
  DroneFlightController,
  baseConfig,
}
