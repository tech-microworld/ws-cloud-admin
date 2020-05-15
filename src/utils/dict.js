const dict = {
  status: {
    1: "启用",
    0: "禁用"
  }
};

export default {
  getLabel: function(group, value) {
    return dict[group][value];
  }
};
