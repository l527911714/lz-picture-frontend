<template>
  <div id="userManagePage">
<!--    搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear/>
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 20px"></div>
<!--表格-->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" width="100px" />
          <a>
            {{ record.name }}
          </a>
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="red">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <div style="margin-left: 10px ;margin-bottom: 1px">
              <a-popconfirm

                title="Are you sure delete this task?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="(e) =>confirm(e,record.id)"
                @cancel="cancel"
              >
<!--                <a href="#" style="color: red">删除</a>-->
                <a-button type="primary" danger>删除</a-button>
              </a-popconfirm>

            </div>
<!--            <a-button danger @click="doDelete(record.id)">删除</a-button>-->
            <a-button type="primary" @click="showEditModal(record)" style="margin-right: 8px">编辑</a-button>
          </a-space>
          <!--          <a-button danger @click="doAdd(record.id)">新增用户</a-button>-->
        </template>
      </template>
    </a-table>
    <!-- 新增用户模态框 -->
    <a-modal
      v-model:visible="addModalVisible"
      title="新增用户"
      @ok="handleAddOk"
      @cancel="handleAddCancel"
    >
      <a-form :model="addForm" :label-col="{ span: 6 }">
        <a-form-item label="账号" required>
          <a-input v-model:value="addForm.userAccount" />
        </a-form-item>
        <a-form-item label="用户名" required>
          <a-input v-model:value="addForm.userName" />
        </a-form-item>
        <a-form-item label="头像URL">
          <a-input v-model:value="addForm.userAvatar" />
        </a-form-item>
        <a-form-item label="用户简介">
          <a-input v-model:value="addForm.userProfile" />
        </a-form-item>
        <a-form-item label="用户角色" required>
          <a-select v-model:value="addForm.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑用户模态框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑用户"
      @ok="handleEditOk"
      @cancel="handleEditCancel"
    >
      <a-form :model="editForm" :label-col="{ span: 6 }">
        <a-form-item label="用户名" required>
          <a-input v-model:value="editForm.userName" />
        </a-form-item>
        <a-form-item label="头像URL">
          <a-input v-model:value="editForm.userAvatar" />
        </a-form-item>
        <a-form-item label="用户简介">
          <a-input v-model:value="editForm.userProfile" />
        </a-form-item>
        <a-form-item label="用户角色" required>
          <a-select v-model:value="editForm.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>
<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  addUserUsingPost,
  deleteUserUsingPost, getLoginUserUsingGet,
  listUserVoByPageUsingPost,
  updateUserUsingPost
} from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { deleteSpaceUsingPost } from '@/api/spaceController.ts'


const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

//定义数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

//搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  //指定默认排序规则,创建时间升序
  sortField: 'createTime',
  sortOrder: 'ascend',
})
// 新增相关
const addModalVisible = ref(false)
const addForm = reactive({
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user'
})

// 编辑相关
const editModalVisible = ref(false)
const editForm = reactive({
  id: undefined,
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user'
})
//获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败:' + res.data.message)
  }
}

//什么时候获取数据,页面加载时获取一次数据
onMounted(() => {
  fetchData()
})

//定义分页器,定义分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current, //当前页
    pageSize: searchParams.pageSize, //每页条数
    total: total.value, //总条数
    showSizeChanger: true, //是否允许用户切换页码
    showTotal: (total) => `共${total}条`, //显示总条数
  }
})

//表格变化之后，重新获取数据
const doTableChange=(page:any)=>{
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData();//复制后重新获取数据
}

//搜索数据
const doSearch=()=>{
  //每次搜索重置页面，从第一页开始搜索
  searchParams.current = 1
  fetchData()
}

const confirm = async (e,id: string) => {
  console.log(e);
  // message.success('Click on Yes');
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}
const cancel = (e: MouseEvent) => {
  console.log(e);
  message.error('取消操作');
};
//删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 删除成功后，刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
 }
// 显示新增模态框
const showAddModal = () => {
  addModalVisible.value = true
}
// 新增提交处理
const handleAddOk = async () => {
  try {
    const res = await addUserUsingPost(addForm)
    if (res.data.code === 0) {
      message.success('新增成功')
      addModalVisible.value = false
      Object.assign(addForm, {
        userAccount: '',
        userName: '',
        userAvatar: '',
        userProfile: '',
        userRole: 'user'
      })
      fetchData()
    } else {
      message.error('新增失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败')
  }
}
const handleAddCancel = () => {
  addModalVisible.value = false
}

// 显示编辑模态框
const showEditModal = (record: API.UserVO) => {
  Object.assign(editForm, {
    id: record.id,
    userName: record.userName,
    userAvatar: record.userAvatar,
    userProfile: record.userProfile,
    userRole: record.userRole
  })
  editModalVisible.value = true
}

// 编辑提交处理
const handleEditOk = async () => {
  try {
    const res = await updateUserUsingPost(editForm)
    if (res.data.code === 0) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchData()
    } else {
      message.error('更新失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败')
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}
</script>
