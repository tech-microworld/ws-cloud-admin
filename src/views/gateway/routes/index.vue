<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="URI"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.service_name"
        placeholder="服务名"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
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
      <el-table-column label="插件" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.service_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参数" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.service_name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | statusLabelFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button
            v-if="row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row,$index)"
          >禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add dialog -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="70px"
        size="mini"
        style="width: 400px margin-left:50px"
      >
        <el-form-item label="路由前缀" prop="title">
          <el-input v-model="temp.prefix" />
        </el-form-item>
        <el-form-item label="服务名" prop="title">
          <el-input v-model="temp.service_name" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="temp.status" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </el-form-item>
        <el-form-item label="plugins">
          <el-select v-model="temp.plugins" multiple placeholder="请选择">
            <el-option
              v-for="item in opt.plugins"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="temp.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="参数">
          <el-col :span="10">
            <el-input v-model="temp.prefix" />
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="10">
            <el-input v-model="temp.prefix" />
          </el-col>
          <el-col class="line" :span="2">
            <el-button icon="el-icon-plus" circle></el-button>
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dict from "@/utils/dict"
import { getList } from "@/api/gateway/routes"

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "danger"
      }
      return statusMap[status]
    },
    statusLabelFilter(status) {
      return dict.getLabel("status", status)
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        uri: undefined,
        service: undefined
      },
      temp: {
        id: undefined,
        remark: "",
        prefix: "",
        service_name: "",
        status: 1,
        plugins: [],
        propsData: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: '修改路由',
        create: '添加路由'
      },
      dialogPvVisible: false,
      opt: {
        plugins: [
          {
            value: "discovery",
            label: "服务发现"
          },
          {
            value: "rewwrite",
            label: "url重写插件"
          },
          {
            value: "tracing",
            label: "链路跟踪插件"
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery = {}
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: ""
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = "create"
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>