<template>
  <a-watermark content="3310179917@qq.com">
  <div class="container">
    <h1>🤖 AI智能解答</h1>

    <div class="input-group">
      <label for="model">选择AI模型</label>
      <a-select
        id="model"
        v-model:value="model"
        placeholder="请选择模型版本"
        style="width: 100%"
      >
<!--        <a-select-option value="deepseek-r1:1.5b">初级AI（1.5B参数）</a-select-option>-->
<!--        <a-select-option value="deepseek-r1:8b">中级AI（8B参数）</a-select-option>-->
<!--        <a-select-option value="deepseek-r1:14b">高级AI（14B参数）</a-select-option>-->
        <a-select-option value="deepseek-r1:1.5b">初级 AI</a-select-option>
        <a-select-option value="deepseek-r1:8b">中级 AI</a-select-option>
        <a-select-option value="deepseek-r1:14b">高级 AI</a-select-option>
      </a-select>
    </div>

    <div class="input-group">
      <label for="prompt">输入您的问题</label>
      <div class="input-wrapper">
        <textarea
          id="prompt"
          v-model="prompt"
          rows="5"
          placeholder="请输入您的问题，尽量清晰明确..."
          @keydown.enter.exact.prevent="handleEnter"
        ></textarea>
        <button
          class="inline-send-btn"
          :disabled="isLoading"
          @click="askAI"
        >
          <span v-if="!isLoading">发送</span>
          <a-spin v-else size="small" />
        </button>
      </div>
    </div>

    <div class="input-group" >
      <a-button
        class="main-send-btn"
        :disabled="isLoading"
        :class="{ loading: isLoading }"
        @click="askAI"
        type="primary"
        style="background: #1a3aff"
      >
        {{ isLoading ? '处理中...' : '发送问题' }}
      </a-button>
    </div>


    <div class="input-group">
      <label>AI回复</label>
      <div id="response">{{ responseText }}</div>
    </div>
  </div>
    <div style="height: 500px" />
  </a-watermark>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import axios from 'axios'

const model = ref('deepseek-r1:1.5b')
const prompt = ref('')
const responseText = ref('等待问题提交...')
const isLoading = ref(false)

const askAI = async () => {
  if (!model.value || !prompt.value) {
    responseText.value = '请填写模型名称和问题内容'
    return
  }

  try {
    isLoading.value = true
    responseText.value = '思考中...'

    const response = await axios.post('http://localhost:8666/api/ai/ask', {
      model: model.value,
      prompt: prompt.value
    }, {
      timeout: 300000
    })

    responseText.value = response.data.response
  } catch (error: any) {
    console.error('Error:', error)
    responseText.value = `请求失败: ${error.response?.data?.error || error.message}`
  } finally {
    isLoading.value = false
  }
}

const handleEnter = () => {
  if (!isLoading.value) {
    askAI()
  }
}
</script>

<style scoped>


/* 新增样式 */
.input-wrapper {
  position: relative;
}

.inline-send-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
}

.inline-send-btn:hover:not(:disabled) {
  background: var(--hover-color);
  transform: translateY(-1px);
}

.inline-send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 调整原样式 */
textarea {
  padding-bottom: 40px; /* 为按钮留出空间 */
}

/* ...其他样式保持不变... */

.main-send-btn {
  margin-top: 1rem;
  padding: 8px 16px; /* 根据需要调整 */
  background: var(--primary-color, blue); /* 使用变量或直接指定颜色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; /* 添加此行启用Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 40px; /* 固定高度或者根据需要调整 */
}

.main-send-btn:hover:not(.loading) {
  background: var(--hover-color, darkblue); /* 使用变量或直接指定颜色 */
  transform: translateY(-1px);
}

.main-send-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 其他保持原有样式不变 */
/* ...原有样式... */
.input-group {
  margin-bottom: 1.5rem;
}

/* 增强选择框样式 */
:deep(.ant-select-selector) {
  height: 42px !important;
  border-radius: 6px !important;
  padding: 0 12px !important;
}

:deep(.ant-select-selection-item) {
  font-weight: 500;
}

:root {
  --primary-color: #2563eb;
  --hover-color: #1d4ed8;
  --bg-color: #f8fafc;
  --text-color: #1e293b;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
  font-size: 2.2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
  font-weight: 500;
}

button:hover:not(:disabled) {
  background-color: var(--hover-color);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

#response {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f1f5f9;
  border-radius: 8px;
  min-height: 120px;
  white-space: pre-wrap;
  line-height: 1.8;
}

.loading {
  position: relative;
  pointer-events: none;
}

.loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}
</style>
<!--<template>-->
<!--  <div class="container">-->
<!--    <h1>🤖 AI智能解答</h1>-->

<!--&lt;!&ndash;    <div class="input-group">&ndash;&gt;-->
<!--&lt;!&ndash;      <label for="model">选择AI模型</label>&ndash;&gt;-->
<!--&lt;!&ndash;      <input&ndash;&gt;-->
<!--&lt;!&ndash;        type="text"&ndash;&gt;-->
<!--&lt;!&ndash;        id="model"&ndash;&gt;-->
<!--&lt;!&ndash;        v-model="model"&ndash;&gt;-->
<!--&lt;!&ndash;        placeholder="输入模型名称，例如：deepseek-r1:8b"&ndash;&gt;-->
<!--&lt;!&ndash;      >&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->

<!--      <div class="input-group">-->
<!--        <label for="model">选择AI模型</label>-->
<!--        <a-select-->
<!--          id="model"-->
<!--          v-model:value="model"-->
<!--          placeholder="请选择模型版本"-->
<!--          style="width: 100%"-->
<!--        >-->
<!--          <a-select-option value="deepseek-r1:1.5b">初级AI（1.5B参数）</a-select-option>-->
<!--          <a-select-option value="deepseek-r1:8b">中级AI（8B参数）</a-select-option>-->
<!--          <a-select-option value="deepseek-r1:14b">高级AI（14B参数）</a-select-option>-->
<!--        </a-select>-->
<!--      </div>-->



<!--    <div class="input-group">-->
<!--      <label for="prompt">输入您的问题</label>-->
<!--      <textarea-->
<!--        id="prompt"-->
<!--        v-model="prompt"-->
<!--        rows="5"-->
<!--        placeholder="请输入您的问题，尽量清晰明确..."-->
<!--      ></textarea>-->
<!--    </div>-->

<!--    <button-->
<!--      :disabled="isLoading"-->
<!--      :class="{ loading: isLoading }"-->
<!--      @click="askAI"-->
<!--    >-->
<!--      {{ isLoading ? '处理中...' : '发送问题' }}-->
<!--    </button>-->

<!--    <div class="input-group">-->
<!--      <label>AI回复</label>-->
<!--      <div id="response">{{ responseText }}</div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->

<!--const model = ref('deepseek-r1:8b'); // 默认选中中级AI-->

<!--import { ref } from 'vue'-->
<!--import axios from 'axios'-->

<!--// const model = ref('')-->
<!--const prompt = ref('')-->
<!--const responseText = ref('等待问题提交...')-->
<!--const isLoading = ref(false)-->

<!--const askAI = async () => {-->
<!--  if (!model.value || !prompt.value) {-->
<!--    responseText.value = '请填写模型名称和问题内容'-->
<!--    return-->
<!--  }-->

<!--  try {-->
<!--    isLoading.value = true-->
<!--    responseText.value = '思考中...'-->

<!--    const response = await axios.post('http://localhost:8666/api/ai/ask', {-->
<!--      model: model.value,-->
<!--      prompt: prompt.value-->
<!--    }, {-->
<!--      timeout: 30000-->
<!--    })-->

<!--    responseText.value = response.data.response-->
<!--  } catch (error: any) {-->
<!--    console.error('Error:', error)-->
<!--    responseText.value = `请求失败: ${error.response?.data?.error || error.message}`-->
<!--  } finally {-->
<!--    isLoading.value = false-->
<!--  }-->
<!--}-->
<!--</script>-->
<!--<style scoped>-->
<!--.input-group {-->
<!--  margin-bottom: 1.5rem;-->
<!--}-->

<!--/* 增强选择框样式 */-->
<!--:deep(.ant-select-selector) {-->
<!--  height: 42px !important;-->
<!--  border-radius: 6px !important;-->
<!--  padding: 0 12px !important;-->
<!--}-->

<!--:deep(.ant-select-selection-item) {-->
<!--  font-weight: 500;-->
<!--}-->

<!--:root {-->
<!--  &#45;&#45;primary-color: #2563eb;-->
<!--  &#45;&#45;hover-color: #1d4ed8;-->
<!--  &#45;&#45;bg-color: #f8fafc;-->
<!--  &#45;&#45;text-color: #1e293b;-->
<!--}-->

<!--.container {-->
<!--  background: white;-->
<!--  padding: 2rem;-->
<!--  border-radius: 12px;-->
<!--  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);-->
<!--  max-width: 800px;-->
<!--  margin: 0 auto;-->
<!--}-->

<!--h1 {-->
<!--  text-align: center;-->
<!--  margin-bottom: 2rem;-->
<!--  color: var(&#45;&#45;primary-color);-->
<!--  font-size: 2.2rem;-->
<!--}-->

<!--.input-group {-->
<!--  margin-bottom: 1.5rem;-->
<!--}-->

<!--label {-->
<!--  display: block;-->
<!--  margin-bottom: 0.5rem;-->
<!--  font-weight: 500;-->
<!--  color: #334155;-->
<!--}-->

<!--input[type="text"],-->
<!--textarea {-->
<!--  width: 100%;-->
<!--  padding: 0.8rem;-->
<!--  border: 2px solid #e2e8f0;-->
<!--  border-radius: 6px;-->
<!--  font-size: 1rem;-->
<!--  transition: border-color 0.2s;-->
<!--}-->

<!--input[type="text"]:focus,-->
<!--textarea:focus {-->
<!--  outline: none;-->
<!--  border-color: var(&#45;&#45;primary-color);-->
<!--  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);-->
<!--}-->

<!--button {-->
<!--  background-color: var(&#45;&#45;primary-color);-->
<!--  color: white;-->
<!--  padding: 0.8rem 1.5rem;-->
<!--  border: none;-->
<!--  border-radius: 6px;-->
<!--  font-size: 1rem;-->
<!--  cursor: pointer;-->
<!--  transition: background 0.2s, transform 0.1s;-->
<!--  width: 100%;-->
<!--  font-weight: 500;-->
<!--}-->

<!--button:hover:not(:disabled) {-->
<!--  background-color: var(&#45;&#45;hover-color);-->
<!--}-->

<!--button:active:not(:disabled) {-->
<!--  transform: scale(0.98);-->
<!--}-->

<!--button:disabled {-->
<!--  opacity: 0.7;-->
<!--  cursor: not-allowed;-->
<!--}-->

<!--#response {-->
<!--  margin-top: 2rem;-->
<!--  padding: 1.5rem;-->
<!--  background: #f1f5f9;-->
<!--  border-radius: 8px;-->
<!--  min-height: 120px;-->
<!--  white-space: pre-wrap;-->
<!--  line-height: 1.8;-->
<!--}-->

<!--.loading {-->
<!--  position: relative;-->
<!--  pointer-events: none;-->
<!--}-->

<!--.loading::after {-->
<!--  content: "";-->
<!--  position: absolute;-->
<!--  top: 50%;-->
<!--  left: 50%;-->
<!--  width: 20px;-->
<!--  height: 20px;-->
<!--  border: 3px solid rgba(255, 255, 255, 0.3);-->
<!--  border-top-color: white;-->
<!--  border-radius: 50%;-->
<!--  animation: spin 1s linear infinite;-->
<!--}-->

<!--@keyframes spin {-->
<!--  to { transform: rotate(360deg); }-->
<!--}-->

<!--@media (max-width: 640px) {-->
<!--  .container {-->
<!--    padding: 1.5rem;-->
<!--  }-->
<!--}-->
<!--</style>-->
