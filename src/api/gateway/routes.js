

import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/admin/routes/list',
    method: 'get',
    params
  })
}
