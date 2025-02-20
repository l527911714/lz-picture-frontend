// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** askModel POST /api/ai/ask */
export async function askModelUsingPost(body: API.OllamaRequest, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
