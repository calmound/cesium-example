# Cesium 复刻无人机航拍案例

## 一、案例概述

修改当前项目下的 无人机航拍示例，核心功能包括：
1. 飞行区域边界线绘制与闪烁提示
2. 分步视角切换动画
3. 无人机模型沿预设路线飞行
4. 相机取景框（四棱锥体）追踪显示
5. 地面投影多边形标记已拍摄区域

---

## 二、准备内容

### 2.1 资源文件

| 资源 | 文件名 | 说明 |
|-----|--------|------|
| 无人机模型 | `wrj.glb` | GLTF格式，Scale建议 0.01-0.05 |

**推荐下载源**：
无人模型如果找得到就用，找不到先随便使用一个立方体表达释义，哪怕文字都可以

### 2.2 坐标数据

**飞行区域边界**（用于绘制黄色边框）：
```javascript
const BOUNDARY_COORDS = [
  [116.069898, 31.303655],
  [116.098708, 31.322126],
  [116.108063, 31.311256],
  [116.079317, 31.292959],
  [116.069898, 31.303655]  // 闭合
]
```

**飞行路线点**（经度, 纬度, 高度）：
```javascript
const ROUTE_POINTS = [
  [116.077374, 31.294215, 1000],
  [116.107153, 31.312963, 1000],
  [116.103816, 31.316868, 1000],
  [116.074092, 31.297972, 1000],
  [116.070680, 31.301908, 1000],
  [116.100465, 31.320893, 1000]
]
```

**分步视角切换**：
```javascript
const CAMERA_VIEWS = [
  { lat: 31.261244, lng: 116.087805, alt: 4571.19, heading: 2.3, pitch: -45.4, roll: 357.6, stop: 4 },
  { lat: 31.299649, lng: 116.129938, alt: 2725.83, heading: 290.2, pitch: -34, roll: 358.1, stop: 4 },
  { lat: 31.288891, lng: 116.106146, alt: 4268.26, heading: 325.4, pitch: -55.7, roll: 357.5 }
]
```

---

## 三、技术方案

### 3.1 核心 Cesium API

| 功能 | Cesium API |
|-----|-----------|
| 地球视图 | `new Cesium.Viewer(container)` |
| 地形 | `Cesium.TerrainProvider` / `fromIonAssetId` |
| 相机动画 | `viewer.camera.flyTo()` / `flyToBoundingSphere()` |
| 模型 | `viewer.entities.add({ model: {...} })` |
| 路线动画 | `SampledPositionProperty` + `viewer.clock` |
| 视锥体 | `PerspectiveFrustum` + `FrustumGeometry` |
| 射线求交 | `scene.pickRay()` |
| 多边形 | `viewer.entities.add({ polygon: {...} })` |
| 时间轴 | `viewer.animation` / `viewer.timeline` |

### 3.2 依赖版本

```
Cesium >= 1.90.0
```

---
代码部分是思路借鉴，你不用完全一模一样，最终效果实现即可，细节可以根据实际情况调整

## 四、完整实现代码
### 4.2 JavaScript 实现 (main.js)

```javascript
import * as Cesium from 'cesium';

// ============================================================
// 配置常量
// ============================================================

const BOUNDARY_COORDS = [
  [116.069898, 31.303655],
  [116.098708, 31.322126],
  [116.108063, 31.311256],
  [116.079317, 31.292959],
  [116.069898, 31.303655]
];

const ROUTE_POINTS = [
  [116.077374, 31.294215, 1000],
  [116.107153, 31.312963, 1000],
  [116.103816, 31.316868, 1000],
  [116.074092, 31.297972, 1000],
  [116.070680, 31.301908, 1000],
  [116.100465, 31.320893, 1000]
];

const CAMERA_VIEWS = [
  { lat: 31.261244, lng: 116.087805, alt: 4571.19, heading: 2.3, pitch: -45.4, roll: 357.6, stop: 4 },
  { lat: 31.299649, lng: 116.129938, alt: 2725.83, heading: 290.2, pitch: -34, roll: 358.1, stop: 4 },
  { lat: 31.288891, lng: 116.106146, alt: 4268.26, heading: 325.4, pitch: -55.7, roll: 357.5 }
];

const FLIGHT_SPEED = 600; // 米/秒
const FRUSTUM_FOV = 30;   // 视锥垂直角度
const FRUSTUM_ASPECT = 4 / 3; // 视锥宽高比
const FRUSTUM_LENGTH = 1000;  // 视锥长度

// 颜色数组（用于标记已拍摄区域）
const COLORS = [
  new Cesium.Color(1.0, 0.0, 0.0, 0.3),
  new Cesium.Color(0.0, 1.0, 0.0, 0.3),
  new Cesium.Color(0.0, 0.0, 1.0, 0.3)
];

// ============================================================
// 全局变量
// ============================================================

let viewer;
let droneEntity;
let frustumEntity;
let graphicLayer;
let colorIndex = 0;
let frameNum = 0;
let capturedPolygons = []; // 已拍摄区域多边形

// ============================================================
// 初始化
// ============================================================

async function init() {
  // 1. 创建Viewer
  viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.TerrainProvider.fromIonAssetId(1), // Cesium Ion地形
    baseLayerPicker: false,
    animation: true,
    timeline: true,
    selectionIndicator: false,
    infoBox: false
  });

  // 开启地形深度测试（使建筑等物体正确遮挡）
  viewer.scene.globe.depthTestAgainstTerrain = false;

  // 2. 隐藏默认entities（蓝色边框）
  viewer.entities.removeAll();

  // 3. 初始相机位置
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.103599, 31.265081, 6178),
    orientation: {
      heading: Cesium.Math.toRadians(348),
      pitch: Cesium.Math.toRadians(-54)
    },
    duration: 0
  });

  // 4. 绘制边界线
  drawBoundary();

  // 5. 开始闪烁动画
  startBoundaryFlicker();
}

// ============================================================
// 1. 绘制飞行区域边界线
// ============================================================

function drawBoundary() {
  const boundaryEntity = viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(BOUNDARY_COORDS.flat()),
      material: Cesium.Color.YELLOW.withAlpha(0.3),
      outline: true,
      outlineColor: Cesium.Color.GREEN,
      outlineWidth: 3,
      fill: true
    }
  });
  return boundaryEntity;
}

// ============================================================
// 2. 边界线闪烁动画（3秒后自动开始航拍）
// ============================================================

function startBoundaryFlicker() {
  const boundaryEntity = viewer.entities.values[0]; // 边界线
  let flickerCount = 0;
  let alternate = false;

  const flickerInterval = setInterval(() => {
    alternate = !alternate;
    boundaryEntity.polygon.outlineColor = alternate
      ? Cesium.Color.GREEN
      : Cesium.Color.YELLOW;

    flickerCount++;
    if (flickerCount >= 6) { // 3秒 * 2次/秒
      clearInterval(flickerInterval);
      boundaryEntity.polygon.fill = false; // 隐藏填充
      boundaryEntity.polygon.outline = false; // 隐藏边框
      startRoam(); // 开始航拍
    }
  }, 500);
}

// ============================================================
// 3. 分步视角切换
// ============================================================

function setCameraViewList(views) {
  let index = 0;

  function flyToNext() {
    if (index >= views.length) return;

    const view = views[index];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(view.lng, view.lat, view.alt),
      orientation: {
        heading: Cesium.Math.toRadians(view.heading),
        pitch: Cesium.Math.toRadians(view.pitch),
        roll: Cesium.Math.toRadians(view.roll)
      },
      duration: 2,
      complete: () => {
        index++;
        if (index < views.length) {
          // 等待stop秒数后切换下一个视角
          setTimeout(flyToNext, (view.stop || 2) * 1000);
        }
      }
    });
  }

  flyToNext();
}

// ============================================================
// 4. 开始航拍漫游
// ============================================================

function startRoam() {
  // 4.1 分步视角切换
  setCameraViewList(CAMERA_VIEWS);

  // 4.2 创建飞行路线实体
  createFlightRoute();
}

function createFlightRoute() {
  // 计算路线总长度
  let totalDistance = 0;
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    totalDistance += calculateDistance(ROUTE_POINTS[i - 1], ROUTE_POINTS[i]);
  }

  // 4.2.1 创建时序位置属性
  const positionProperty = new Cesium.SampledPositionProperty();
  const startTime = Cesium.JulianDate.now();

  ROUTE_POINTS.forEach((point, i) => {
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      i * (totalDistance / ROUTE_POINTS.length) / FLIGHT_SPEED,
      new Cesium.JulianDate()
    );
    const cartesian = Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]);
    positionProperty.addSample(time, cartesian);
  });

  // 4.2.2 添加无人机模型
  droneEntity = viewer.entities.add({
    position: positionProperty,
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    model: {
      uri: './wrj.glb', // 模型路径，替换为实际路径
      scale: 0.02,
      minimumPixelSize: 50,
      color: Cesium.Color.WHITE
    },
    path: {
      show: true,
      leadTime: 0,
      width: 3,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW)
    }
  });

  // 4.2.3 添加视锥体
  createFrustum();

  // 4.2.4 配置时钟
  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    (totalDistance / FLIGHT_SPEED) * 1.5, // 留出余量
    new Cesium.JulianDate()
  );

  viewer.clock.startTime = startTime.clone();
  viewer.clock.stopTime = stopTime;
  viewer.clock.currentTime = startTime.clone();
  viewer.clock.shouldAnimate = true;
  viewer.clock.multiplier = 1;

  // 4.2.5 监听渲染事件，实时更新视锥和拍摄区域
  viewer.scene.preRender.addEventListener(onPreRender);
}

// ============================================================
// 5. 视锥体创建与更新
// ============================================================

function createFrustum() {
  frustumEntity = viewer.entities.add({
    position: new Cesium.CallbackProperty(() => {
      return droneEntity ? droneEntity.position.getValue(viewer.clock.currentTime) : Cesium.Cartesian3.ZERO;
    }, false),
    orientation: new Cesium.CallbackProperty(() => {
      return droneEntity ? droneEntity.orientation.getValue(viewer.clock.currentTime) : Cesium.Quaternion.IDENTITY;
    }, false),
    frustum: new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(FRUSTUM_FOV),
      aspectRatio: FRUSTUM_ASPECT,
      near: 1,
      far: FRUSTUM_LENGTH
    }),
    color: Cesium.Color.GREEN.withAlpha(0.4),
    outline: true,
    outlineColor: Cesium.Color.WHITE
  });
}

// ============================================================
// 6. 预渲染事件：更新视锥 & 绘制已拍摄区域
// ============================================================

function onPreRender() {
  if (!droneEntity || !viewer.clock.shouldAnimate) return;

  const time = viewer.clock.currentTime;
  const position = droneEntity.position.getValue(time);
  if (!position) return;

  // 每隔一定帧数计算一次地面落点
  frameNum = ++frameNum % 100;
  if (frameNum !== 0 && frameNum !== 10) return;

  // 移除旧的视锥（通过控制显示/隐藏实现）
  // 实际项目中建议使用 Primitive 动态管理

  // 计算地面4个角点
  const groundPositions = calculateGroundPositions(position);

  if (groundPositions.length === 4) {
    // 绘制已拍摄区域多边形
    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: groundPositions,
        material: COLORS[colorIndex % COLORS.length],
        perPositionHeight: true,
        zIndex: colorIndex
      }
    });
    capturedPolygons.push(polygon);
    colorIndex++;
  }

  // 每隔10帧清理旧视锥
  if (frameNum === 10 && frustumEntity) {
    // 重建视锥以确保跟随无人机
    viewer.entities.remove(frustumEntity);
    createFrustum();
  }
}

// ============================================================
// 7. 计算视锥地面落点
// ============================================================

function calculateGroundPositions(dronePosition) {
  const positions = [];

  // 获取无人机朝向
  const orientation = droneEntity.orientation.getValue(viewer.clock.currentTime);
  const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);

  const heading = Cesium.Math.toDegrees(hpr.heading);
  const pitch = Cesium.Math.toDegrees(hpr.pitch);

  // 视锥4个角的方向（简化计算，实际需要更精确的视锥角计算）
  const halfFovH = FRUSTUM_FOV / 2;
  const halfFovV = (FRUSTUM_FOV / 2) * FRUSTUM_ASPECT;

  const directions = [
    { headingOffset: 0, pitchOffset: 0 },           // 中心
    { headingOffset: -halfFovH, pitchOffset: -halfFovV },  // 左上
    { headingOffset: halfFovH, pitchOffset: -halfFovV },    // 右上
    { headingOffset: halfFovH, pitchOffset: halfFovV },     // 右下
    { headingOffset: -halfFovH, pitchOffset: halfFovV }     // 左下
  ];

  for (const dir of directions) {
    const rayHeading = Cesium.Math.toRadians(heading + dir.headingOffset);
    const rayPitch = Cesium.Math.toRadians(pitch + dir.pitchOffset);

    // 创建射线
    const direction = Cesium.Cartesian3.fromDegrees(rayHeading, rayPitch, 1);
    direction.x = -Math.sin(rayHeading) * Math.cos(rayPitch);
    direction.y = Math.cos(rayHeading) * Math.cos(rayPitch);
    direction.z = Math.sin(rayPitch);
    Cesium.Cartesian3.normalize(direction, direction);

    const ray = new Cesium.Ray(dronePosition, direction);

    // 与球体/地形求交
    const pickedFeature = viewer.scene.pickRay(ray);
    if (pickedFeature) {
      positions.push(pickedFeature.position);
    } else {
      // 如果没有精确交点，使用近似计算
      const distance = FRUSTUM_LENGTH * 0.8;
      const pos = Cesium.Cartesian3.clone(dronePosition);
      Cesium.Cartesian3.addInPlace(pos, Cesium.Cartesian3.multiplyByScalar(direction, distance, new Cesium.Cartesian3()));
      positions.push(pos);
    }
  }

  return positions;
}

// ============================================================
// 工具函数
// ============================================================

function calculateDistance(coord1, coord2) {
  const lat1Rad = Cesium.Math.toRadians(coord1[1]);
  const lat2Rad = Cesium.Math.toRadians(coord2[1]);
  const lng1Rad = Cesium.Math.toRadians(coord1[0]);
  const lng2Rad = Cesium.Math.toRadians(coord2[0]);

  const dLat = lat2Rad - lat1Rad;
  const dLng = lng2Rad - lng1Rad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const earthRadius = 6371000; // 米
  return earthRadius * c;
}

// ============================================================
// 清理资源
// ============================================================

function destroy() {
  viewer.scene.preRender.removeEventListener(onPreRender);
  viewer.entities.removeAll();
  viewer.destroy();
}

// ============================================================
// 启动
// ============================================================

init();
```

---

## 五、进阶优化方案

### 5.1 使用 Primitive 替代 Entity（提升性能）

```javascript
// 创建自定义视锥几何体
function createFrustumPrimitive(position, orientation, length, fov, aspectRatio) {
  const frustum = new Cesium.PerspectiveFrustum({
    fov: Cesium.Math.toRadians(fov),
    aspectRatio: aspectRatio,
    near: 1,
    far: length
  });

  const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);

  // 手动计算4个角点和中心点，生成自定义Geometry
  const positions = [];
  // ... 根据视锥参数计算地面4角点

  const geometry = Cesium.BoxGeometry.fromPositions(positions);

  return new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.GREEN.withAlpha(0.4)
        )
      }
    }),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true
    })
  });
}
```

### 5.2 贴地飞行

```javascript
// 使用 sampleTerrainMostDetailed 实现贴地
const terrainProvider = viewer.terrainProvider;
const cartographics = ROUTE_POINTS.map(coord =>
  Cesium.Cartographic.fromDegrees(coord[0], coord[1])
);

Cesium.sampleTerrainMostDetailed(terrainProvider, cartographics)
  .then(function(updatedPositions) {
    // 将采样高度应用到路线点
    updatedPositions.forEach((cartographic, i) => {
      ROUTE_POINTS[i][2] = cartographic.height + 100; // 保持100米高度
    });
    createFlightRoute();
  });
```

### 5.3 视角跟随模式

```javascript
// 第一人称视角
viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

function followDrone() {
  const position = droneEntity.position.getValue(viewer.clock.currentTime);
  const orientation = droneEntity.orientation.getValue(viewer.clock.currentTime);

  // 相机位于无人机后上方
  const offset = new Cesium.Cartesian3(0, -50, 20);
  const cameraPosition = Cesium.Matrix4.multiplyByPoint(
    Cesium.Matrix4.fromQuaternion(orientation),
    offset,
    new Cesium.Cartesian3()
  );
  Cesium.Cartesian3.add(position, cameraPosition, cameraPosition);

  viewer.camera.setView({
    position: cameraPosition,
    orientation: {
      heading: Cesium.HeadingPitchRoll.fromQuaternion(orientation).heading,
      pitch: Cesium.Math.toRadians(-10),
      roll: 0
    }
  });
}
```

---


### 8.2 显示所有实体边框

```javascript
viewer.scene.debugShowFramesPerSecond = true;
viewer.scene.preRenderDebugFrustum = true;
```

### 8.3 禁用地形（调试用）

```javascript
viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
```

---
