function EventEmitter () {
  // 不继承原型链的东西，无杂质
  this._events = Object.create(null)

}

// 默认最多的绑定次数
EventEmitter.defaultMaxListeners = 10;
// 同 on 方法
EventEmitter.prototype.addListener = EventEmitter.prototype.on
// 返回监听的事件名
EventEmitter.prototype.eventNames = function () {
  return Object.keys(this._events)
}

// 设置最大监听数
EventEmitter.prototype.setMaxListeners = function (n) {
  this._count = n;
}

// 返回监听数
EventEmitter.prototype.getMaxListeners = function () {
  return this._count ? this._count : this.defaultMaxListeners;
}

// 监听
EventEmitter.prototype.on = function (type, cb, flag) {
  // 默认值，如果没有_events的话，就给它创建一个
  if (!this._events) {
    this._events = Object.create(null)
  }

  // 不是newListener 就应该让 newListener 执行一下
  if (type !== 'newListener') {
    this._events['newListener'] && this._events['newListener'].forEach(listener => {
      listener(type)
    })
  }

  if (this._events[type]) {
    // 根据传入的flag 来决定是向前还是向后添加
    if (flag) {
      this._events[type].unshift(cb)
    } else {
      this._events[type].push(cb)
    }
  } else {
    this._events[type] = [cb]
  }

  // 监听的事件不能超过了设置的最大监听数
  if (this._events[type].length === this.getMaxListeners()) {
    console.warn('警告哦~')
  }
}

// 向前添加
EventEmitter.prototype.prependListener = function (type, cb) {
  this.on(type, cb, true)
}
EventEmitter.prototype.prependOnceListener = function (type, cb) {
  this.once(type, cb, true);
};
// 监听一次
EventEmitter.prototype.once = function (type, cb, flag) {
  // 先绑定，调用后删除
  function wrap () {
    cb(...arguments)
    this.removeListener(type, wrap)
  }
  wrap.listen = cb;
  this.on(type, wrap, flag)
}
// 删除监听类型
EventEmitter.prototype.removeListener = function (type, cb) {
  if (this._events[type]) {
    this._events[type] = this._events[type].filter(listener => {
      return cb !== listener && cb !== listener.listen;
    });
  }
};
EventEmitter.prototype.removeAllListener = function () {
  this._events = Object.create(null);
};
// 返回所有的监听类型
EventEmitter.prototype.listeners = function (type) {
  return this._events[type];
};
// 发布
EventEmitter.prototype.emit = function (type, ...args) {
  if (this._events[type]) {
    this._events[type].forEach(listener => {
      console.log(listener)
      listener.call(this, ...args);
    });
  }
};

module.exports = EventEmitter;
