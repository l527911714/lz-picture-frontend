<template>
  <div class="picture-list">
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <div
            class="image-container"
            @mouseenter="activeId = picture.id"
            @mouseleave="activeId = null"
          >
            <!-- 图片主体 -->
            <a-card hoverable class="image-card">
              <template #cover>
                <a-image
                  :src="picture.url"
                  :preview="false"
                  style="height: 180px; width: 100%"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <img
                        :src="picture.thumbnailUrl || getBlurUrl(picture.url)"
                        style="
                          height: 180px;
                          width: 100%;
                          object-fit: cover;
                          filter: blur(20px);
                        "
                      />
                      <a-spin class="loader" />
                    </div>
                  </template>
                </a-image>
              </template>

              <!-- 悬浮信息层 -->
              <transition name="fade">
                <div
                  v-show="activeId === picture.id"
                  class="hover-info"
                >
                  <div class="info-content">
                    <h3 class="title">{{ picture.name }}</h3>
                    <div class="meta">
                      <a-tag color="green">{{ picture.category || '未分类' }}</a-tag>
                      <span class="timestamp">{{ formatDate(picture.createTime) }}</span>
                    </div>
                    <div class="tag-list">
                      <a-tag
                        v-for="tag in picture.tags"
                        :key="tag"
                        color="blue"
                      >
                        {{ tag }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- 操作按钮 -->
              <template v-if="showOp" #actions>
                <ShareAltOutlined @click.stop="doShare(picture, $event)" />
                <SearchOutlined @click.stop="doSearch(picture, $event)" />
                <EditOutlined
                  v-if="canEdit"
                  @click.stop="doEdit(picture, $event)"
                />
                <DeleteOutlined
                  v-if="canDelete"
                  @click.stop="doDelete(picture, $event)"
                />
              </template>
            </a-card>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  ShareAltOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import type { PictureVO } from '@/api/types';

const activeId = ref<number | null>(null);

// 生成模糊缩略图URL
const getBlurUrl = (url: string) => {
  return `${url}?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200`;
};

// 时间格式化
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
};

// 其他业务逻辑...
</script>

<style scoped>
.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.image-card {
  transition: transform 0.3s ease;
}

.image-card:hover {
  transform: translateY(-3px);
}

.hover-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.info-content {
  padding: 16px;
  color: white;
  width: 100%;
}

.title {
  margin: 0 0 12px 0;
  font-size: 16px;
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.timestamp {
  color: #ddd;
  font-size: 12px;
  align-self: center;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-height: 72px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.ant-image) {
  display: block;
  height: 180px;
}

:deep(.ant-image-img) {
  transition: transform 0.3s ease;
}

.image-container:hover :deep(.ant-image-img) {
  transform: scale(1.05);
}
</style>
