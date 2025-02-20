<template>
  <div id="userUpdatePage" class="user-settings-container">
    <h2 class="title">Lz云画布 · 用户设置</h2>
    <div class="desc">个性化配置您的账户信息</div>

    <a-form :model="formState" name="settings" @finish="handleSubmit" class="custom-form">
      <!-- 用户头像 -->
      <a-form-item label="头像" class="form-item avatar-form-item">
      <a-upload
        class="avatar-upload"
        name="avatar"
        list-type="picture-card"
        :custom-request="handleCustomUpload"
        :show-upload-list="false"
        :before-upload="beforeAvatarUpload"
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
      <!--展示当前登录用户的id-->
<!--      <a-form-item label="用户ID" class="form-item">-->
<!--        <a-input-->
<!--          v-model:value="loginUserStore.loginUser.Id"-->
<!--          placeholder="userId"-->
<!--          class="custom-input"-->
<!--          disabled-->
<!--        />-->
<!--      </a-form-item>-->

    </a-form>
    用户id：{{userId}}

  </div>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { Upload, type UploadChangeParam, type UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import { updateUserUsingPost } from '@/api/userController';
import axios from 'axios'
const handleClick = () => console.log('click');
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

// 文件校验（与后端保持一致）
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  const isValidSize = file.size / 1024 / 1024 < 1; // 1MB

  if (!isValidType) {
    message.error('仅支持 JPG/PNG/WEBP 格式!');
    return Upload.LIST_IGNORE;
  }
  if (!isValidSize) {
    message.error('图片大小不能超过 1MB!');
    return Upload.LIST_IGNORE;
  }
  return true;
};

//查询用户Id
const userId = loginUserStore.loginUser.id;
//展示当前登录的用户id
console.log(userId);


const handleCustomUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options;

  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    formData.append('biz', 'user_avatar');  // 添加业务参数

    // 显示上传进度
    // const config = {
    //   onUploadProgress: (progressEvent: ProgressEvent) => {
    //     const percent = Math.round(
    //       (progressEvent.loaded * 100) / progressEvent.total
    //     );
    //     onProgress({ percent });
    //   },
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // };

    // 发送请求（注意URL不要带参数）
    const response = await axios.post(
      `http://localhost:8666/api/file/upload`,
      formData,
      // config
    {  headers:
        {
           'Content-Type': 'multipart/form-data'
         },
        withCredentials: true // 启用Cookie传输
    }
  )

    // 处理响应
    if (response.data.code === 0) {
      onSuccess(response.data.data);
      // formState.userAvatar = "https://lzlz1-1333595079.cos.ap-shanghai.myqcloud.com" + response.data.data.url;
      formState.userAvatar =  response.data.data;
      message.success('上传成功');
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    onError(error);
    message.error('上传失败');
  }
};

// 添加真实上传逻辑
// const handleAvatarChange = async (info: UploadChangeParam) => {
//   console.log(11)
//   if (info.file.status === 'uploading') {
//     return;
//   }
//   console.log(222)
//
//   if (info.file.status === 'done') {
//     const result = await uploadFile(info.file);
//     if (result.code === 0) {
//       formState.userAvatar = result.data.url;
//     }
//   }
// };



// // 提交表单
// const handleSubmit = async () => {
//   submitting.value = true;
//   try {
//     const params = {
//       id: loginUserStore.loginUser.id,
//       userName: formState.userName,
//       userAvatar: formState.userAvatar,
//       userProfile: formState.userProfile
//     };
//
//     const res = await updateUserUsingPost(params);
//     if (res.data.code === 0) {
//       message.success('更新成功');
//       // 更新全局状态
//       loginUserStore.setLoginUser({
//         ...loginUserStore.loginUser,
//         ...params
//       });
//     }
//   } catch (error) {
//     message.error('更新失败，请重试');
//   } finally {
//     submitting.value = false;
//   }
// };
const handleChange=async ()=>{
  const params = {

  }
}
// 提交表单时不再处理头像更新
const handleSubmit = async () => {
  submitting.value = true;
  try {
    const params = {
      id: loginUserStore.loginUser.id,
      userName: formState.userName,
      userProfile: formState.userProfile,
      // 头像路径已在前端自动更新
      userAvatar: formState.userAvatar
    };

    const res = await updateUserUsingPost(params);
    if (res.data.code === 0) {
      message.success('用户信息更新成功');
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
  padding: 48px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-settings-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desc {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 15px;
  letter-spacing: 0.3px;
}

/* 新增头像容器样式 */
.avatar-form-item {
  :deep(.ant-form-item-control-input-content) {
    display: flex;
    justify-content: center;
  }
}

/* 修改原有头像上传样式 */
.avatar-upload {
  display: inline-flex; /* 改为行内弹性布局 */
  margin: 0 auto; /* 水平居中 */

  :deep(.ant-upload) {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* 添加发光效果 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 6px 16px rgba(22, 119, 255, 0.2);
    }
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.1);
}

/* 表单元素样式 */
.custom-form {
  :deep(.ant-form-item-label) {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    padding-bottom: 8px;
  }

  .custom-input {
    height: 48px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    padding: 12px 16px;
    font-size: 15px;
    transition: all 0.3s ease;

    &:focus {
      border-color: #1677ff;
      box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
    }
  }

  .custom-textarea {
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    padding: 12px 16px;
    font-size: 15px;
    line-height: 1.6;
    transition: all 0.3s ease;

    &:focus {
      border-color: #1677ff;
      box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
  }
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  border: none;

  &:not([disabled]):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(22, 119, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &[disabled] {
    opacity: 0.7;
    cursor: not-allowed;
    background: #f0f0f0;
    color: #999;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-settings-container {
    margin: 20px;
    padding: 32px;
    border-radius: 12px;
  }

  .title {
    font-size: 24px;
  }

  .desc {
    font-size: 14px;
  }

  .avatar-upload :deep(.ant-upload) {
    width: 96px;
    height: 96px;
  }

  .custom-input {
    height: 44px !important;
    font-size: 14px !important;
  }

  .submit-btn {
    height: 44px;
    font-size: 15px;
  }
}

/* 加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.uploading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
/* 移动端适配调整 */
@media (max-width: 768px) {
  .avatar-upload {
    :deep(.ant-upload) {
      width: 96px;
      height: 96px;
    }
  }
}
.avatar-upload-loading {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #1677ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}
.avatar-upload :deep(.ant-upload) {
  border: 2px solid transparent;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #1677ff;
  }
}
/* 成功状态 */
.avatar-upload-success {
  :deep(.ant-upload) {
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  }
}

/* 错误状态 */
.avatar-upload-error {
  :deep(.ant-upload) {
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
    animation: shake 0.5s ease;
  }
}
</style>
