// module.exports = {
//   chainWebpack: config => {
//     const svgRule = config.module.rule('svg');
//
//     svgRule.uses.clear();
//
//     svgRule.use('vue-svg-loader').loader('vue-svg-loader');
//   },
// };
//
// import { defineComponent } from 'vue';
// import Icon from '@ant-design/icons-vue';
// import MessageSvg from 'assets/smiling_face_with_hearts_color.svg'; // '*.svg' 文件的路径
//
// export default defineComponent({
//   setup() {
//     return () => <Icon type={MessageSvg} />;
//   },
// });
import { createFromIconfontCN } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
const MyIcon = createFromIconfontCN({
  scriptUrl: 'https://iconfont.alicdn.com/p/illus/preview_image/6DCpzl5Xujsn/02ca344a-ce50-4467-9760-b3e46305ce24.png', // 在 iconfont.cn 上生成
});

export default defineComponent({
  setup() {
    return () => <MyIcon type="icon-dianzan" />;
  },
});
