<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="success"
        icon="el-icon-plus"
        size="small"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="协议" width="110" align="center">
        <template slot-scope="scope">{{ scope.row.protocol }}</template>
      </el-table-column>
      <el-table-column label="路由前缀">
        <template slot-scope="scope">{{ scope.row.prefix }}</template>
      </el-table-column>
      <el-table-column label="服务名" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.service_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="是否启用" width="110" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status | statusFilter"
          >{{ scope.row.status | dict('routeStatus') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add dialog -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="dataFormRules"
        :model="dataFormModel"
        label-position="right"
        label-width="85px"
        size="mini"
        style="width: 400px margin-left:50px"
      >
        <el-form-item label="协议" prop="protocol">
          <el-select v-model="dataFormModel.protocol" placeholder="选择协议">
            <el-option
              v-for="item in protocolOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="路由前缀" prop="prefix">
          <el-input v-model="dataFormModel.prefix" placeholder="eg: /openapi/user" />
        </el-form-item>
        <el-form-item label="服务名" prop="service_name">
          <el-input v-model="dataFormModel.service_name" placeholder="eg: user" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enable">
          <el-switch v-model="dataFormModel.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="plugins" prop="plugins">
          <el-select v-model="dataFormModel.plugins" multiple placeholder="请选择">
            <el-option
              v-for="item in plugins"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="参数" prop="propsData">
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="dataFormModel.propsData" />
          </div>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input
            v-model="dataFormModel.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="备注、说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDataForm()">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { isJsonObj } from '@/utils/validate'
import * as routeApi from '@/api/gateway/routes'
import * as pluginApi from '@/api/gateway/plugins'

const defaultFormData = {
  key: '',
  protocol: 'http',
  remark: '',
  prefix: '',
  service_name: '',
  status: 1,
  plugins: [],
  props: {},
  propsData: '{}'
}

export default {
  components: { JsonEditor },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const validatePropsData = (rule, value, callback) => {
      const propsData = this.dataFormModel.propsData
      if (propsData) {
        if (isJsonObj(propsData)) {
          callback()
        } else {
          console.log('not json string: ', propsData)
          callback(new Error('请检查参数格式，必须是 json object'))
        }
      } else {
        callback()
      }
    }

    return {
      list: null,
      listLoading: true,
      dataFormModel: Object.assign({}, defaultFormData),
      enable: true,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改路由',
        create: '添加路由'
      },
      dialogPvVisible: false,
      plugins: [],
      dataFormRules: {
        prefix: [
          { required: true, message: '请输入路由前缀', trigger: 'blur' }
        ],
        protocol: [
          { required: true, message: '请输入路由前缀', trigger: 'blur' }
        ],
        service_name: [
          { required: true, message: '请输入服务名', trigger: 'blur' }
        ],
        propsData: [{ validator: validatePropsData, trigger: 'blur' }]
      },
      protocolOptions: [
        {
          value: 'http',
          label: 'http'
        },
        {
          value: 'grpc',
          label: 'grpc'
        }
      ]
    }
  },
  created() {
    this.getList()
    this.getPlugins()
  },
  methods: {
    getPlugins() {
      pluginApi.getList().then(response => {
        var plugins = []
        if (response.data && response.data.length > 0) {
          response.data.forEach(data => {
            plugins.push({
              value: data.name,
              label: data.desc
            })
          })
        }
        this.plugins = plugins
      })
    },
    getList() {
      this.listLoading = true
      routeApi.getList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    resetFormModel() {
      this.dataFormModel = Object.assign({}, defaultFormData)
    },
    handleCreate() {
      this.resetFormModel()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    handleUpdate(row) {
      this.dataFormModel = Object.assign({}, row)
      this.dataFormModel.propsData = JSON.stringify(row.props, null, 2)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    submitDataForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const data = {
            key: this.dataFormModel.key,
            protocol: this.dataFormModel.protocol,
            remark: this.dataFormModel.remark,
            prefix: this.dataFormModel.prefix,
            service_name: this.dataFormModel.service_name,
            status: this.dataFormModel.status,
            plugins: this.dataFormModel.plugins,
            props: JSON.parse(this.dataFormModel.propsData)
          }
          routeApi.save(data).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '完成',
              message: '提交成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      const html = `<span>确定删除路由配置?</span>
                    <p>
                    <span>如确删除请输入<strong>[${row.prefix}]</strong></span>`
      this.$prompt(html, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action !== 'confirm') {
            done()
            return
          }
          if (row.prefix === instance.inputValue) {
            done()
          } else {
            this.$message.error('输入内容不匹配')
          }
        }
      }).then(() => {
        routeApi.remove({ key: row.key }).then(() => {
          this.getList()
          this.$notify({
            title: '完成',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}

.editor-container {
  position: relative;
  height: 50%;
}
</style>
