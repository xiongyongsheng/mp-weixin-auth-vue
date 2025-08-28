import { App } from "vue";
import { Router, RouteLocationNormalized } from "vue-router";
import {
  wxAuth,
  isWeiXin,
  isQYWeiXin,
  hideMenu,
  showMenu,
  type WxAuthParams,
} from "@xiongyongsheng/tool";

export interface WxAuthPluginOptions extends WxAuthParams {
  /** 路由实例 */
  router: Router;
  checkAuth: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: (to?: string | RouteLocationNormalized | false | void) => void
  ) => Promise<boolean>;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $wx: {
      auth: typeof wxAuth;
      isWeiXin: typeof isWeiXin;
      isQYWeiXin: typeof isQYWeiXin;
      hideMenu: typeof hideMenu;
      showMenu: typeof showMenu;
    };
  }
}

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

export default {
  install: (app: App, options: WxAuthPluginOptions) => {
    if (
      !options ||
      !options.router ||
      (!options.appId && !options.corpId) ||
      (!options.redirectUri && !options.qyRedirectUri)
    ) {
      throw new Error(
        "wx-weixin-auth-vue: Missing required options. Ensure router, appId, and redirectUri are provided."
      );
    }

    const { router, checkAuth, ...wxAuthOptions } = options;

    // 提供全局方法
    app.config.globalProperties.$wx = {
      auth: wxAuth,
      isWeiXin,
      isQYWeiXin,
      hideMenu,
      showMenu,
    };

    // 添加路由守卫
    router.beforeEach(async (to: RouteLocationNormalized, from, next) => {
      const isAuthorized = await checkAuth(to, from, next);
      if (to.meta.requiresAuth) {
        if (!isAuthorized && isWeiXin()) {
          // 调用微信授权
          wxAuth({
            ...wxAuthOptions,
            state: wxAuthOptions.state || to.fullPath,
          }).catch((err) => {
            console.error("微信授权失败:", err);
            next(false);
          });
        } else if (!isWeiXin()) {
          console.warn("非微信环境，跳过授权检查");
          next();
        } else {
          next();
        }
      } else {
        next();
      }
    });
  },
};
