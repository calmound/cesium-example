实现cesium案例演示平台

# 一、整体产品结构

建议直接做成两层页面：

## 1）案例列表页

作用是展示所有案例、分类、搜索、跳转。

建议包含这些模块：

* 顶部：项目标题 + 搜索框
* 左侧：案例分类
* 右侧：案例卡片列表
* 每个卡片展示：

  * 案例名称
  * 简介
  * 标签
  * 缩略图
  * “查看案例”按钮

### 推荐分类

* 基础入门
* 数据可视化
* 三维场景
* 空间分析
* 特效动画
* 综合项目

---

## 2）案例详情页

这是核心页面，建议采用 **左右分栏**：

### 左侧：代码区

* 代码编辑器
* 工具栏
* 文件切换
* 运行 / 重置 / 格式化
* 支持代码修改后更新右侧预览

### 右侧：案例演示区

* Cesium 运行画布
* 错误信息面板
* 控制台输出
* 可选参数控制区

---

# 二、详情页布局建议

最适合你的布局是：

```text
---------------------------------------------------------
| 顶部栏：返回列表 | 案例标题 | 运行 | 重置 | 全屏 |
---------------------------------------------------------
| 左侧代码区                    | 右侧预览区           |
| ---------------------------- | -------------------- |
| 文件树                        | Cesium Viewer        |
| editor                       |                      |
|                              | 错误面板 / 日志面板   |
---------------------------------------------------------
```

再细一点：

## 左侧

宽度建议 45% ~ 50%

包含：

### 1. 文件树

至少支持这几个虚拟文件：

* `main.ts`
* `style.css`
* `data.json`
* `config.ts`

如果你第一版想简单一点，也可以先只放一个 `main.ts`。

### 2. 代码编辑器

推荐 Monaco Editor。

原因：

* 体验接近 VS Code
* 支持 TS/JS 语法高亮
* 可扩展自动补全
* 很适合做在线示例平台

### 3. 工具按钮

建议有：

* 运行
* 自动运行开关
* 重置
* 格式化
* 复制代码
* 下载源码

---

## 右侧

宽度建议 50% ~ 55%

包含：

### 1. 预览容器

用于挂载 Cesium。

### 2. 日志与错误面板

当代码运行失败时，不要只黑屏，要把错误展示出来。

例如：

* 语法错误
* Cesium token 缺失
* 资源加载失败
* 运行时异常

### 3. 案例说明区

可以放在右侧底部，或者做成可折叠抽屉。

内容包括：

* 案例介绍
* 技术点
* 数据来源
* 操作说明

---

# 三、核心交互：左侧代码更新，右侧如何同步

这部分是关键。

## 推荐方案：编辑器 + iframe 预览沙箱

不要让编辑器代码直接在主页面执行，最好放到 **iframe 沙箱** 中运行。

原因：

* 隔离样式污染
* 避免多个案例之间互相干扰
* 方便销毁和重建 Cesium Viewer
* 更新逻辑更清晰

---

## 运行机制建议

### 方式一：点击“运行”后更新

适合第一版，最稳。

流程：

1. 用户修改左侧代码
2. 点击“运行”
3. 将代码传给 iframe
4. iframe 清空旧场景
5. 重建 Cesium Viewer
6. 执行新代码
7. 右侧显示最新结果

这是最推荐的起步方案。

---

### 方式二：自动运行

进阶版可加一个开关：

* 开启后：代码变更 500ms~1000ms 防抖更新
* 关闭后：必须手动点运行

这样既方便，又不会每敲一个字就重跑。

---

# 四、建议的技术实现方式

*  **React + Vite**
* **Monaco Editor**
* **CesiumJS**
* **iframe 沙箱预览**
* 状态管理可用 Zustand
* 持久化用 localStorage

---

# 五、案例数据结构怎么设计

建议不要把案例写死在路由里，而是维护一个统一配置。

例如：

```ts
export interface ExampleMeta {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  level: 'easy' | 'medium' | 'hard'
  cover?: string
  files: {
    [filename: string]: string
  }
}
```

示例：

```ts
export const examples = [
  {
    id: 'entity-point-basic',
    title: '基础点标注',
    category: '基础入门',
    description: '展示 Cesium 中点实体的创建与样式设置',
    tags: ['Entity', 'Point', 'Label'],
    level: 'easy',
    files: {
      'main.ts': `...`,
      'style.css': `...`
    }
  }
]
```

这样好处很大：

* 列表页直接用它渲染
* 详情页直接读取 files
* 后续支持搜索、筛选、标签分类
* 以后甚至可以对接后台

---

# 六、详情页组件拆分建议

建议拆成下面几个核心组件：

## 1. ExampleHeader

顶部工具栏

职责：

* 返回列表
* 显示案例标题
* 运行
* 重置
* 全屏
* 自动运行开关

---

## 2. FileExplorer

左侧文件列表

职责：

* 切换当前编辑文件
* 新增文件
* 删除文件（后期可选）

---

## 3. CodeEditor

Monaco 包装组件

职责：

* 编辑代码
* 触发变更事件
* 支持只读 / 可编辑模式
* 语言切换

---

## 4. PreviewFrame

右侧预览区

职责：

* 创建 iframe
* 接收代码
* 执行代码
* 回传错误与日志

---

## 5. ExampleDescription

案例说明组件

职责：

* 展示案例介绍
* 展示技术点
* 操作提示

---

## 6. ConsolePanel

日志输出面板

职责：

* 展示 console.log
* 展示运行错误
* 清空日志

---

# 七、代码更新机制怎么做最稳

## 推荐执行链路

### 主页面

维护当前代码状态：

```ts
{
  activeFile: 'main.ts',
  files: {
    'main.ts': '...',
    'style.css': '...'
  }
}
```

### 点击运行时

把全部文件内容发送给 iframe：

```ts
iframe.contentWindow.postMessage({
  type: 'RUN_CODE',
  payload: {
    files
  }
}, '*')
```

### iframe 内部

收到消息后：

1. 清理旧 viewer
2. 清空 DOM
3. 注入样式
4. 执行 main.ts 转译后的代码
5. 捕获错误
6. 回传主页面

---

## 为什么要“清理旧 viewer”

Cesium 场景很容易残留资源。

每次重新运行前要做：

* `viewer?.destroy()`
* 清空容器 DOM
* 清空事件监听
* 清空定时器

否则你会遇到：

* 内存涨
* 场景叠加
* 鼠标事件重复绑定
* 相机状态异常

---

# 八、支持更新的层级建议

你说“左侧代码支持更新”，建议分三层做，不要一步做到最复杂。

## 第一层：编辑 main.ts，点击运行

最简单，优先上线。

支持：

* 修改案例代码
* 点击运行更新右侧预览
* 点击重置恢复默认代码

---

## 第二层：多文件编辑

支持：

* `main.ts`
* `style.css`
* `mockData.ts`

这样案例复杂度上去后还能继续用。

---

## 第三层：代码持久化

支持用户刷新页面后不丢失修改。

建议：

* 默认代码来自案例仓库
* 用户修改后保存到 localStorage
* 点“重置”恢复初始版本

---

# 九、你这个平台最重要的不是编辑器，而是“案例组织”

建议每个案例不只是代码，还要有元信息。

例如：

```ts
{
  id: 'trajectory-playback',
  title: '轨迹回放',
  category: '数据可视化',
  description: '通过时间轴控制运动轨迹',
  tags: ['轨迹', '时间轴', '动画'],
  level: 'medium',
  files: { ... },
  guide: {
    features: [
      '车辆轨迹播放',
      '倍速控制',
      '相机跟随'
    ],
    points: [
      'SampledPositionProperty',
      'Clock 设置',
      'PathGraphics'
    ]
  }
}
```

这样详情页右侧除了演示，还能展示：

* 功能说明
* 技术点
* 使用方式

这会让你的平台从“demo 集合”升级成“学习平台”。

---

# 十、案例列表页建议怎么做

建议是 **分类 + 搜索 + 卡片**。

## 页面结构

* 顶部搜索
* 左侧分类菜单
* 右侧卡片区

## 卡片信息

* 标题
* 简介
* 标签
* 难度
* 封面图
* 进入详情按钮

## 支持能力

* 关键字搜索
* 按分类筛选
* 按难度筛选
* 最近查看
* 收藏案例（后期可加）

---

# 十一、最推荐的目录结构

```text
src/
  pages/
    examples/
      list/
        index.vue
      detail/
        index.vue

  components/
    example/
      ExampleHeader.vue
      FileExplorer.vue
      CodeEditor.vue
      PreviewFrame.vue
      ConsolePanel.vue
      ExampleDescription.vue

  store/
    example.ts

  examples/
    index.ts
    basic/
      point-basic.ts
      polyline-basic.ts
    scene/
      tileset-city.ts
    analysis/
      measure-distance.ts

  runtime/
    sandbox/
      iframe.html
      runner.ts
      message.ts

  utils/
    cesium/
      createViewer.ts
      destroyViewer.ts
      loadGeoJson.ts
```

---

# 十二、建议你先做 MVP 版本

别一开始就做成完整在线 IDE，先做最小可用版本。

## 第一版只做这些

### 列表页

* 分类
* 搜索
* 案例卡片

### 详情页

* 左侧单文件代码编辑器
* 右侧 Cesium 演示
* 运行
* 重置
* 错误显示

这样最快能落地。

---

# 十三、你这个需求对应的最佳页面方案

我直接帮你定一个最终版：

## 列表页

* 左侧分类树
* 右侧案例卡片网格
* 顶部搜索框
* 支持标签筛选

## 详情页

### 顶部

* 返回列表
* 案例名
* 运行
* 自动运行
* 重置
* 全屏

### 左侧

* 文件树
* Monaco 编辑器

### 右侧

* Cesium 演示区域
* 错误日志
* 案例说明

## 更新逻辑

* 编辑代码后点击运行
* 或自动运行防抖刷新
* 使用 iframe 隔离执行环境
* 每次运行前销毁旧 Viewer

---

# 十四、我建议你优先加的几个功能

最实用的是这几个：

* **运行**
* **重置**
* **自动运行**
* **报错面板**
* **复制源码**
* **下载源码**
* **保存本地修改**

这些功能一加，你的平台就已经很完整了。