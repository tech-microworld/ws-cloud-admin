<template>
  <div class="dashboard-container">
    <div class="dashboard-text">My Cloud Admin</div>
    <div class="dashboard-text">hello: {{ name }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
    text-align: center;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
