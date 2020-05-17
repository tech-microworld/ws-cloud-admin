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
      :span-method="objectSpanMethod"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="服务名" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.service_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="upstream" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.upstream }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权重" width="50" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.weight }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status | statusFilter"
          >{{ scope.row.status | dict('serviceStatus') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button
            v-if="row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
        <el-form-item label="服务名" prop="service_name">
          <el-input v-model="dataFormModel.service_name" placeholder="" />
        </el-form-item>
        <el-form-item label="upstream" prop="upstream">
          <el-input v-model="dataFormModel.upstream" placeholder="" />
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input-number v-model="dataFormModel.weight" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="是否上线" prop="enable">
          <el-switch v-model="dataFormModel.status" :active-value="1" :inactive-value="0" />
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
import { isJsonObj } from '@/utils/validate'
import * as serviceApi from '@/api/gateway/services'

const defaultFormData = {
  service_name: '',
  upstrean: [],
  weight: 1,
  status: 1
}

export default {
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
    return {
      spanCol: [],
      pos: 0,
      list: null,
      listLoading: true,
      dataFormModel: Object.assign({}, defaultFormData),
      enable: true,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改服务节点',
        create: '添加服务节点'
      },
      dialogPvVisible: false,
      plugins: [],
      dataFormRules: {
        upstream: [
          { required: true, message: '请输入upstrean', trigger: 'blur' }
        ],
        service_name: [
          { required: true, message: '请输入服务名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getSpanCol(list) {
      for (var i = 0; i < list.length; i++) {
        if (i === 0) {
          this.spanCol.push(1)
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (list[i].service_name === list[i - 1].service_name) {
            this.spanCol[this.pos] += 1
            this.spanCol.push(0)
          } else {
            this.spanCol.push(1)
            this.pos = i
          }
        }
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanCol[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    getList() {
      this.listLoading = true
      serviceApi.getList().then(response => {
        this.list = response.data
        this.listLoading = false
        this.getSpanCol(this.list)
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
      this.dataFormModel.old_prefix = row.prefix
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    submitDataForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          serviceApi.updateStatus(this.dataFormModel).then(() => {
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
      const html = `<span>确定删除服务节点?</span>
                    <p>
                    <span>如确删除请输入<strong>[${row.upstream}]</strong></span>`
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
          if (row.upstream === instance.inputValue) {
            done()
          } else {
            this.$message.error('输入内容不匹配')
          }
        }
      }).then(() => {
        serviceApi.remove({
          service_name: row.service_name,
          upstream: row.upstream
        }).then(() => {
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
