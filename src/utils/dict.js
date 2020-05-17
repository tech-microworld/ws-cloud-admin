const dict = {
  routeStatus: {
    1: '启用',
    0: '禁用'
  },
  serviceStatus: {
    1: '上线',
    0: '下线'
  }
}

export default function(value, group) {
  return dict[group][value]
}
