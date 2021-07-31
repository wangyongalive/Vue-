// 声明一个插件
// 声明一个类Store
let Vue;

class Store {
  constructor(options) {
    // 1.选项处理
    // this.$options = options
    this._mutations = options.mutations;
    this._actions = options.actions;
    // 2.响应式state
    /*包裹了一层*/
    this._vm = new Vue({
      data: {
        $$state: options.state,
      },
    });

    this.commit = this.commit.bind(this); /*绑定this*/
    this.dispatch = this.dispatch.bind(this); /*绑定this*/
  }

  get state() {
    // $data不是响应式对象
    console.log(this._vm);
    return this._vm._data.$$state;
  }

  set state(v) {
    console.error("please use replaceState to reset state");
  }

  commit(type, payload) {
    const entry = this._mutations[type];

    if (!entry) {
      console.error("unkwnow mutation type");
      return;
    }

    entry(this.state, payload);
  }

  dispatch(type, payload) {
    const entry = this._actions[type];

    if (!entry) {
      console.error("unkwnow action type");
      return;
    }
    /*上下文对象*/
    entry(this, payload);
  }
}
function install(_Vue) {
  Vue = _Vue;

  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    },
  });
}

// 导出对象认为是Vuex
export default { Store, install };
