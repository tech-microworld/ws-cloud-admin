import request from '@/utils/request'

export function getList() {
  return request({
    url: '/admin/plugins/list',
    method: 'get'
  })
}
