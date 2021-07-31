// 声明一个插件
// 声明一个类Store
let Vue;

class Store {
  constructor(options) {
    // 1.选项处理
    // this.$options = options
    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrappedGetters = options.getters

    let store = this; // 保存this
    // 定义computed 选项
    const computed = {};
    this.getters = {};
    // doubleCounter: (state) => {
    //   return state.counter * 2;
    // },
    Object.keys(this._wrappedGetters).forEach((key) => {
      // 获取用户定义的getter
      const fn = store._wrappedGetters[key];
      // 转换为computed可以使用的无参数形式
      computed[key] = function() {
        return fn(store.state);
      };
      // 为getters定义只读属性
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key], // store._vm[key]是响应的,这样随着store._vm[key]变化store.getters[key]也会响应变化
      });
    });

    // console.log(computed); // {doubleCounter: ƒ}
    // 2.响应式state
    /*包裹了一层$$data*/
    this._vm = new Vue({
      // data中的值都会做响应化处理
      data: {
        // 加两个$$ vue不做代理
        $$state: options.state,
      },
      // 利用vue的computed计算属性,computed没有参数
      computed,
    });

    this.commit = this.commit.bind(this); /*绑定this*/
    this.dispatch = this.dispatch.bind(this); /*绑定this*/
  }
  // 存取器使之成为只读
  get state() {
    // $data不是响应式对象,_data才是响应式对象
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
