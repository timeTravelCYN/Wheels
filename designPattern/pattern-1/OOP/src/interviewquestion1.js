class Camera {
  shot(car) {
    return {
      num: car.num,
      inTime: Date.now()
    }
  }
}
// 显示屏
class Screen {
  show(car, inTime) {
    console.log('车牌号', car.num)
    console.log('停车时间', Date.now() - inTime)
  }
}

// 停车场

class Park {
  constructor(floors) {
      this.floors = floors || []
      this.camera = new Camera()
      this.screen = new Screen()
      this.carList = {} //摄像头拍摄返回的车辆信息
    }

    in (car) {
      // 通过摄像头获取信息
      const info = this.camera.shot(car)
      // 听到某个停车位
      const i = parseInt(Math.random() * 100 % 100)
      const place = this.floors[0].places[i]
      place.in()
      info.place = place
      // 记录信息
      this.carList[car.num] = info
    }

  out(car) {
    const info = this.carList[car.num]
    const place = info.place
    place.out()
    this.screen.show(car, info.inTime)
    delete this.carList[car.num]
  }
  emptyNum() {
    return this.floors.map(floor => {
      return `${floor.index} 层 haiyou  ${floor.emptyPlaceNum()}个空闲车位`
    }).join('\n')
  }
}

// 车
class Car {
  constructor(num) {
    this.num = num
  }
}
// 层
class Floor {
  constructor(index, places) {
    this.index = index
    this.places = places || []
  }

  emptyPlaceNum() {
    let num = 0
    this.places.forEach(p => {
      if (p.empty) {
        num = num + 1
      }
    })
    return num
  }
}
// 车位
class Place {
  constructor() {
      this.empty = true
    }

    in () {
      this.empty = false
    }
  out() {
    this.empty = true
  }
}

// 测试----------
const floors = []
for (let i = 0; i < 3; i++) {
  const places = []
  for (let j = 0; j < 100; j++) {
    places[j] = new Place()
  }
  floors[i] = new Floor(i + 1, places)
}

const park = new Park(floors)

const car1 = new Car('100')
const car2 = new Car('200')

console.log('第一辆车进入')
console.log(park.emptyNum())
park.in(car1)
console.log('第2辆车进入')
console.log(park.emptyNum())
park.in(car2)
console.log('第一辆车离开')
park.out(car1)