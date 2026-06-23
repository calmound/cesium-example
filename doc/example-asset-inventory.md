# Cesium 案例资产盘点（第一版）

更新时间：2026-03-25

## 说明

这是一版面向“内容资产”的初筛，不是最终定稿。

本次盘点主要依据：

- `src/examples/cases/**` 中 95 个案例的 `ExampleMeta`
- 缩略图覆盖情况 `public/thumbnails/*.png`
- 案例标题、分类、难度、说明、功能点的表达强度

这版清单的目标不是做精确评分，而是先回答 3 个问题：

1. 哪些案例已经可以算项目门面资产
2. 哪些案例适合保留为教学骨架
3. 哪些案例名字很大，但当前需要优先重做

## 评级标准

- `A`：有门面潜力，适合首页展示、分类代表作、后续做深
- `B`：可保留，适合作为教学或分类补位案例
- `C`：概念价值弱或表达弱，后续可考虑合并、下架或重写

资产类型说明：

- `教学`：知识点单一、结构清晰、适合入门和查阅
- `展示`：偏视觉效果、动态效果或场景氛围
- `综合`：偏系统化叙事、组合能力或业务场景

处理建议说明：

- `保留`：继续保留，后续只需补图、补文案或局部增强
- `重做`：案例方向值得保留，但当前表现不足，建议重新设计
- `删除候选`：暂未使用，本次首版未标出

## 总览

- 案例总数：95
- 已有缩略图：77
- 缺少缩略图：18
- 初筛结构：`教学 56` / `展示 33` / `综合 6`
- 初筛评级：`A 30` / `B 65` / `C 0`

当前最明显的资产短板不是“数量不够”，而是“结构不均衡”：

- `3D Tiles` 整组 5 个案例全部缺缩略图，且都属于高价值方向
- `场景与粒子` 中 `大雾 / 雨 / 雪` 这类天然适合做门面的案例没有缩略图
- `综合应用` 中 `城市漫游系统` 这种本应做旗舰的题材没有缩略图

## 第一梯队：门面资产候选

这批案例建议优先当作“首页门面 + 分类代表作”维护。

- `drone-aerial` 无人机航拍模拟 | 综合 | A
- `smart-park` 智慧园区 | 综合 | A
- `smart-traffic` 智慧交通 | 综合 | A
- `cesium-three-integration` Cesium 融合 Three.js | 综合 | A
- `sunshine-analysis` 日照分析 | 展示 | A
- `flood-analysis` 淹没分析 | 展示 | A
- `radar-coverage` 雷达探测范围 | 展示 | A
- `satellite-track` 卫星轨迹模拟 | 展示 | A
- `video-3d-projection` 视频 3D 贴物投射 | 展示 | A
- `ocean-current` 海流可视化 | 展示 | A
- `wind-field` 风场流线可视化 | 展示 | A
- `flood-simulation` 洪水演进 | 展示 | A

这批资产的共同特点是题材有叙事感，天然适合做“看起来就有价值”的案例页。

## 第二梯队：核心教学骨架

这批案例建议作为“项目知识地图”的骨架保留。

- `viewer-init` Viewer 初始化配置
- `camera-control` 相机控制
- `coordinate-system` 坐标系与坐标转换
- `mouse-events` 鼠标事件与拾取
- `scene-mode` 二三维切换
- `xyz-tiles` XYZ 瓦片加载
- `geojson-loader` GeoJSON 加载与样式
- `kml-loader` KML / KMZ 加载
- `wfs-query` 矢量服务查询（WFS）
- `pixel-point` 像素点
- `billboard-icon` 图标 Billboard
- `label-text` 文字标注
- `polyline-basic` 基础线
- `curved-line` 曲线与 OD 弧线
- `polygon-face` 多边形面
- `rectangle-circle` 矩形、圆与扇形
- `terrain-basic` 地形加载与夸张
- `distance-measure` 距离与面积量算
- `primitive-vector` Primitive 高性能渲染
- `custom-shader-intro` CustomShader 入门

这些案例不一定最炫，但构成了整个项目的“教学主干”。后续整理资产时，应该优先保证它们的稳定、清晰和可复用。

## 优先重做队列

这些案例不是应该删除，而是“题材价值高，但当前表现不该停在这里”。

### P0：最该先重做

- `city-roaming` 城市漫游系统
  当前问题：题材足够旗舰，但缺缩略图，且从代码组织看更像简单盒子城市漫游，不像真正的“城市系统”
- `3dtiles-basic` 3D Tiles 基础加载
  当前问题：高频核心方向，但没有门面图，应该是 3D Tiles 分类入口案例
- `3dtiles-custom-shader` 3D Tiles CustomShader
  当前问题：方向非常强，但没有门面图，也不适合只停留在“教学说明”层
- `3dtiles-style` 3D Tiles 样式与属性查询
  当前问题：业务价值强，但现在缺少可感知成果物
- `3dtiles-offset` 3D Tiles 位置偏移纠正
  当前问题：工程价值高，但表达偏技术化，需要更强的前后对比效果

### P1：适合补成视觉门面

- `fog-effect` 大雾天气特效
- `rain-effect` 雨天特效
- `snow-effect` 雪天特效

## 资产层面的明确问题

- `3D Tiles` 分类整体偏弱，不像一个成熟分类
- `场景与粒子` 的天气案例有潜力，但资产化不足
- `综合应用` 里存在“标题承诺大于当前呈现”的情况
- `CZML` 案例文件名是 `czml-animation.ts`，元数据 id 正常，但其内嵌数据首项 id 为 `document`，后续做资产脚本时不要误判

## 全量清单

### 基础操作

- `viewer-init` Viewer 初始化配置 | 教学 | B | 保留 | 有缩略图 | 基础起点
- `camera-control` 相机控制 | 教学 | B | 保留 | 有缩略图 | 相机基础骨架
- `coordinate-system` 坐标系与坐标转换 | 教学 | B | 保留 | 有缩略图 | 坐标认知骨架
- `mouse-events` 鼠标事件与拾取 | 教学 | B | 保留 | 有缩略图 | 交互基础骨架
- `scene-mode` 二三维切换 | 教学 | B | 保留 | 有缩略图 | 场景模式入门

### 影像服务

- `xyz-tiles` XYZ 瓦片加载 | 教学 | B | 保留 | 有缩略图 | 建议作为影像分类入口
- `wms-service` WMS 地图服务 | 教学 | B | 保留 | 无缩略图 | 可补服务对比图
- `wmts-service` WMTS 瓦片服务 | 教学 | B | 保留 | 无缩略图 | 可补瓦片层级图
- `tianditu-layer` 天地图 GCJ02 偏移修正 | 教学 | B | 保留 | 有缩略图 | 国内服务接入价值高
- `imagery-4490` EPSG:4490 影像加载 | 教学 | B | 保留 | 有缩略图 | 投影体系案例有价值
- `dynamic-imagery` 动态时序影像 | 教学 | B | 保留 | 有缩略图 | 可升级成展示型

### 点标注

- `pixel-point` 像素点 | 教学 | B | 保留 | 有缩略图 | 入门型
- `billboard-icon` 图标 Billboard | 教学 | B | 保留 | 有缩略图 | 常用型
- `label-text` 文字标注 | 教学 | B | 保留 | 有缩略图 | 常用型
- `div-marker` DIV 图标点 | 教学 | B | 保留 | 有缩略图 | 业务常用
- `panorama-point` 全景点展示 | 展示 | B | 保留 | 有缩略图 | 可往门面方向发展
- `cluster-points` 海量点聚合 | 教学 | B | 保留 | 无缩略图 | 建议补聚合层级图
- `draggable-point` 可拖拽标注 | 教学 | B | 保留 | 有缩略图 | 交互编辑价值高

### 线与路径

- `polyline-basic` 基础线 | 教学 | B | 保留 | 有缩略图 | 基础骨架
- `curved-line` 曲线与 OD 弧线 | 教学 | B | 保留 | 有缩略图 | 视觉较好
- `pipe-line` 管道线 | 教学 | B | 保留 | 有缩略图 | 行业化潜力
- `migration-effect` 迁徙流动效果 | 展示 | B | 保留 | 有缩略图 | 可当分类门面
- `flight-path` 飞行轨迹 | 展示 | B | 保留 | 有缩略图 | 容易出效果
- `roaming-route` 路线漫游 | 展示 | B | 保留 | 有缩略图 | 与综合类联动潜力高
- `road-network` 路网可视化 | 教学 | B | 保留 | 有缩略图 | 交通类基础

### 面与几何体

- `polygon-face` 多边形面 | 教学 | B | 保留 | 有缩略图 | 几何骨架
- `rectangle-circle` 矩形、圆与扇形 | 教学 | B | 保留 | 有缩略图 | 几何骨架
- `wall-geometry` 墙与扩散墙 | 展示 | B | 保留 | 有缩略图 | 有视觉强化空间
- `box-3d` 立体盒子与圆锥 | 教学 | B | 保留 | 有缩略图 | 入门型
- `sphere-3d` 球、半球与椭球 | 教学 | B | 保留 | 有缩略图 | 入门型
### 矢量数据

- `geojson-loader` GeoJSON 加载与样式 | 教学 | B | 保留 | 有缩略图 | 基础骨架
- `kml-loader` KML / KMZ 加载 | 教学 | B | 保留 | 有缩略图 | 基础骨架
- `czml-animation` CZML 时序动画 | 教学 | B | 保留 | 无缩略图 | 时间维度价值高
- `wfs-query` 矢量服务查询（WFS） | 教学 | B | 保留 | 有缩略图 | 服务接入骨架
- `route-planning` 路径规划查询 | 教学 | B | 保留 | 有缩略图 | 应用性强
- `primitive-vector` Primitive 高性能渲染 | 教学 | A | 保留 | 有缩略图 | 性能主题核心案例

### 地形分析

- `terrain-basic` 地形加载与夸张 | 教学 | B | 保留 | 无缩略图 | 应补基础门面图
- `terrain-excavation` 地形开挖 | 教学 | A | 保留 | 有缩略图 | 分类代表作
- `terrain-flattening` 地形压平与抬升 | 教学 | A | 保留 | 有缩略图 | 工程规划价值高
- `contour-line` 等高线 | 教学 | B | 保留 | 有缩略图 | 分类补位
- `slope-analysis` 坡度坡向分析 | 展示 | A | 保留 | 有缩略图 | 分析类门面候选
- `flood-analysis` 淹没分析 | 展示 | A | 保留 | 有缩略图 | 强门面资产
- `underground-mode` 地表透明（地下模式） | 教学 | B | 保留 | 有缩略图 | 地下空间题材不错

### 3D Tiles

- `3dtiles-basic` 3D Tiles 基础加载 | 教学 | B | 重做 | 无缩略图 | 应做成分类入口标杆
- `3dtiles-offset` 3D Tiles 位置偏移纠正 | 教学 | B | 重做 | 无缩略图 | 需强化前后对比
- `3dtiles-style` 3D Tiles 样式与属性查询 | 教学 | B | 重做 | 无缩略图 | 应强化属性驱动结果
- `3dtiles-custom-shader` 3D Tiles CustomShader | 展示 | A | 重做 | 无缩略图 | 潜力大但当前资产弱
- `3dtiles-flattening` 3D Tiles 模型压平 | 教学 | A | 保留 | 无缩略图 | 方向强，至少要补图

### 空间分析

- `distance-measure` 距离与面积量算 | 教学 | B | 保留 | 有缩略图 | 通用基础能力
- `buffer-analysis` 缓冲区分析 | 教学 | B | 保留 | 有缩略图 | GIS 方法价值高
- `sunshine-analysis` 日照分析 | 展示 | A | 保留 | 有缩略图 | 强门面候选
- `viewshed-analysis` 可视域分析 | 教学 | A | 保留 | 有缩略图 | 分析类代表作
- `volume-calculation` 方量计算 | 教学 | A | 保留 | 有缩略图 | 工程类代表作

### 水域特效

- `water-surface` 静态水面与反射水面 | 展示 | B | 保留 | 有缩略图 | 可继续强化质感
- `dynamic-river` 动态河流 | 展示 | B | 保留 | 有缩略图 | 行业展示潜力好
- `flood-simulation` 洪水演进 | 展示 | A | 保留 | 有缩略图 | 强门面资产
- `water-gate` 水闸水面升降 | 展示 | A | 保留 | 有缩略图 | 工程场景价值高

### 视频融合

- `video-material` 视频材质（面状） | 展示 | B | 保留 | 有缩略图 | 适合做基础入口
- `video-2d-projection` 视频 2D 投射 | 展示 | B | 保留 | 有缩略图 | 可以和 3D 投射配对
- `video-3d-projection` 视频 3D 贴物投射 | 展示 | A | 保留 | 有缩略图 | 强门面资产
- `video-editor` 视频融合编辑 | 展示 | A | 保留 | 有缩略图 | 产品化潜力高

### 场景与粒子

- `particle-effects` 粒子效果 | 展示 | B | 保留 | 有缩略图 | 适合做总览型入口
- `rain-effect` 雨天特效 | 展示 | B | 重做 | 无缩略图 | 应做成明显天气氛围图
- `snow-effect` 雪天特效 | 展示 | B | 重做 | 无缩略图 | 需要更强氛围和构图
- `fog-effect` 大雾天气特效 | 展示 | A | 重做 | 无缩略图 | 很适合做门面案例
- `skybox-scene` 天空盒场景 | 展示 | B | 保留 | 有缩略图 | 可与天气组联动
- `point-light` 点光源与聚光灯 | 展示 | B | 保留 | 有缩略图 | 夜景场景有潜力
- `volume-cloud` 积云与气象三维体 | 展示 | A | 保留 | 有缩略图 | 视觉潜力高
- `weather-effects` 雨雪雾天气特效 | 展示 | B | 保留 | 有缩略图 | 可作为天气总览

### 材质与Shader

- `radar-scan` 雷达扫描材质 | 展示 | B | 保留 | 有缩略图 | 常见视觉能力
- `diffusion-point` 扩散点材质 | 展示 | B | 保留 | 有缩略图 | 常见视觉能力
- `water-ripple` 水波纹材质 | 展示 | B | 保留 | 有缩略图 | 常见视觉能力
- `flowing-line` 流动线材质 | 展示 | B | 保留 | 有缩略图 | 常见视觉能力
- `building-flicker` 建筑扫光 CustomShader | 展示 | A | 保留 | 有缩略图 | 强门面候选
- `custom-shader-intro` CustomShader 入门 | 教学 | A | 保留 | 有缩略图 | Shader 教学入口

### 数据可视化

- `heatmap-3d` 三维热力图 | 展示 | B | 保留 | 有缩略图 | 分类入口候选
- `hexagon-heatmap` 蜂窝热力图 | 展示 | B | 保留 | 有缩略图 | 数据聚合表达好
- `isocontour` 等值面（Kriging 插值） | 展示 | A | 保留 | 有缩略图 | 数据场景代表作
- `ocean-current` 海流可视化 | 展示 | A | 保留 | 有缩略图 | 门面价值高
- `wind-field` 风场流线可视化 | 展示 | A | 保留 | 有缩略图 | 门面价值高

### 雷达与卫星

- `radar-coverage` 雷达探测范围 | 展示 | A | 保留 | 有缩略图 | 分类门面
- `satellite-track` 卫星轨迹模拟 | 展示 | A | 保留 | 有缩略图 | 分类门面
- `uav-track` 低空无人机实时轨迹 | 教学 | A | 保留 | 有缩略图 | 与综合类联动潜力高
- `cone-sensor` 圆锥体传感器 | 教学 | B | 保留 | 有缩略图 | 入门补位

### 综合应用

- `smart-park` 智慧园区 | 综合 | A | 保留 | 有缩略图 | 门面资产
- `smart-traffic` 智慧交通 | 综合 | A | 保留 | 有缩略图 | 门面资产
- `typhoon-track` 台风路径追踪 | 展示 | B | 保留 | 有缩略图 | 可做专题入口
- `city-roaming` 城市漫游系统 | 综合 | A | 重做 | 无缩略图 | 当前承诺大于呈现
- `cesium-three-integration` Cesium 融合 Three.js | 综合 | A | 保留 | 有缩略图 | 独特性强
- `drone-aerial` 无人机航拍模拟 | 综合 | A | 保留 | 有缩略图 | 强门面资产

## 建议的资产整理顺序

如果下一阶段只做内容资产，不碰工程优化，建议按这个顺序推进：

1. 先定 12 个门面案例，作为项目对外形象
2. 再定 20 个教学骨架案例，作为知识体系主线
3. 优先重做 `3D Tiles` 整组和 `city-roaming`
4. 补齐所有高价值案例缩略图
5. 最后再处理剩余分类的“补位型”案例

## 这份清单的用途

后续你可以直接基于这份文档继续做三件事：

- 选出“首页展示集”
- 选出“必须保留的教学主干”
- 标记“需要整组重做的分类”

如果继续往下做，下一步最合理的是把这份文档再收敛成一份更强执行性的清单：

- `门面案例 12 个`
- `教学主干 20 个`
- `重做清单 10 个`

这样后续每次只处理一个小集合，不会重新陷入 95 个案例一起看的混乱里。
