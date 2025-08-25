# mp-weixin-auth-vue

微信 H5 授权 Vue3 插件，基于 Vue Router 的路由守卫实现微信环境下的授权验证与跳转。

## 安装

```bash
# 使用npm
npm install @xiongyongsheng/mp-weixin-auth-vue

# 使用pnpm
pnpm add @xiongyongsheng/mp-weixin-auth-vue
```

## 特性

- 集成微信 H5 授权流程
- 基于 Vue Router 的路由守卫控制
- 支持普通微信和企业微信环境
- 提供全局授权状态检查
- 支持自定义授权逻辑
- 提供微信环境判断和菜单控制工具

## 使用方法

### 1. 初始化插件

```typescript
// main.ts
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import WxAuthPlugin from "@xiongyongsheng/mp-weixin-auth-vue";
import App from "./App.vue";
import routes from "./routes";

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 创建应用实例
const app = createApp(App);

// 安装微信授权插件
app.use(WxAuthPlugin, {
  router,
  appId: "YOUR_WECHAT_APP_ID",
  redirectUri: "https://your-domain.com/auth-callback",
  scope: "snsapi_userinfo",
  // 自定义授权检查逻辑
  checkAuth: async (to, from, next) => {
    // 示例: 检查localStorage中是否存在授权令牌
    const token = localStorage.getItem("wx_auth_token");
    return !!token;
  },
});

app.use(router);
app.mount("#app");
```

### 2. 路由配置

```typescript
// routes.ts
import { RouteRecordRaw } from "vue-router";
import Home from "./views/Home.vue";
import Profile from "./views/Profile.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false }, // 不需要授权
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }, // 需要授权
  },
  {
    path: "/auth-callback",
    name: "AuthCallback",
    component: () => import("./views/AuthCallback.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;
```

### 3. 授权回调处理

```vue
<!-- views/AuthCallback.vue -->
<template>
  <div>授权中...</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

onMounted(async () => {
  const route = useRoute();
  const router = useRouter();
  const code = route.query.code;
  const state = route.query.state;

  if (code) {
    try {
      // 调用后端接口获取访问令牌
      const response = await fetch(`/api/auth/wechat?code=${code}`);
      const data = await response.json();

      // 存储令牌
      localStorage.setItem("wx_auth_token", data.token);

      // 跳转到原始页面或首页
      router.push((state as string) || "/");
    } catch (error) {
      console.error("授权失败:", error);
    }
  }
});
</script>
```

## API

### 插件选项 (WxAuthPluginOptions)

| 参数          | 类型          | 必填 | 描述                          |
| ------------- | ------------- | ---- | ----------------------------- |
| router        | Router        | 是   | Vue Router 实例               |
| appId         | string        | 是   | 微信公众号 AppID              |
| redirectUri   | string        | 是   | 授权后重定向 URL              |
| checkAuth     | Function      | 是   | 自定义授权检查函数            |
| scope         | string        | 否   | 授权作用域，默认`snsapi_base` |
| state         | string/number | 否   | 授权状态参数                  |
| qyRedirectUri | string        | 否   | 企业微信授权重定向 URL        |
| corpId        | string        | 否   | 企业微信企业 ID               |
| agentId       | string        | 否   | 企业微信应用 AgentID          |

### 全局方法

通过`this.$wx`或`app.config.globalProperties.$wx`访问：

| 方法       | 描述                   |
| ---------- | ---------------------- |
| auth       | 微信授权方法           |
| isWeiXin   | 检查是否为微信环境     |
| isQYWeiXin | 检查是否为企业微信环境 |
| hideMenu   | 隐藏微信右上角菜单     |
| showMenu   | 显示微信右上角菜单     |

### 路由元信息

| 参数         | 类型    | 描述                   |
| ------------ | ------- | ---------------------- |
| requiresAuth | boolean | 是否需要授权访问该路由 |

## 企业微信支持

```typescript
app.use(WxAuthPlugin, {
  router,
  corpId: "YOUR_CORP_ID",
  agentId: "YOUR_AGENT_ID",
  qyRedirectUri: "https://your-domain.com/qy-auth-callback",
  // ...其他参数
});
```

## License

ISC
