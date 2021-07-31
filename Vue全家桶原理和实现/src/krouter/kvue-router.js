// 1.实现一个插件
// 2.实现VueRouter: 处理选项、监控url变化，动态渲染
let Vue;

class VueRouter {
  // Vue要在这里用
  constructor(options) {
    // 1.处理选项
    this.$options = options;

    // 2.需要响应式的current
    // 在渲染函数中使用到的响应式数据 就会发生render
    const initial = window.location.hash.slice(1) || "/";
    Vue.util.defineReactive(this, "current", initial);

    // 3.监控url变化
    window.addEventListener("hashchange", this.onHashChange.bind(this)); // this默认指向window
  }

  onHashChange() {
    this.current = window.location.hash.slice(1); // 获取hash值
  }
}

// 插件要求实现install(Vue)
VueRouter.install = function(_Vue) {
  Vue = _Vue;

  // 利用全局混入延迟调用后续代码
  Vue.mixin({
    beforeCreate() {
      // 任务1：挂载$router
      // 以后每个组件都会调用该方法
      if (this.$options.router) { //根组件
        // 此时的上下文this是当前组件实例
        Vue.prototype.$router = this.$options.router;
      }
    },
  });

  // 任务2：注册两个全局组件
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    /*运行时模式不能使用template方式*/
    render(h) {
      // <router-link to="#/about">abc</router-link>
      // <a href="#/about">abc</a>
      // return <a href={"#" + this.to}>{this.$slots.default}</a>; // JSX
      /*默认插槽*/
      return h("a", { attrs: { href: "#" + this.to } }, this.$slots.default);
    },
  });

  Vue.component("router-view", {
    render(h) {
      // 获取current
      let Component = null;
      const route = this.$router.$options.routes.find(
        (route) => route.path === this.$router.current
      );
      if (route) {
        Component = route.component;
      }
      return h(Component);
    },
  });
};

export default VueRouter;
