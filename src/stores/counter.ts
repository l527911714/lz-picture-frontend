import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// 一个状态就存储一类需要共享数据（存一类变量）
export const useCounterStore = defineStore('counter', () => {
  // 定义状态的初始值
  const count = ref(0)
  // 定义怎么修改状态
  // 定义变量的计算逻辑 getter
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  // 将定义的函数返回出去
  return { count, doubleCount, increment }
})
