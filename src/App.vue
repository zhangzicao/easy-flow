<template>
    <div id="app" style="position:absolute;top: 0;left: 0;bottom: 0;right: 0;">
        <flow-panel :data.sync="data" :stateList="stateList" :formRules="formRules" @save="onSave">
          <!--自定义节点内容-->
          <!--<template v-slot:node="{node}">
            <div>
              <div class="">{{node.name}}</div>
              <div class="">{{node.dutyMan}}</div>
            </div>
          </template>-->

          <!--自定义表单内容-->
          <template v-slot:form="{form}">
            <el-form-item label="负责人">
              <el-input v-model="form.dutyMan" placeholder="请输入负责人"> </el-input>
            </el-form-item>
          </template>
        </flow-panel>
    </div>
</template>

<script>
    import FlowPanel from '@/components/FlowPanel'
    import {getDataB} from "./testData/data_B";

    export default {
        name: 'App',
        components: {
            FlowPanel
        },
        data: function(){
          return {
            data: {
              name: '新文档',
              nodeList: [],
              lineList: [],
            },
            stateList: [{
              state: 0,
              label: '默认',
              color: '#4c9ed9'
            }, {
              state: 1,
              label: '已过期',
              color: '#e82424'
            }, {
              state: 2,
              label: '快过期',
              color: '#f66539'
            }, {
              state: 3,
              label: '已完成',
              color: '#27b14e'
            }, {
              state: 4,
              label: '已完成',
              color: '#673ab7'
            }],
            formRules: {
              name: [{ required: true, message: '必填', trigger: 'blur' }]
            }
          }
        },
        created() {
          setTimeout(()=>{
            this.data = getDataB()
          },100)
        },
        methods: {
          onSave(data){
            console.log(data)
            this.$message.success('保存成功/保存失败')
          }
        }
    }
</script>
