<template>
    <div
            ref="node"
            :style="nodeContainerStyle"
            @click="clickNode"
            @mouseup="changeNodeSite"
            :class="nodeContainerClass"
            @mouseenter="isHover=true"
            @mouseleave="isHover=false"
    >
        <!-- 最左侧的那条竖线 -->
        <div class="ef-node-left" :style="{background: color}"></div>
        <!-- 节点类型的图标 -->
        <div class="ef-node-left-ico" :style="{color: color}">
            <i :class="nodeIcoClass"></i>
        </div>
        <!-- 节点名称 -->
        <div :class="nodeNameClass" :title="node.name" :style="{color: color}">
          <template v-if="!$slots || !$slots.default">{{node.name}}</template>
          <slot :node="node"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            node: Object,
            activeElement: Object,
            color: String,
            showStateIcon: {
              type: Boolean,
              default: false
            }
        },
        data() {
            return {
              isHover: false
            }
        },
        computed: {
          isActive(){
            return this.activeElement.type == 'node' ? this.activeElement.nodeId === this.node.id : false
          },
            nodeContainerClass() {
                return {
                    'ef-node-container': true,
                    'ef-node-active': this.activeElement.type == 'node' ? this.activeElement.nodeId === this.node.id : false,
                    ['ef-node_'+this.node.type]: true,
                    ['ef-node--color']: !!this.color,
                    'ef-node_round': this.node.type=='start' || this.node.type=='end',
                }
            },
            // 节点容器样式
            nodeContainerStyle() {
                return {
                    top: this.node.top,
                    left: this.node.left,
                    'border-color': this.isActive || this.isHover? this.color || '#1879FF': '#d7d7d7'
                }
            },
            nodeIcoClass() {
                var nodeIcoClass = {}
                var type = this.node.type
                if(type=='start') nodeIcoClass['el-icon-video-play'] = true
                if(type=='task') nodeIcoClass['el-icon-user'] = true
                if(type=='chat') nodeIcoClass['el-icon-chat-line-round'] = true
                if(type=='end') nodeIcoClass['el-icon-switch-button'] = true
                nodeIcoClass[this.node.ico] = true
                return nodeIcoClass
            },
            nodeNameClass() {
                var nodeNameClass = {
                  'ef-node-text': true
                }
                // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
                nodeNameClass['flow-node-drag'] = this.node.viewOnly || this.node.type=='end' ? false : true
                nodeNameClass['is-empty'] = !this.node.name
                return nodeNameClass
            }
        },
        methods: {
            // 点击节点
            clickNode() {
                this.$emit('clickNode', this.node.id)
            },
            // 鼠标移动后抬起
            changeNodeSite() {
                // 避免抖动
                if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
                    return;
                }
                this.$emit('changeNodeSite', {
                    nodeId: this.node.id,
                    left: this.$refs.node.style.left,
                    top: this.$refs.node.style.top,
                })
            }
        }
    }
</script>
