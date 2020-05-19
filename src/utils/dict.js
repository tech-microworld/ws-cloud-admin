const dict = {
  routeStatus: {
    1: '启用',
    0: '禁用'
  },
  serviceStatus: {
    1: 'up',
    0: 'down'
  }
}

export default function(value, group) {
  return dict[group][value]
}
