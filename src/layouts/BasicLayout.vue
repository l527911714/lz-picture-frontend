<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <global-header />
      </a-layout-header>
      <!--侧边栏与内容同级别-->
      <a-layout>
        <GlobalSider  class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <a
          href="https://mail.qq.com/cgi-bin/frame_html?sid=sv-CUgTO0p-jsXQT&r=9c107b08bbcb3af80d03ba1fbcbc0f00&lang=zh"
          target="_parent"
          >by lz 3310179917@qq.com
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>

#basicLayout .header {
  background: white;
  color: unset;
  padding-inline: 20px;
  margin-bottom: 1px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basicLayout .content {
  padding: 28px;
  margin-bottom: 28px;
}
#basicLayout .sider{
  background: #fff;
  margin-right: 1px;
}
#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
