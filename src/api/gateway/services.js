import request from '@/utils/request'

// 查询节点列表
export function getList(params) {
  return request({
    url: '/admin/services/list',
    method: 'get',
    params
  })
}

// 删除节点
export function remove(data) {
  return request({
    url: '/admin/services/remove',
    method: 'post',
    data
  })
}

// 更新节点状态（上下线）
export function save(data) {
  return request({
    url: '/admin/services/save',
    method: 'post',
    data
  })
}
