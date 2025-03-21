import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'

// import { getCurrentUser } from '/@/api/user'

/**
 * 1、定义存储登录用户信息的状态
 * */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录', //定义变量初始值
  })
  const loginUser1 = ref<String>("1")
  /**
   * 2、获取登录用户信息
   * */
  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
    //   测试用户登录
    // setTimeout(() => {
    //   loginUser.value = { userName: '测试用户', id: 1 }
    // }, 3000)
  }

  /**
   * 3、设置登录用户
   * */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  // 将定义的函数返回出去，这样才能在其他页面使用
  return { loginUser, setLoginUser, fetchLoginUser }
})
