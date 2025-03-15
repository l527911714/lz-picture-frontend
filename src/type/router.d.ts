// types/router.d.ts
export interface RouteConfig {
  path: string
  name: string
  meta: {
    title: string
    icon: keyof typeof iconMap // 使用图标映射类型
    requiresAuth?: boolean
  }
}

export const iconMap = {
  chat: 'chat',
  home: 'home',
  // 其他图标...
} as const
