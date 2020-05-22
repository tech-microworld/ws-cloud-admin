import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/admin/routes/list',
    method: 'get',
    params
  })
}

export function save(data) {
  return request({
    url: '/admin/routes/save',
    method: 'post',
    data
  })
}

export function remove(data) {
  return request({
    url: '/admin/routes/remove',
    method: 'post',
    data
  })
}
