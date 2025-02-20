<template>
  <div id="userUpdatePage" class="user-settings-container">
    <h2 class="title">Lz云画布 · 用户设置</h2>
    <div class="desc">个性化配置您的账户信息</div>

    <a-form :model="formState" name="settings" @finish="handleSubmit" class="custom-form">
      <!-- 用户头像 -->
      <a-form-item label="头像" class="form-item">
        <a-upload
          name="avatar"
          list-type="picture-card"
          class="avatar-upload"
          :show-upload-list="false"
          :before-upload="beforeAvatarUpload"
          @change="handleAvatarChange"
        >
          <img
            v-if="formState.userAvatar"
            :src="formState.userAvatar"
            alt="avatar"
            class="avatar-image"
          />
          <div v-else>
            <plus-outlined />
            <div class="ant-upload-text">上传头像</div>
          </div>
        </a-upload>
      </a-form-item>

      <!-- 用户名 -->
      <a-form-item
        label="用户名"
        name="userName"
        :rules="[{ required: true, message: '请输入用户名' }]"
        class="form-item"
      >
        <a-input
          v-model:value="formState.userName"
          placeholder="请输入新用户名"
          class="custom-input"
        />
      </a-form-item>

      <!-- 用户简介 -->
      <a-form-item label="个人简介" name="userProfile" class="form-item">
        <a-textarea
          v-model:value="formState.userProfile"
          placeholder="介绍一下自己吧..."
          :auto-size="{ minRows: 3, maxRows: 5 }"
          class="custom-textarea"
        />
      </a-form-item>

      <!-- 提交按钮 -->
      <a-form-item class="submit-item">
        <a-button
          type="primary"
          html-type="submit"
          class="submit-btn"
          :loading="submitting"
        >
          保存修改
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import { updateUserUsingPost } from '@/api/userController';
import axios from 'axios'

const loginUserStore = useLoginUserStore();
const submitting = ref(false);

// 表单数据
const formState = reactive({
  userName: '',
  userAvatar: '',
  userProfile: ''
});

// 初始化表单数据
onMounted(() => {
  formState.userName = loginUserStore.loginUser.userName || '';
  formState.userAvatar = loginUserStore.loginUser.userAvatar || '';
  formState.userProfile = loginUserStore.loginUser.userProfile || '';
});

// 头像上传处理
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('头像图片不能超过2MB!');
  }
  return isImage && isLt2M;
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<API.UploadFileVO>(
      `http://localhost:8666/api/file/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || '上传失败');
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}

// 添加真实上传逻辑
const handleAvatarChange = async (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    return;
  }
  if (info.file.status === 'done') {
    const result = await uploadFile(info.file);
    if (result.code === 0) {
      formState.userAvatar = result.data.url;
    }
  }
};



// 提交表单
const handleSubmit = async () => {
  submitting.value = true;
  try {
    const params = {
      id: loginUserStore.loginUser.id,
      userName: formState.userName,
      userAvatar: formState.userAvatar,
      userProfile: formState.userProfile
    };

    const res = await updateUserUsingPost(params);
    if (res.data.code === 0) {
      message.success('更新成功');
      // 更新全局状态
      loginUserStore.setLoginUser({
        ...loginUserStore.loginUser,
        ...params
      });
    }
  } catch (error) {
    message.error('更新失败，请重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.user-settings-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.avatar-upload :deep(.ant-upload) {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-form {
  :deep(.ant-form-item-label) {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  .custom-input {
    height: 40px;
    border-radius: 8px;
  }

  .custom-textarea {
    border-radius: 8px;
    resize: none;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .user-settings-container {
    margin: 20px;
    padding: 24px;
  }

  .avatar-upload :deep(.ant-upload) {
    width: 96px;
    height: 96px;
  }
}
</style>
