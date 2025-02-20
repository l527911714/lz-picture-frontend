import { generateService } from '@umijs/openapi'

generateService({
  requestLibPath: "import request from '@/request'",//自己定义的request.ts请求库
  schemaPath: 'http://localhost:8666/api/v2/api-docs?group=defaultGroup',
  serversPath: './src',   //生产代码放在src目录下
})
