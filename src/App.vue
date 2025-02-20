<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
// import { healthUsingGet } from '@/api/mainController.ts'
// import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
//  已修改为在权限校验文件中获取，见access.ts文件
// const loginUserStore =useLoginUserStore()
// loginUserStore.fetchLoginUser()//获取登录用户信息
//
// healthUsingGet().then((res) => {
//   console.log(res)
// })
</script>

<style scoped></style>
