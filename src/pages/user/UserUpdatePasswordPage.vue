<template>
  <!-- 修改外层容器ID与新增class -->
  <div id="userUpdatePasswordPage" class="password-container">
    <h2 class="title">Lz云画布 · 密码修改</h2>
    <div class="desc">云画布实时同步与智能处理中心系统</div>

    <a-form
      :model="formState"
      name="basic"
      autocomplete="off"
      @finish="handleSubmit"
      class="custom-form"
    >
      <!-- 表单项目添加自定义class -->
      <a-form-item
        name="newPassword"
        :rules="[{ required: true, message: '请输入新密码' }]"
        class="form-item"
      >
        <a-input
          v-model:value="formState.newPassword"
          placeholder="请输入新密码"
          class="custom-input"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请再次输入新密码' },
          { min: 8, message: '密码长度不能小于8位' },
        ]"
        class="form-item"
      >
        <a-input-password
          v-model:value="formState.checkPassword"
          placeholder="请再次输入新密码"
          class="custom-input"
        >
          <template #prefix>
            <SafetyOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>

      <div class="tips">
        注册新账号？
        <RouterLink to="/user/register" class="register-link">立即注册</RouterLink>
      </div>

      <a-form-item class="submit-item">
        <a-button
          type="primary"
          html-type="submit"
          class="submit-btn"
        >
          确认修改
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { changeUserPasswordUsingPost, updateUserUsingPost, userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

// 用于接收表单输入的值
const formState = reactive<API.UserUpdatePasswordRequest>({
  newPassword: '',
  checkPassword: '',
})
const router = useRouter()

const handleSubmit = async (values: any) => {

  const res = await changeUserPasswordUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    // await loginUserStore.fetchLoginUser()
    message.success('修改成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('修改失败，' + res.data.message)
  }
}
</script>

<style scoped>
/* 新增样式 */
#userUpdatePasswordPage {
  max-width: 420px;
  margin: 40px auto;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.password-container:hover {
  transform: translateY(-2px);
}

.title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1px;
}

.desc {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 14px;
}

.custom-form {
  .form-item {
    margin-bottom: 24px;

    :deep(.ant-form-item-explain) {
      font-size: 12px;
      margin-top: 4px;
    }
  }

  .custom-input {
    height: 44px;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: #4096ff;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}

.tips {
  color: #666;
  text-align: right;
  font-size: 14px;
  margin: -12px 0 24px;

  .register-link {
    color: #1677ff;
    transition: color 0.3s;
    font-weight: 500;

    &:hover {
      color: #0958d9;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;

  &:not([disabled]):hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 576px) {
  #userUpdatePasswordPage {
    margin: 20px;
    padding: 24px;
  }

  .title {
    font-size: 20px;
  }

  .desc {
    font-size: 13px;
  }

  .custom-input {
    height: 40px !important;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style>
