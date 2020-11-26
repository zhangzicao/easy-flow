<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">
                编辑
            </div>
            <div class="ef-node-form-body">
                <div class="tip" v-show="type==''">点击节点或线段可以进行编辑</div>
                <el-form :model="node" :rules="nodeFormRules" ref="dataForm" label-width="80px" v-show="type === 'node'" @submit.native.prevent="save">
                   <!-- <el-form-item label="类型">
                        <el-input v-model="node.type" :disabled="true"></el-input>
                    </el-form-item>-->
                    <el-form-item label="名称" prop="name">
                        <el-input v-model="node.name"></el-input>
                    </el-form-item>
                    <el-form-item label="状态" prop="state" v-if="stateList && stateList.length>0">
                      <el-select v-model="node.state" placeholder="请选择">
                        <el-option
                          v-for="item in stateList"
                          :key="item.state"
                          :label="item.label"
                          :value="item.state">
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <slot></slot>
                    <!--<el-form-item label="left坐标">
                        <el-input v-model="node.left" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="top坐标">
                        <el-input v-model="node.top" :disabled="true"></el-input>
                    </el-form-item>-->
                    <!--<el-form-item label="ico图标">
                        <el-input v-model="node.ico"></el-input>
                    </el-form-item>-->
                    <el-form-item v-if="!viewMode">
                        <el-button type="primary" icon="el-icon-check" @click="save">确认</el-button>
                    </el-form-item>

                </el-form>

                <el-form :model="line" ref="dataForm" label-width="80px" v-show="type === 'line'" @submit.native.prevent="saveLine">
                    <el-form-item label="条件">
                        <el-input v-model="line.label"></el-input>
                    </el-form-item>
                    <el-form-item v-if="!viewMode">
                        <el-button type="primary" icon="el-icon-check" @click="saveLine">确认</el-button>
                    </el-form-item>
                </el-form>

              <div style="margin: 10px;">
                <el-alert
                  title="修改成功！"
                  type="success"
                  v-if="showSuccess"
                >
                </el-alert>
              </div>
            </div>
            <!--            <div class="el-node-form-tag"></div>-->
        </div>
    </div>

</template>

<script>

    export default {
      props: {
        viewMode: {
          type: Boolean
        },
        stateList: {
          type: Array
        },
        node: {},
        nodeFormRules:{
          type: Object,
          default: function () {
            return {}
          }
        }
      },
        data() {
            return {
                visible: true,
                // node 或 line
                type: '',
                line: {},
                data: {},
              showSuccess: false
            }
        },
        methods: {
            /**
             * 表单修改，这里可以根据传入的ID进行业务信息获取
             * @param data
             * @param id
             */
            nodeInit(data, id) {
                this.type = 'node'
                this.data = data
                data.nodeList.filter((node) => {
                    if (node.id === id) {
                        this.$emit('update:node',this.$deepClone(node))
                    }
                })
            },
            lineInit(data, {from, to}) {
                this.type = 'line'
                this.data = data
                data.lineList.filter((line) => {
                  if (line.from === from && line.to === to) {
                    this.line = this.$deepClone(line)
                  }
                })
            },
            // 修改连线
            saveLine() {
              if(this.viewMode) return
              this.showSuccess = true
              this.timer = setTimeout(()=>{
                this.showSuccess = false
              },1000)
              this.data.lineList.forEach((line)=>{
                if (line.from == this.line.from && line.to == this.line.to) {
                  this.$set(line, 'label', this.line.label)
                  // this.$set(line, 'connector', this.line.connector)
                  this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
                }
              })
            },
            save() {
                if(this.viewMode) return
                this.$refs.dataForm.validate((valid,fields) => {
                    if(valid){
                      this.showSuccess = true
                      this.timer = setTimeout(()=>{
                        this.showSuccess = false
                      },1000)
                      this.data.nodeList.filter((node) => {
                        if (node.id === this.node.id) {
                          for (var $key in this.node) {
                            this.$set(node, $key, this.node[$key])
                          }
                          this.$emit('repaintEverything')
                        }
                      })
                    }
                })

            }
        },
      beforeDestroy() {
        if(this.timer)
          clearTimeout(this.timer)
      }
    }
</script>

<style>
    .el-node-form-tag {
        position: absolute;
        top: 50%;
        margin-left: -15px;
        height: 40px;
        width: 15px;
        background-color: #fbfbfb;
        border: 1px solid rgb(220, 227, 232);
        border-right: none;
        z-index: 0;
    }
  .tip{
    color: #999;
    text-align: center;
    margin-top: 30px;
  }
</style>
