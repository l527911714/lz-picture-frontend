<template>
  <a-watermark :content="['3310179917@qq.com', 'Happy Working']"
               :height="30"
               :width="130"
               >
  <div id="homePage">
    <!-- 搜索框  外面的div调节样式search-bar搜索框与下方有边距-->
    <div class="search-bar">
      <!--      searchParams.searchText搜索条件-->
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签筛选 平铺开 改变时触发搜索事件 -->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <!-- 遍历分类列表-->
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
    </a-tabs>
    <!--    标签-->
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 ，传入我们抽象出的列表-->
    <PictureList :dataList="dataList" :loading="loading" />
<!--    <PictureList :dataList="dataList" :loading="loading" ></PictureList>-->
<!--      <template #placeholder>-->
<!--        <a-image-->
<!--          :width="200"-->
<!--          :preview="false"-->
<!--        />-->
<!--      </template>-->
<!--    </PictureList>-->
    <!-- 图片列表 -->
<!--    <a-space :size="12" wrap>-->
<!--      <template v-for="item in dataList" :key="item.id">-->
<!--        <a-image-->
<!--          :width="200"-->
<!--          :src="item.url"-->
<!--        >-->
<!--          <template #placeholder>-->
<!--            <a-image-->
<!--              :width="200"-->
<!--              :preview="false"-->
<!--              :src="`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200`"-->
<!--            />-->
<!--          </template>-->
<!--        </a-image>-->
<!--      </template>-->
<!--    </a-space>-->
    <!-- 分页组件 -->
<!--接收分页的值  -->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
    <div style="height: 500px" />
  </a-watermark>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue' // 定义数据

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  //转圈
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // [true, false, false] => ['java']
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  // 调用接口查询图片分页
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  //转圈
  loading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 分页参数，根据接收的参数改变大小和页号
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 搜索事件
const doSearch = () => {
  // 重置搜索条件，每次都从第一页开始搜
  searchParams.current = 1
  //获取数据
  fetchData()
}

// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all') //分类默认就是全部
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([]) //标签可以选择多个，默认空数组

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar {
  margin-bottom: 20px;
}
</style>
