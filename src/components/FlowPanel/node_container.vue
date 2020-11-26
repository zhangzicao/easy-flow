<template>
  <div ref="efContainer" class="ef-container" v-flowDrag>
    <template v-for="node in data.nodeList">
      <flow-node
        :id="node.id"
        :key="node.id"
        :node="node"
        :activeElement="activeElement"
        :color="getNodeColor(node)"
        @changeNodeSite="changeNodeSite"
        @nodeRightMenu="nodeRightMenu"
        @clickNode="clickNode"
      >
        <slot :node="node"></slot>
      </flow-node>
    </template>
    <!-- 给画布一个默认的宽度和高度 -->
    <div style="position:absolute;top: 4000px;left: 4000px;">&nbsp;</div>
  </div>
</template>
<script>
  // import { jsPlumb } from 'jsplumb'
  // 使用修改后的jsplumb
  import './jsplumb'
  import flowNode from '@/components/FlowPanel/node'
  import {easyFlowMixin} from '@/components/FlowPanel/mixins'

  export default {
    components: { flowNode },
    // 一些基础配置移动该文件中
    mixins: [easyFlowMixin],
    props: {
      viewMode: {},
      data: {},
      activeElement: {},
      stateList: {
        type: Array
      }
    },
    data() {
      return {
        // jsPlumb 实例
        jsPlumb: null,
        zoom: 1
      }
    },
    directives: {
      'flowDrag': {
        bind(el, binding, vnode, oldNode) {
          if (!binding) {
            return
          }
          el.onmousedown = (e) => {
            if (e.button == 2) {
              // 右键不管
              return
            }
            //  鼠标按下，计算当前原始距离可视区的高度
            let disX = e.clientX
            let disY = e.clientY
            el.style.cursor = 'move'

            document.onmousemove = function (e) {
              // 移动时禁止默认事件
              e.preventDefault()
              const left = e.clientX - disX
              disX = e.clientX
              el.scrollLeft += -left

              const top = e.clientY - disY
              disY = e.clientY
              el.scrollTop += -top
            }

            document.onmouseup = function (e) {
              el.style.cursor = 'auto'
              document.onmousemove = null
              document.onmouseup = null
            }
          }
        }
      }
    },
    mounted() {
      this.jsPlumb = jsPlumb.getInstance()
      this.jsPlumbInit()
    },
    methods: {
      // 改变节点的位置
      changeNodeSite(data) {
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i]
          if (node.id === data.nodeId) {
            node.left = data.left
            node.top = data.top
          }
        }
      },
      nodeRightMenu(nodeId, evt) {
        this.$emit('node-right-menu',nodeId, evt)
      },
      clickNode(nodeId, evt) {
        this.$emit('click-node', nodeId, evt)
      },
      jsPlumbInit() {
        this.jsPlumb.ready(() => {
          // 导入默认配置
          this.jsPlumb.importDefaults(this.jsplumbSetting)
          // 会使整个jsPlumb立即重绘。
          this.jsPlumb.setSuspendDrawing(false, true);
          // 初始化节点
          this.loadEasyFlow()
          // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
          this.jsPlumb.bind('click', (conn, originalEvent) => {
            this.activeElement.type = 'line'
            this.activeElement.sourceId = conn.sourceId
            this.activeElement.targetId = conn.targetId
            this.$emit('click-line',{
              from: conn.sourceId,
              to: conn.targetId,
              label: conn.getLabel()
            })
          })
          // 连线
          this.jsPlumb.bind("connection", (evt) => {
            let from = evt.source.id
            let to = evt.target.id
            if (this.loadEasyFlowFinish) {
              this.data.lineList.push({from: from, to: to})
            }
          })

          // 删除连线回调
          this.jsPlumb.bind("connectionDetached", (evt) => {
            this.deleteLine(evt.sourceId, evt.targetId)
          })

          // 改变线的连接节点
          this.jsPlumb.bind("connectionMoved", (evt) => {
            this.changeLine(evt.originalSourceId, evt.originalTargetId)
          })

          // 连线右击
          this.jsPlumb.bind("contextmenu", (evt) => {
            console.log('contextmenu', evt)
          })

          // 连线
          this.jsPlumb.bind("beforeDrop", (evt) => {
            let from = evt.sourceId
            let to = evt.targetId
            if(this.viewMode){
              //查看模式
              return false
            }
            if (from === to) {
              // this.$message.error('节点不支持连接自己')
              return false
            }
            if (this.hasLine(from, to)) {
              this.$message.error('该关系已存在,不允许重复创建')
              return false
            }
            if (this.hashOppositeLine(from, to)) {
              this.$message.error('不支持两个节点之间连线回环');
              return false
            }
            if (!this.allowDrop(to)) {
              return false
            }
            this.$message.success('连接成功')
            return true
          })

          // beforeDetach
          this.jsPlumb.bind("beforeDetach", (evt) => {
            console.log('beforeDetach', evt)
          })
          this.jsPlumb.setContainer(this.$refs.efContainer)
        })
      },
      // 加载流程图
      loadEasyFlow() {
        // 初始化节点
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i]
          // 设置源点，可以拖出线连接其他节点
          this.jsPlumb.makeSource(node.id, {...this.jsplumbSourceOptions})
          // // 设置目标点，其他源点拖出的线可以连接该节点
          this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
          if (!node.viewOnly) {
            this.jsPlumb.draggable(node.id, {
              containment: 'parent',
              // stop: function (el) {
              //   // 拖拽节点结束后的回调
              //   console.log('拖拽结束: ', el)
              // }
            })
          }
        }
        // 初始化连线
        for (var i = 0; i < this.data.lineList.length; i++) {
          let line = this.data.lineList[i]
          var connParam = {
            source: line.from,
            target: line.to,
            label: line.label ? line.label : '',
            connector: line.connector ? line.connector : '',
            anchors: line.anchors ? line.anchors : undefined,
            paintStyle: line.paintStyle ? line.paintStyle : undefined,
          }
          this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
        }
        this.$nextTick(function () {
          this.loadEasyFlowFinish = true
        })
      },
      // 设置连线条件
      setLineLabel(from, to, label) {
        var conn = this.jsPlumb.getConnections({
          source: from,
          target: to
        })[0]
        if (!label || label === '') {
          conn.removeClass('flowLabel')
          conn.addClass('emptyFlowLabel')
        } else {
          conn.addClass('flowLabel')
        }
        conn.setLabel({
          label: label,
        })
      },
      addNode(node){
        this.data.nodeList.push(node)
        this.$nextTick( ()=> {
          this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)
          this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            // stop: function (el) {
            //   // 拖拽节点结束后的回调
            //   console.log('拖拽结束: ', el)
            // }
          })
        })
      },
      // 删除线
      deleteLine(from, to) {
        this.data.lineList = this.data.lineList.filter(function (line) {
          if (line.from == from && line.to == to) {
            return false
          }
          return true
        })
      },
      // 改变连线
      changeLine(oldFrom, oldTo) {
        this.deleteLine(oldFrom, oldTo)
      },
      // 是否具有该线
      hasLine(from, to) {
        for (var i = 0; i < this.data.lineList.length; i++) {
          var line = this.data.lineList[i]
          if (line.from === from && line.to === to) {
            return true
          }
        }
        return false
      },
      // 是否含有相反的线
      hashOppositeLine(from, to) {
        return this.hasLine(to, from)
      },
      // 判断是否允许放下连线
      allowDrop(to) {
        var item = this.data.nodeList.filter((m)=>m.id==to)[0]
        if(item && (item.disabledDrop || item.type === 'start'))
          return false
        return true
      },
      // 加载流程图
      dataReload(data) {
        this.$emit('update:data', this.$deepClone(data))
      },
      zoomAdd() {
        if (this.zoom >= 1) {
          return
        }
        this.zoom = this.zoom + 0.1
        this.$refs.efContainer.style.transform = `scale(${this.zoom})`
        this.jsPlumb.setZoom(this.zoom)
      },
      zoomSub() {
        if (this.zoom <= 0) {
          return
        }
        this.zoom = this.zoom - 0.1
        this.$refs.efContainer.style.transform = `scale(${this.zoom})`
        this.jsPlumb.setZoom(this.zoom)
      },
      getNodeColor(node){
        var result = (this.stateList||[]).filter((item)=>item.state==node.state)
        if(result.length>0)
          return result[0].color
      },
      destroy(){
        if(this.jsPlumb){
          this.jsPlumb.reset()
        }
      }
    },
    beforeDestroy() {
      this.destroy()
    },
    watch: {
      data: function () {
        this.jsPlumb.reset()
        this.$nextTick(() => {
          this.jsPlumbInit()
        })
      }
    }
  }
</script>
