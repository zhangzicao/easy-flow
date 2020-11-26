<template>
  <div class="flow-panel">
    <div class="ef-tooltar">
      <!--顶部工具菜单-->
      <span class="ef-toolbar__name" v-if="!nameEditing" @click="!viewMode && (nameEditing=!nameEditing)">{{data.name}}</span>
      <span v-else style="display:inline-block;width: 240px;">
        <el-input v-model="data.name">
          <el-button type="primary" slot="append" @click="nameEditing=!nameEditing">
            <i class="el-icon-check"></i>
          </el-button>
        </el-input>
      </span>
      <el-divider direction="vertical" v-if="!viewMode"></el-divider>
      <el-link v-if="!viewMode" type="primary" @click="$emit('save',data)" icon="el-icon-document-checked">保存</el-link>
      <el-divider direction="vertical" v-if="!viewMode"></el-divider>
      <button v-if="!viewMode" class="ef-toolbar__btn" type="button" @click="clearAll" title="清空"><i class="el-icon-document-delete"></i>
      </button>
      <el-divider direction="vertical"></el-divider>
      <button class="ef-toolbar__btn" type="button" @click="zoomAdd" title="放大"><i class="el-icon-zoom-in"></i></button>
      <el-divider direction="vertical"></el-divider>
      <button class="ef-toolbar__btn" type="button" @click="zoomSub" title="缩小"><i class="el-icon-zoom-out"></i>
      </button>
      <el-divider direction="vertical" v-if="!viewMode"></el-divider>
      <button v-if="!viewMode" class="ef-toolbar__btn" type="button" @click="deleteElement" :disabled="!this.activeElement.type" title="删除选中的节点/线段">
        <i class="el-icon-delete"></i></button>
      <el-divider direction="vertical"></el-divider>
      <el-link type="info" plain icon="el-icon-document" @click="openDataInfo">流程信息</el-link>
      <el-divider direction="vertical"></el-divider>
      <el-link type="info" icon="el-icon-question" @click="openHelp">帮助</el-link>
      <div class="ef-tooltar__right">
        <slot name="toolbar-right"></slot>
      </div>
    </div>
    <div class="ef-body">
      <div class="ef-sidebar">
        <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
      </div>
      <node-container :viewMode="viewMode"
                      :data="data"
                      :activeElement="activeElement"
                      :stateList="stateList"
                      :showStateIcon="showStateIcon"
                      @click-node="clickNode"
                      @click-line="clickLine"
                      ref="efContainer"
      >
        <template v-slot="{node}">
          <slot name="node" :node="node">
          </slot>
        </template>
      </node-container>
      <!-- 右侧表单 -->
      <div class="ef-right-aside">
        <flow-node-form ref="nodeForm" :viewMode="viewMode" :stateList="stateList" :node.sync="form" :nodeFormRules="formRules" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything">
          <slot name="form" :form="form"></slot>
        </flow-node-form>
      </div>
      <div class="legend-show-list" v-if="stateList && stateList.length>0">
        <div class="legend-show__item" v-for="item in stateList">
          <i class="legend-show__icon" :style="{borderLeftColor: item.color}"></i>
          {{item.label}}
        </div>
      </div>
    </div>
    <!-- 流程数据详情 -->
    <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
    <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
  </div>

</template>

<script>
  import nodeMenu from '@/components/FlowPanel/node_menu'
  import nodeContainer from '@/components/FlowPanel/node_container'
  import FlowInfo from '@/components/FlowPanel/info'
  import FlowHelp from '@/components/FlowPanel/help'
  import FlowNodeForm from './node_form'
  import {ForceDirected} from './force-directed'

  export default {
    props: {
      stateList: {
        type: Array
      },
      data: {},
      formRules: {},
      showStateIcon: {
        type: Boolean,
        default: false
      },
      viewMode: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        nameEditing: false, // 编辑名称中？
        // 控制流程数据显示与隐藏
        flowInfoVisible: false,
        flowHelpVisible: false,
        // 激活的元素、可能是节点、可能是连线
        activeElement: {
          // 可选值 node 、line
          type: undefined,
          // 节点ID
          nodeId: undefined,
          // 连线ID
          sourceId: undefined,
          targetId: undefined
        },
        form: {}
      }
    },
    components: {
      nodeMenu, FlowInfo, FlowNodeForm, nodeContainer, FlowHelp
    },
    mounted() {
    },
    methods: {
      // 返回唯一标识
      getUUID() {
        return Math.random().toString(36).substr(3, 10)
      },
      // 删除激活的元素
      deleteElement() {
        var efContainer = this.$refs.efContainer
        if (this.activeElement.type === 'node') {
          this.deleteNode(this.activeElement.nodeId)
        } else if (this.activeElement.type === 'line') {
          this.$confirm('确定删除所点击的线吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            var conn = efContainer.jsPlumb.getConnections({
              source: this.activeElement.sourceId,
              target: this.activeElement.targetId
            })[0]
            efContainer.jsPlumb.deleteConnection(conn)
            this.$refs.nodeForm.type='';
          }).catch(() => {
          })
        }
      },
      /**
       * 拖拽结束后添加新的节点
       * @param evt
       * @param nodeMenu 被添加的节点对象
       * @param mousePosition 鼠标拖拽结束的坐标
       */
      addNode(evt, nodeMenu, mousePosition) {
        if(this.viewMode) return;
        var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
        let efContainer = this.$refs.efContainer.$el
        var containerRect = efContainer.getBoundingClientRect()
        var left = screenX, top = screenY
        // 计算是否拖入到容器中
        if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
          this.$message.error("请把节点拖入到画布中")
          return
        }
        left = left - containerRect.x + efContainer.scrollLeft
        top = top - containerRect.y + efContainer.scrollTop
        // 居中
        left -= 85
        top -= 16
        var nodeId = this.getUUID()
        // 动态生成名字
        var origName = nodeMenu.name
        var nodeName = origName
        var index = 1
        while (index < 10000) {
          var repeat = false
          for (var i = 0; i < this.data.nodeList.length; i++) {
            let node = this.data.nodeList[i]
            if (node.name === nodeName) {
              nodeName = origName + index
              repeat = true
            }
          }
          if (repeat) {
            index++
            continue
          }
          break
        }
        var node = {
          id: nodeId,
          name: nodeName,
          type: nodeMenu.type,
          left: left + 'px',
          top: top + 'px',
          style: nodeMenu.style,
          state: 'success'
        }

        this.$refs.efContainer.addNode(node)
      },
      /**
       * 删除节点
       * @param nodeId 被删除节点的ID
       */
      deleteNode(nodeId) {
        var name =  ''
        this.data.nodeList.forEach(function (node) {
          if (node.id === nodeId)
            name = node.name
        })
        this.$confirm('确定要删除节点：' + name + '?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false
        }).then(() => {
          /**
           * 这里需要进行业务判断，是否可以删除
           */
          this.data.nodeList = this.data.nodeList.filter(function (node) {
            if (node.id === nodeId) {
              // 伪删除，将节点隐藏，否则会导致位置错位
              // node.show = false
              return false
            }
            return true
          })
          this.$nextTick(function () {
            this.$refs.efContainer.jsPlumb.removeAllEndpoints(nodeId);
            this.$refs.nodeForm.type='';
          })
        }).catch(() => {
        })
        return true
      },
      clickNode(nodeId) {
        this.activeElement.type = 'node'
        this.activeElement.nodeId = nodeId
        this.$refs.nodeForm.nodeInit(this.data, nodeId)
      },
      clickLine(line) {
        this.$refs.nodeForm.lineInit(this.data,line)
      },
      // 设置连线条件
      setLineLabel(from, to, label) {
        var efContainer = this.$refs.efContainer
        efContainer.setLineLabel(from, to, label)
      },
      repaintEverything() {
        this.$refs.efContainer.jsPlumb.repaint()
      },
      // 流程数据信息
      openDataInfo() {
        this.flowInfoVisible = true
        this.$nextTick(function () {
          this.$refs.flowInfo.init()
        })
      },
      openHelp() {
        this.flowHelpVisible = true
        this.$nextTick( ()=> {
          this.$refs.flowHelp.init()
        })
      },
      // 清空
      clearAll() {
        this.$confirm('确定要清空画布?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false
        }).then(() => {
          this.dataReload({
            name: this.data.name,
            nodeList: [],
            lineList: []
          })
        }).catch(() => {
        })
      },
      // 加载流程图
      dataReload(data) {
        this.$emit('update:data', this.$deepClone(data))
      },
      zoomAdd() {
        this.$refs.efContainer.zoomAdd()
      },
      zoomSub() {
        this.$refs.efContainer.zoomSub()
      },
    }
  }
</script>

<style>
  @import "index.css";

  .flow-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }

  /*顶部工具栏*/
  .ef-tooltar {
    flex: none;
    padding: 5px 15px;
    box-sizing: border-box;
    line-height: 32px;
    z-index: 3;
    border-bottom: 1px solid #DADCE0;
  }

  .ef-toolbar__name {
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    padding: 5px 10px;
    cursor: pointer;
  }

  .ef-toolbar__btn {
    outline: none;
    box-shadow: none;
    /*border: 1px solid #eee;*/
    /*background: #eeeeee;*/
    border: none;
    background: none;
    line-height: 20px;
    padding: 6px 10px;
    box-sizing: border-box;
    text-align: center;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
  }

  .ef-toolbar__btn--danger {
    color: #ee3333;
  }

  .ef-toolbar__btn:hover {
    /*background: #e0e0e0;*/
  }

  .ef-toolbar__btn[disabled] {
    color: #333333;
    opacity: 0.6;
    /*background: #eeeeee!important;*/
    cursor: not-allowed;
  }

  .ef-tooltar__right {
    float: right;
  }

  .jtk-overlay {
    cursor: pointer;
    color: #4A4A4A;
  }

  .ef-body {
    display: flex;
    flex: auto;
    position: relative;
  }
  .ef-sidebar{
    width: 60px;
    border-right: 1px solid #dce3e8;
    overflow: auto;
  }
  .ef-right-aside{
    width: 300px;
    border-left: 1px solid #dce3e8;
    background-color: #FBFBFB;
  }
</style>
