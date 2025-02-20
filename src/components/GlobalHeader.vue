<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">lz云画布</div>
          </div>
        </router-link>
      </a-col>
      <!--      菜单-->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <!--      用户信息展示部分  -->
      <a-col flex="120px">
        <div class="user-login-status">
          <!-- 已经登录了展示昵称，没登录展示 登录-->
          <div v-if="loginUserStore.loginUser.id">
            <!--如果名字为空，默认是无名            -->
            <a-dropdown>
              <a-space>
                <a-avatar :size="24" :src="loginUserStore.loginUser.userAvatar" />
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </a-space>

              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="/my_space">
                      <UserOutlined />
                      个人空间
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/user/change/password">
                      <UserOutlined />
                      修改密码
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/user/change/userInfo">
                      <UserOutlined />
                      修改个人信息
                    </router-link>
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <!--没有登录的情况            -->
            <a-button type="primary" href="/user/login"> 登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import AddPicturePage from '@/pages/AddPicturePage.vue'

const loginUserStore = useLoginUserStore()

//未经过滤的原始菜单项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: 'add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/ai3',
    label: 'AI 问答',
    title: 'AI 问答',
  },
  {
    key: 'othersTwo',
    label: h('a', { href: 'https://mail.qq.com', target: '_blank' }, '邮箱'),
    title: '其它',
  },
]

//根据权限过滤菜单选项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    //管理员才能访问/admin开头的菜单
    if (menu?.key?.startsWith('/admin')) {
      //如果menu，key都存在，并且以admin开头
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false //返回false表示这条数据被丢掉了
      }
    }
    return true //返回true表示这条数据保留下来
  })
}

//展示在菜单的路由数组
const items = computed(() => filterMenus(originItems))

const router = useRouter() //拿到跳转对象

const current = ref<string[]>([])
router.afterEach((to, from, next) => {
  //每次进入新页面会把当前页面路径设置为current变量，current决定了高亮哪些菜单
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}

//用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    //重置用户登录态
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败' + res.data.message)
  }
}
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

#globalHeader .logo {
  height: 48px;
}
</style>
