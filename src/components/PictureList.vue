<template>
  <!--  图片列表组件，会被多次复用，单独抽出-->
  <div class="picture-list">
    <!-- 图片列表 xs最小的屏幕下，每行就展示1列。。。gutter指定间距，loading默认没加载好时让它转圈 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <!--        调整图片之间的间距为0-->
        <a-list-item style="padding: 0">
          <!-- 单张图片 ，绑定事件进行跳转-->
          <a-card hoverable @click="doClickPicture(picture)" class="ant-card">
            <!-- 将图片的高度保持一致，避免有长有宽，避免图片被挤扁了用object-fit，让图片适应宽高，取中间区域展示，宽度不指定，与浏览器适应-->
<!--            <template #cover>-->
<!--              &lt;!&ndash;有缩略图展示缩略图，没有展示原图&ndash;&gt;-->
<!--              <a-image-->
<!--                :alt="picture.name"-->
<!--                :src="picture.thumbnailUrl ?? picture.url"-->
<!--                style="height: 180px; object-fit: cover"-->
<!--              ></a-image>-->

<!--            </template>-->

            <template #cover>
              <!-- 渐进式加载组件 -->
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
            </template>


            <!--            图片标题设置为图片名-->
            <a-card-meta :title="picture.name">
              <!-- flex让每个元素有一些距离    图片描述改为分类和标签-->
              <template #description>
                <a-flex>
                  <!-- 分类用绿色，标签用默认-->
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>


            <!-- 卡片操作栏代码-->
            <template v-if="showOp" #actions>
              <!--点击事件必须接收一个e,e就是用户点击事件对象，js的事件对象，不是传的参数-->
              <!-- v-if="canEdit" 接收根据外层传递过来的             -->
              <ShareAltOutlined @click="(e) => doShare(picture, e)" />
              <SearchOutlined @click="(e) => doSearch(picture, e)" />
              <EditOutlined v-if="canEdit" @click="(e) => doEdit(picture, e)" />
              <DeleteOutlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />


<!--              <div style="margin-left: 10px ;margin-bottom: 1px">-->
<!--                <a-popconfirm-->

<!--                  title="Are you sure delete this task?"-->
<!--                  ok-text="Yes"-->
<!--                  cancel-text="No"-->
<!--                  @confirm="(e) =>confirm(e,picture)"-->
<!--                  @cancel="cancel"-->
<!--                >-->
<!--                  <a href="#" style="color: red">删除</a>-->
<!--                </a-popconfirm>-->
<!--              </div>-->
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <!--    用ref引入分享组件,-->
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'
import { deleteSpaceUsingPost } from '@/api/spaceController.ts'
// import { QuestionCircleOutlined } from '@ant-design/icons-vue';
// import { message } from 'ant-design-vue';
// const confirm = async (e,picture) => {
//   console.log(e);
//   // message.success('Click on Yes');
//   // 阻止冒泡
//   e.stopPropagation()
//   const id = picture.id
//   if (!id) {
//     return
//   }
//   const res = await deletePictureUsingPost({ id })
//   if (res.data.code === 0) {
//     message.success('删除成功')
//     props.onReload?.() //执行刷新
//   } else {
//     message.error('删除失败')
//   }
// }
//
// const cancel = (e: MouseEvent) => {
//   console.log(e);
//   message.error('Click on No');
// };

//用来接收dataList的值
interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean //是否展示组件，默认不展示。保证公共图库没有这个修改操作
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void //删除后重新查询，让删除的图片立即消失
}

//定义默认值
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
})

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 搜索
const doSearch = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  // 打开新的页面，新写一个页面以图搜图结果
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 编辑
const doEdit = (picture, e) => {
  // 阻止冒泡，防止跳转到图片详情
  e.stopPropagation()
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    // 编辑时传递参数
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.() //执行刷新
  } else {
    message.error('删除失败')
  }
}

// ----- 分享操作 ----
// 定义引用
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
:deep(.ant-image-img) {
  height: 180px;
  object-fit: cover;

}
:deep(.ant-card-cover) {
  overflow: hidden;
}
.ant-card{
  transition: transform 0.2s;
}

.ant-card:hover {
  transform: translateY(-4px);
}
</style>
