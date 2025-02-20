<template>
  <div>
<!--    visible表示弹出 ，footer="false"不展示底部-->
    <a-modal v-model:visible="visible" :title="title" :footer="false" @cancel="closeModal">
      <h4>复制分享链接</h4>
<!--      copyable支持复制-->
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
<!--      手机扫码组件-->
      <div style="margin-bottom: 16px" />
      <h4>手机扫码查看</h4>
      <a-qrcode  error-level="H"
                 :value=url
                 icon="http://localhost:5173/src/assets/logo.png"  :color="token.colorInfoText"
                 :bg-color="token.colorBgLayout"/>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { theme } from 'ant-design-vue';

const { useToken } = theme;
const { token } = useToken();

// 接收传入的参数
interface Props {
  title: string;
  link: string;
}


// 默认值
const props = withDefaults(defineProps<Props>(), {
  title: "分享图片",
  link: 'https://mail.qq.com/'
})

// 定义响应式的 URL
const qrCodeUrl = ref(props.link);

// 监听 props.link 的变化，并更新 qrCodeUrl
watch(() => props.link, (newLink) => {
  qrCodeUrl.value = newLink;
});
console.log(qrCodeUrl.value)
const url=qrCodeUrl.value


// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>
