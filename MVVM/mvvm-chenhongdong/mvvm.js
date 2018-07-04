function Mvvm(options = {}) {
  // vm.$options Vue上是将所有属性挂载到上面
  this.$options = options;
  let data = this._data = this.$options.data;
  // 数据劫持
  observe(data)

  // 数据代理
  for (let key in data) {
    Object.defineProperty(this, key, {
      configurable: true,
      get () {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal
      }
    })
  }
  new Compile(options.el, this);
}

// 数据劫持
function Observe(data) {
  // 所谓数据劫持就是给对象增加 get， set
  let dep = new Dep()
  for(let key in data) {
    let val = data[key]
    observe(val); // 递归继续向下找，实现深度的数据劫持
    Object.defineProperty(data, key, {
      configurable: true,
      get () {
        Dep.target && dep.addSub(Dep.target)
        return val;
      },
      set (newVal) {
        if (val === newVal) {
          return 
        }
        val = newVal
        observe(newVal)
        dep.notify()
      }
    })
  }
}

function observe(data) {
  if (!data || typeof data !== 'object') return
  return new Observe(data)
}

// 数据编译

function Compile (el, vm) {
  // 将 el 挂载到实例上方便调用
  vm.$el = document.querySelector(el);
  // 再 el 范围里将内容都拿到，当然不能一个一个的拿
  // 可以选择移到内存中然后放入文档碎片中，节省开销
  let fragment = document.createDocumentFragment()

  while (child = vm.$el.firstChild) {
    fragment.appendChild(child); // 此时将el中的内容放入内存中
  }

  // 对 el 里面的内容进行替换
  function replace (frag) {
    Array.from(frag.childNodes).forEach(node => {
      let txt = node.textContent;
      let reg = /\{\{(.*?)\}\}/g; // 正则匹配{{}}

      if (node.nodeType === 3 && reg.test(txt)) {
        // 既是文本节点又有大括号的情况
        console.log(RegExp.$1);
        let arr = RegExp.$1.split('.')
        let val = vm
        arr.forEach(key => {
          val = val[key]
        })
        node.textContent = txt.replace(reg, val).trim()
        // 监听变化
        new Watcher(vm, RegExp.$1, newVal => {
          node.textContent = txt.replace(reg, newVal).trim()
        })
      }

      if (node.childNodes && node.childNodes.length) {
        replace(node);
      }
    })

  }
  replace(fragment)
  vm.$el.appendChild(fragment)
}

// 发布订阅
function Dep () {
  // 存放函数的事件池
  this.subs = []
}

Dep.prototype = {
  addSub (sub) {
    this.subs.push(sub)
  },
  notify () {
    // 绑定的方法，都有一个 update 方法
    this.subs.forEach(sub => sub.update())
  }
}

// 监听函数
// 通过 Watcher 这个类创建的实例， 都拥有 update 方法
function Watcher (vm, exp, fn) {
  this.fn = fn;
  this.vm = vm;
  this.exp = exp;
  Dep.target = this;
  let arr = exp.split('.')
  let val = vm;
  arr.forEach(key => {
    val = val[key]
  })
  Dep.target = null;
}

Watcher.prototype.update = function () {
  let arr = this.exp.split('.')
  let val = this.vm;
  arr.forEach(key => {
    val = val[key]
  })
  console.log('update.....')
  console.log(this.exp)
  this.fn(val);
}

//  https://juejin.im/post/5abdd6f6f265da23793c4458#heading-12