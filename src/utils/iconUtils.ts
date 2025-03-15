// src/utils/iconUtils.ts
import { createFromIconfontCN } from '@ant-design/icons-vue'
import { defineAsyncComponent } from 'vue'

export function IconFont() {
}


// // 方式一：使用阿里云图标库
// export const IconFont = createFromIconfontCN({
//   scriptUrl: '//at.alicdn.com/t/font_1234567_abcde.js' // 替换为你的图标库地址
// })

// 方式二：注册本地SVG组件
export const registerCustomIcons = (app: any) => {
  const icons = import.meta.glob('../components/icons/*.vue')

  Object.entries(icons).forEach(([path, module]) => {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      app.component(name, defineAsyncComponent(module))
    }
  })
}
