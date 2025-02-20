<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <!-- 展示空间id-->
    <a-typography-paragraph v-if="spaceId" type="secondary">
      上传至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
    <!--选择上传方式，选项卡组件    -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <!-- 图片上传组件-->
        <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <!--url图片上传组件    -->
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>
    <!--    图片编辑区域-->
    <div v-if="picture" class="edit-bar">
      <a-space size="middle">
        <!--      引入图片，引入vue的h-->
        <a-button @click="doEditPicture" :icon="h(EditOutlined)"> 编辑图片</a-button>
        <a-button type="primary" :icon="h(FullscreenExitOutlined)" @click="doImagePainting">
          AI 扩图
        </a-button>
      </a-space>

      <!--  图片上传成功之后回显在页面中-->
      <!--  写ref获取打开弹窗的事件-->
      <!--    vue官方的定义事件方法用emit触发，我们通过自己定义属性触发，加上冒号:传递属性-->
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :space="space"
        :@onSuccess="onCropSuccess"
      />
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onImageOutPaintingSuccess"
      />
    </div>
    <!--图片表单    -->
    <!--    当图片存在时，才展示表单-->
    <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :autoSize="{ minRows: 2, maxRows: 6 }"
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureuUpload.vue'
import { computed, h, onMounted, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'

const uploadType = ref<'file' | 'url'>('file')

const picture = ref<API.PictureVO>()
//空间id
const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 接收前端输入的值
 */
const pictureForm = reactive<API.PictureEditRequest>({})
//上传后，图片名称回填
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  //获取图片id
  const pictureId = picture.value.id
  if (!pictureId) {
    return
  }
  //调用编辑图片接口
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value, //空间id
    ...values,
  })
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    //引用路由进行跳转
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}
//获取后端写好的标签分类，进入页面只加载一次
onMounted(() => {
  getTagCategoryOptions()
})

//通过route获取id
const route = useRoute()

// 获取老数据
const getOldPicture = async () => {
  // 获取数据，从查询参数中获取id
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}
//获取老的图片信息
onMounted(() => {
  getOldPicture()
})
// --------------图片编辑器引用-------------
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = async () => {
  // 打开弹窗
  imageCropperRef.value?.openModal()
}

// 编辑成功的事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  //   把当前图片的值新的图片
  picture.value = newPicture
}
// ---------AI 扩图引用-------------
const imageOutPaintingRef = ref()

// AI扩图
const doImagePainting = async () => {
  // 打开弹窗
  imageOutPaintingRef.value?.openModal()
}

// AI扩图保存事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  //   把当前图片的值新的图片
  picture.value = newPicture
}

// 获取空间信息
const space = ref<API.SpaceVO>()

const fetchSpace = async () => {
  //   获取数据，从查询参数中获取id
  if (spaceId.value) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})
</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>
