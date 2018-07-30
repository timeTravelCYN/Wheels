// 工厂模式
//  将 new 操作单独封装
//  遇到 new 时，考虑是否该用工厂模式
// 创建的实例其实并不知道构造函数是哪个，不用关心构造函数，不用关心构造函数有什么变化
class Product {
  constructor (name) {
    this.name = name
  }
  init () {
    alert('init')
  }
  fun1 () {

  }
  fun2 () {

  }
}

class Creator {
  create(name) {
    return new Product(name)
  }
}

let creator = new Creator()
let p = creator.create('p1')
p.init()
let p2 = creator.create('p2')
p.init()
/**
 * 构造函数和创建者分离
 * 符合开放封闭原则
 */