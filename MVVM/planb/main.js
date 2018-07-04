let uid = 0;
// 用于储存订阅者并发布消息
class Dep {
  constructor() {
    // 设置id，用于区分新 Watcher 和只改变属性值后新产生的 Watcher
    this.id = uid++
      // 储存订阅者的数组
      this.subs = [];
  }
  // 触发 target 上的 Watcher 中的 addDep 方法， 参数为 dep 的实例本身
  depend() {
    Dep.target.addDep(this)
  }
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub)
  }
  notify() {
    // 通知所有的订阅者 （Watcher） 触发订阅者的相应逻辑处理
    this.subs.forEach(sub => sub.update())
  }
}

// 为 Dep 类设置一个静态属性， 默认为 null， 工作时指向当前的 Watcher
Dep.target = null

class Observer {
  constructor(value) {
    this.value = value
    this.walk(value)
  }
  walk(value) {
    Object.keys(value).forEach(key => this.convert(key, value[key]))
  }
  convert(key, val) {
    defineReactive(this.value, key, val)
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep()
  // 给当前属性的值添加监听
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: () => {
      // 如果 Dep类存在 target 属性，将其添加到 dep 实例的 subs数组中
      // target 指向一个 Watcher实例，每个Watcher都是一个订阅者
      // Watcher 实例在实例化过程中，会读取 data 中的某个属性，从而触发当前 get 方法
      if (Dep.target) {
        dep.depend()
      }
      return val;
    },
    set: newVal => {
      if (val === newVal) return;
      val = newVal;
      childOb = observe(newVal)
      dep.notify()
    }
  })
}

function observe(value) {
  // 当值不存在，或者不是复杂数据类型时，不再需要继续深入监听
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value)
}

class Watcher {
  constructor(vm, exp, cb) {
    this.depIds = {} //hash储存订阅者的 id，避免重复的订阅者
    this.vm = vm
    this.cb = cb
    this.exp = exp
    this.val = this.get()
  }
  update() {
    this.run()
  }
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this);
      this.depIds[dep.id] = dep
    }
  }
  run() {
    const val = this.get()
    console.log(val)
    if (val !== this.val) {
      this.val = val;
      this.cb.call(this.vm, val)
    }
  }
  get() {
    Dep.target = this;
    const val = this.vm._data[this.exp]
    Dep.target = null
    return val
  }
}

class Vue {
  constructor(options = {}) {
    this.$options = options;
    let data = (this._data = this.$options.data)
    Object.keys(data).forEach(key => this._proxy(key))
    observe(data)
  }
  $watch(exp, cb) {
    new Watcher(this, exp, cb)
  }
  _proxy(key) {
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: () => this._data[key],
      set: val => {
        this._data[key] = val
      }
    })
  }
}
let demo = new Vue({
  data: {
    text: '',
    txt: ''
  },
});

const p = document.getElementById('p');
const input = document.getElementById('input');

input.addEventListener('keyup', function (e) {
  demo.text = e.target.value;
});

demo.$watch('text', str => p.innerHTML = str);
demo.$watch('txt', str => div.innerHTML = str)

// https://juejin.im/post/5acd0c8a6fb9a028da7cdfaf