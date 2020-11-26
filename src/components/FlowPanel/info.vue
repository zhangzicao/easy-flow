<template>
    <el-dialog
        title="流程数据信息"
        :visible.sync="dialogVisible"
        width="70%"
        append-to-body
    >
        <el-alert
            title="使用说明"
            type="warning"
            description="以下流程信息可以被存储起来，方便下一次流程加载"
            show-icon
            close-text="知道了"
        >
        </el-alert>
        <el-input type="textarea"
                  :value="flowJsonData"
                  class="code"
                  rows="20"
                  size="small"
        ></el-input>
    </el-dialog>
</template>

<script>

    export default {
        props: {
            data: Object,
        },
        data() {
            return {
                dialogVisible: false,
                flowJsonData: {}
            }
        },
        methods: {
            init() {
                this.dialogVisible = true
                this.flowJsonData = JSON.stringify(this.data, null, 4).toString()
            }
        }
    }
</script>
