// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** chatWithModel POST /api/ollama/chat */
export async function chatWithModelUsingPost(
  body: API.PromptRequest,
  options?: { [key: string]: any }
) {
  return request<string>('/api/ollama/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
