// 实现一个 Vue 双向数据绑定

function MyVue(options) {
  this._init(options)
}

MyVue.prototype._init = function (options) {
  this.$options = options; // options 为上面使用时传入的结构体，包括 el， data， methods
  this.$el = document.querySelector(options.el) // el 是 #app, this.$el 是 id 为 app 的 Element元素
  this.$data = options.data // this.$data = {number: 0}
  this.$methods = options.methods // 绑定的方法
  this._binding = {}; //_binding保存着model与view的映射关系，也就是我们前面定义的Watcher的实例。当model改变时，我们会触发其中的指令类更新，保证view也能实时更新

  this._obverse(this.$data)
  this._complie(this.$el)
}

MyVue.prototype._obverse = function (obj) { // obj = { number : 0}
  var _this = this;
  Object.keys(obj).forEach(function (key) {
    if (obj.hasOwnProperty(key)) {
      _this._binding[key] = {
        _directives: []
      };
      console.log(_this._binding[key])
      var value = obj[key];
      if (typeof value === 'object') {
        _this._obverse(value);
      }
      var binding = _this._binding[key];
      Object.defineProperty(_this.$data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
          console.log(`${key}获取${value}`);
          return value;
        },
        set: function (newVal) {
          console.log(`${key}更新${newVal}`);
          if (value !== newVal) {
            value = newVal;
            binding._directives.forEach(function (item) {
              item.update();
            })
          }
        }
      })
    }
  })

}

MyVue.prototype._complie = function (root) {
  // root 为 id 为 app 的 Element 元素，也就是我们的根元素
  var _this = this
  var nodes = root.children
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.children.length) {
      this._complie(node)
    }
    if (node.hasAttribute('v-click')) {
      node.onclick = (function () {
        var attrVal = nodes[i].getAttribute('v-click')
        return _this.$methods[attrVal].bind(_this.$data)
      })()
    }
    if (node.hasAttribute('v-model') && (node.tagName === 'INPUT') || node.tagName === 'TEXTAREA') {
      node.addEventListener('input', (function (key) {
        var attrVal = node.getAttribute('v-model')
        //_this._binding['number']._directives = [一个Watcher实例]
        // 其中Watcher.prototype.update = function () {
        //	node['vaule'] = _this.$data['number'];  这就将node的值保持与number一致
        // }

        _this._binding[attrVal]._directives.push(new Watcher('input', node, _this, attrVal, 'value'))

        return function () {
          _this.$data[attrVal] = nodes[key].value;
        }
      })(i))
    }
    if (node.hasAttribute('v-bind')) { // 如果有v-bind属性，我们只要使node的值及时更新为data中number的值即可
      var attrVal = node.getAttribute('v-bind');
      _this._binding[attrVal]._directives.push(new Watcher(
        'text',
        node,
        _this,
        attrVal,
        'innerHTML'
      ))
      console.log(_this._binding)
    }
  }
}

function Watcher(name, el, vm, exp, attr) {
  this.name = name; // 指令名称
  this.el = el; // 指令对应的 DOM 元素
  this.vm = vm; // 指令所属 MyVue 实力
  this.exp = exp; // 指令对应的值
  this.attr = attr; // 绑定的属性值

  this.update()
}

Watcher.prototype.update = function () {
  this.el[this.attr] = this.vm.$data[this.exp]
}

// https://juejin.im/post/5acc17cb51882555745a03f8