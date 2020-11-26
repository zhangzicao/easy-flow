# easy-flow

## 项目介绍
`easy-flow` 基于VUE+ElementUI+JsPlumb的流程设计器，通过 vuedraggable 插件来实现节点拖拽。


## 功能介绍
* 支持自定义节点内容
* 支持自定义表单编辑
* 支持自定义状态
* 支持拖拽添加节点
* 点击线进行设置条件
* 支持给定数据加载流程图
* 支持画布拖拽
* 支持连线样式、锚点、类型自定义覆盖
* 支持力导图

## 更新日志

2020年11月26日

* 新UI；提供组件属性来配置，实现业务和组件的分离；新增自定义状态、节点内容、表单

2020年11月12日

* 新增力导图自适应布局，只需要提供节点、节点和节点之间的关系即可自动计算坐标（比没有坐标好些）

2020年8月6日

* 新增自连接样例

2020年8月6日

* 新增缩放（还存在一些问题）
* 新增使用说明
* 新增拖拽回调
* 节点新增viewOnly参数，可以控制节点是否只读

2020年6月14日
* 新增：连线自定义类型
* 新增：连线自定义锚点
* 新增：连线制自定义样式

2020年5月10日

* 修改jsplumb源码
* 支持label设置和修改
* 新增节点状态

2020年5月6日
* 新增: 连线条件支持
* 重构: 布局重构
* 删除: show控制显示参数
* 新增: 画布拖拽

2020年3月14日
* 页面样式调整
* 新增类型参数
* 新增菜单样式调整

2019年12月09日
* 修复移动节点位置后，点击【流程信息】时节点信息位置未更新问题

2019年12月08日
* 去除_this定义，使用箭头函数

2019年11月26日
* 修复： 修复删除节点时把其他的线也删除了
* 优化： 优化代码结构
* 修改版本： 修改lodash版本为4.17.15

2019年11月25日
* 修复加载数据时nodeId不唯一问题

2019年08月23日
* 修改IE 11.316版本下无法拖拽问题
* 新增演示环境地址， [演示地址](http://xiaoka2017.gitee.io/easy-flow/#?_blank)

2019年08月22日
* 修改火狐浏览器下不能够拖拽问题

## 操作说明
* 左侧菜单子节点可以拖拽，将其拖拽到右侧画板中松开鼠标即可添加一个节点
* 节点分为2部分，左边为标识节点的图标，中间节点的描述，鼠标从内部部分上可以拖拽出连线，可以连接其他节点，拖动其他位置可以改变节点在页面的位置

## 数据格式
``` json

 {
    name: '流程D',
    nodeList: [
        {
            id: 'nodeA',
            name: '流程D-节点A',
            type: 'task',
            left: '18px',
            top: '223px'
        },
        {
            id: 'nodeB',
            type: 'task',
            name: '流程D-节点B',
            left: '351px',
            top: '96px',
            viewOnly: true
        },
        {
            id: 'nodeC',
            name: '流程D-节点C',
            type: 'task',
            left: '354px',
            top: '351px'
        }, {
            id: 'nodeD',
            name: '流程D-节点D',
            type: 'task',
            left: '723px',
            top: '215px'
        }
    ],
    lineList: [{
        from: 'nodeA',
        to: 'nodeB',
        label: '直线,自定义线样式,固定锚点',
        connector: 'Straight',
        anchors: ['Top', 'Bottom'],
        paintStyle: {strokeWidth: 2, stroke: '#1879FF'}
    }, {
        from: 'nodeA',
        to: 'nodeC',
        label: '贝塞尔曲线,固定锚点',
        connector: 'Bezier',
        anchors: ['Bottom', 'Left']
    }, {
        from: 'nodeB',
        to: 'nodeD',
        label: '默认连线样式,动态锚点'
    }, {
        from: 'nodeC',
        to: 'nodeD',
        label: '默认连线样式,动态锚点'
    }
    ]
}

```
## FlowPanel 组件参数说明
|    参数    |    必填    |      描述      |      可选值      |
| :--------: | :------------: | ---------- | ---------- |
|  data  |  是  |   节点数据，需使用sync修饰符      |         |
|  stateList  |  否  |     自定义状态      |           |
|  formRules | 否 | 节点表单的自定义验证 |  |
|  viewMode  |  否  | 是否开启只预览模式  |

## data 参数说明
|    参数    |      描述      |
| :--------: | :------------: |
|  name  |     流程图名称      |
|  nodeList  |     流程图节点数组      |
|  lineList  |     流程图线数组      |

## nodeList 参数说明
|    参数    |    必填    |      描述      |      可选值      |
| :--------: | :------------: | ---------- | ---------- |
|  id  |  是  |     标识唯一的节点、可以与业务ID相结合      |           |
|  name  |  是  |   节点名称      |         |
|  type | 是 | 节点类型，可以和业务相结合做处理 |  |
|  left  |  是  | 节点在页面上的X坐标，以px结尾  |         |
|  top  |  是  |  节点在页面上的Y坐标，以px结尾 |         |
|  state  |  否  |   状态 |
|  viewOnly  |  否  |   是否仅用于浏览，true: 不可拖拽   | true 、false|




## lineList 参数说明
|    参数    |    必填    |      备注      |      可选值      |
| :--------: | :------------: | -------------- | -------------- |
|  from  |  是  |     连线的起始节点的ID      |           |
|  to  |  是  |   连线的终点节点ID      |         |
|  label  |  否  |   连线上的描述信息   |         |
| anchors | 否 | 连线的起始锚点位置，如：["Top","Right"] | ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'], |
| connector | 否 | 连线类型 | StateMachine、Flowchart，Bezier、Straight |

## stateList 参数说明
|    参数    |      描述      |
| :--------: | :------------: |
|  state  |     状态的值      |
|  label  |     状态的名称      |
|  color  |     该状态下节点的颜色      |

## 如何集成

- 下载源码

- 在自己的vue工程中找到package.json，并引入如下依赖（不用额外引入jsplumb）

  ```js
    "element-ui": "2.9.1",
    "vue": "^2.5.2",
    "vuedraggable": "2.23.0"
  ```

- 将easy-flow/src/components/flowPanel 目录复制到自己工程的一个目录下（如/src/views）

- 修改main.js，引入elementUI和easy-flow样式

  ```js
  import ElementUI from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'
  Vue.use(ElementUI, {size: 'small'})
  ```


## 启动

``` bash
# 下载工程
git clone  https://github.com/BiaoChengLiu/easy-flow.git

# 安装依赖包
npm install

# 启动
npm run dev

# 访问地址
 http://localhost:8080
```

## 协议
符合项目package.json中使用的插件中规定的协议即可

## 学习资料
| 名称        | 地址                                             | 说明                         |
| ----------- | ------------------------------------------------ | ---------------------------- |
| 后端SDK     | https://gitee.com/xiaoka2017/easy-flow-sdk       | 一个后端数据存储、操作的案例 |
| 学习资料    | https://www.cnblogs.com/mq0036/p/7942139.html    |                              |
| jsplumb官网 | http://jsplumb.github.io/jsplumb/home.html#setup | jsplumb官网api说明           |

