<template>
  <div class="picture-list">
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a-card
            hoverable
            @click="doClickPicture(picture)"
            class="image-card"
          >
            <template #cover>
              <!-- 渐进式加载组件 -->
              <div class="image-container">
                <!-- 主图 -->
                <a-image
                  :src="picture.url"
                  :preview="false"
                  style="height: 180px; width: 100%"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <!-- 模糊缩略图 -->
                      <img
                        :src="picture.thumbnailUrl ?? picture.url"
                        style="
                        height: 180px;
                        width: 100%;
                        object-fit: cover;
                        filter: blur(20px);
                      "
                      />
                      <!-- 加载指示器 -->
                      <a-spin class="loader" />
                    </div>
                  </template>
                </a-image>

                <!-- 信息覆盖层 -->
                <div class="image-overlay" @mouseenter="showInfo = true" @mouseleave="showInfo = false">
                  <transition name="fade">
                    <div v-show="showInfo" class="info-content">
                      <!-- 标题和分类 -->
                      <div class="info-header">
                        <h3 class="title">{{ picture.name }}</h3>
                        <a-tag color="green" class="category-tag">
                          {{ picture.category ?? '默认分类' }}
                        </a-tag>
                      </div>

                      <!-- 标签云 -->
                      <div class="tag-cloud">
                        <a-tag
                          v-for="tag in picture.tags"
                          :key="tag"
                          color="blue"
                          class="tag-item"
                        >
                          {{ tag }}
                        </a-tag>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </template>

            <!-- 操作栏保持可见 -->
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
        </a-list-item>
      </template>
    </a-list>

    <ShareModal ref="shareModalRef" :link="shareLink" />
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

const showInfo = ref(false);

// 其他逻辑保持原有...
</script>

<style scoped>
.image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.7) 100%
  );
  transition: all 0.3s ease;
}

.info-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  color: white;
}

.title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.category-tag {
  margin-left: 8px;
  vertical-align: middle;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 60px;
  overflow-y: auto;
}

.tag-item {
  backdrop-filter: blur(5px);
  background: rgba(255,255,255,0.1);
  border: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

:deep(.ant-image-img) {
  transition: transform 0.3s ease;
}

.image-card:hover :deep(.ant-image-img) {
  transform: scale(1.05);
}
</style>
