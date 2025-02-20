import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'

//判断是不是首次获取登录用户信息
let firstFetchLoginUser = true
/**
 * 全局权限校验，每次切换时都会执行
 * */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  //确保用户刷新时，首次加载时，能等待后端返回用户信息后再校验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser() //获取当前登录用户信息
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }
  const toUrl = to.fullPath //先拿到当前要访问哪个页面
  //可以自定义权限校验规则，比如管理员才能访问 /admin开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      //如果当前用户不存在 或当前登录用户他的权限不是管理员
      message.error('没有权限')
      next(`/user/login?redirect=${to.fullPath}`) //跳转到登录页面，并带上当前要访问的页面，进行重定向
      return
    }
  }
  next() //放行
})
