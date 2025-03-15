<template>
  <div class="app-container">
    <!-- 主聊天界面 -->
    <div class="chat-container">
      <!-- 好友列表 -->
      <div class="friend-list">
        <div class="friend-header">
          <h3>Contacts</h3>
          <div class="friend-input-container">
            <input
              type="text"
              v-model="newFriendUsername"
              placeholder="Add friend"
              @keyup.enter="handleAddFriend"
            >
            <button class="add-btn" @click="handleAddFriend">
              <i class="icon-plus"></i>
            </button>
          </div>
        </div>
        <div class="channel-item" @click="switchToPublicChannel">
          <i class="icon-globe"></i>
          <span>公共频道</span>
        </div>
        <div
          v-for="friend in friends"
          :key="friend.userAccount"
          class="friend-item"
          @click="switchToPrivateChat(friend.userAccount)"
        >
          <i class="icon-user"></i>
          <span>{{ friend.userAccount }}</span>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-box">
        <div class="chat-header">
          <h2>{{ chatTitle }}</h2>
        </div>
        <div class="chat-content" ref="chatContentRef">
          <div
            v-for="message in currentMessages"
            :key="message.timestamp"
            :class="['message', messageClass(message)]"
          >
            <div v-if="showSender(message)" class="message-sender">
              {{ message.sender }}
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTimestamp(message.timestamp) }}</div>
          </div>
        </div>
        <div class="message-input-container">
          <input
            type="text"
            v-model="messageInput"
            placeholder="Type your message..."
            @keyup.enter="sendMessage"
          >
          <button class="send-btn" @click="sendMessage">
            <i class="icon-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import SockJS from 'sockjs-client'
import Stomp, { type Client, type Subscription } from 'stompjs'
import { addFriendUsingPost, getFriendsUsingGet } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import router from '@/router' // 确保路径正确


// 类型定义
interface Message {
  sender: string
  recipient?: string
  content: string
  type: 'CHAT' | 'SYSTEM'
  timestamp: number
}

interface Friend {
  userAccount: string
}

// 响应式状态修改
const loginUserStore = useLoginUserStore()
const friends = ref<Friend[]>([])
const newFriendUsername = ref('')
const messageInput = ref('')
const chatContentRef = ref<HTMLElement | null>(null)

// WebSocket 相关状态
const stompClient = ref<Client | null>(null)
const subscriptions = reactive<Record<string, Subscription>>({})
const publicMessages = ref<Message[]>([])
const privateChats = reactive<Record<string, Message[]>>({})

// 当前聊天状态
const currentChannel = ref<'public' | 'private'>('public')
const currentRecipient = ref<string | null>(null)

// 计算属性
const currentMessages = computed(() => {
  return currentChannel.value === 'public'
    ? publicMessages.value
    : (currentRecipient.value ? privateChats[currentRecipient.value] || [] : [])
})

const chatTitle = computed(() => {
  return currentChannel.value === 'public'
    ? 'Public Channel'
    : `Chat with ${currentRecipient.value}`
})
// 计算属性优化
const userAccount = computed(() => loginUserStore.loginUser.userAccount || '未知用户')

// 用户未登录，则直接跳转到登录页面
const loginUser = loginUserStore.loginUser
if (!loginUser?.id) {
  router.replace('/user/login')
}

// 生命周期钩子修改
onMounted(async () => {
  await loginUserStore.fetchLoginUser() // 确保先获取用户信息
  initWebSocket()
  loadFriends()
})

// 方法
// 初始化WebSocket
const initWebSocket = () => {
  const socket = new SockJS('http://localhost:8666/api/ws')
  stompClient.value = Stomp.over(socket)
  stompClient.value.connect({}, () => {
    subscribeToPublicChannel()
  })
}

// 方法修改
const loadFriends = async () => {
  try {
    const { data } = await getFriendsUsingGet({
      userAccount: userAccount.value // 使用计算属性
    })
    friends.value = data
  } catch (error) {
    console.error('Failed to load friends:', error)
  }
}

const handleAddFriend = async () => {
  if (!newFriendUsername.value) return

  try {
    await addFriendUsingPost({
      userAccount: userAccount.value, // 使用计算属性
      friendname: newFriendUsername.value
    })
    newFriendUsername.value = ''
    await loadFriends()
  } catch (error) {
    alert('添加好友失败: ' + (error as Error).message)
  }
}

// 消息处理
const sendMessage = () => {
  if (!messageInput.value.trim()) return

  const message: Message = {
    sender: userAccount.value, // 使用计算属性
    content: messageInput.value,
    type: 'CHAT',
    timestamp: Date.now()
  }

  if (currentChannel.value === 'public') {
    sendPublicMessage(message)
  } else {
    sendPrivateMessage(message)
  }

  messageInput.value = ''
  scrollToBottom()
}

const sendPublicMessage = (message: Message) => {
  stompClient.value?.send(
    '/app/public-channel',
    {},
    JSON.stringify(message)
  )
  // publicMessages.value.push(message)
}

const sendPrivateMessage = (message: Message) => {
  const payload = {
    ...message,
    recipient: currentRecipient.value
  }

  stompClient.value?.send(
    '/app/private-channel',
    {},
    JSON.stringify(payload)
  )

  if (!privateChats[currentRecipient.value!]) {
    privateChats[currentRecipient.value!] = []
  }
  privateChats[currentRecipient.value!].push(payload)
}

// 频道管理
const switchToPublicChannel = () => {
  currentChannel.value = 'public'
  currentRecipient.value = null
  subscribeToPublicChannel()
}

const switchToPrivateChat = (friendAccount: string) => {
  if (currentRecipient.value === friendAccount) return

  currentChannel.value = 'private'
  currentRecipient.value = friendAccount
  subscribeToPrivateChannel(friendAccount)
}

// WebSocket 订阅
const subscribeToPublicChannel = () => {
  if (subscriptions.public || !stompClient.value) return

  subscriptions.public = stompClient.value.subscribe(
    '/topic/public',
    ({ body }) => {
      const message = JSON.parse(body) as Message
      publicMessages.value.push(message)
      scrollToBottom()
    }
  )
}

// WebSocket订阅路径修改
const subscribeToPrivateChannel = (friendAccount: string) => {
  const channelKey = `private-${friendAccount}`
  if (subscriptions[channelKey] || !stompClient.value) return

  subscriptions[channelKey] = stompClient.value.subscribe(
    `/queue/private-${userAccount.value}-${friendAccount}`, // 使用计算属性
    ({ body }) => {
      const message = JSON.parse(body) as Message
      if (!privateChats[friendAccount]) {
        privateChats[friendAccount] = []
      }
      privateChats[friendAccount].push(message)
      scrollToBottom()
    }
  )
}

// 工具方法
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

// 消息类型判断修改
const messageClass = (message: Message) => {
  return message.sender === userAccount.value
    ? 'sent-message'
    : 'received-message'
}

const showSender = (message: Message) => {
  return currentChannel.value === 'public' &&
    message.sender !== userAccount.value
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 清理工作
onBeforeUnmount(() => {
  Object.values(subscriptions).forEach(sub => sub.unsubscribe())
  if (stompClient.value) {
    stompClient.value.disconnect()
  }
})
</script>

<style scoped>
/* 优化后的样式 */
.app-container {
  height: 80vh;
  background: #f5f6fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container {
  width: 100%;
  max-width: 1600px;
  height: 80vh;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  overflow: hidden;
}

.friend-list {
  width: 280px;
  background: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.friend-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #34495e;
}

.friend-input-container {
  position: relative;
  margin-top: 15px;
}

.friend-input-container input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border-radius: 20px;
  border: none;
  background: #34495e;
  color: white;
}

.add-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
}

.channel-item, .friend-item {
  padding: 12px 15px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.channel-item:hover, .friend-item:hover {
  background: #34495e;
}

.channel-item i, .friend-item i {
  margin-right: 10px;
  font-size: 14px;
}

.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  max-width: 70%;
  margin: 10px 0;
  padding: 12px 15px;
  border-radius: 15px;
  position: relative;
}

.received-message {
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.sent-message {
  background: #3498db;
  color: white;
  margin-left: auto;
}

.message-sender {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.message-time {
  font-size: 10px;
  text-align: right;
  margin-top: 5px;
  opacity: 0.8;
}

.message-input-container {
  display: flex;
  padding: 20px;
  gap: 10px;
  border-top: 1px solid #eee;
}

.message-input-container input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
}

.send-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图标字体 */
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/font_1234567_abcdefghijk.eot');
  /* 实际项目需替换正确图标字体地址 */
}

[class^="icon-"] {
  font-family: 'iconfont' !important;
  font-style: normal;
}
</style>
