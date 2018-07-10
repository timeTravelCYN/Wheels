const webdriver = require('selenium-webdriver')
const fs = require('fs');
const getPixels = require('get-pixels')
const _ = require('lodash');
!async function () {

  // 新建一个 firefox 的 driver 实例
  let driver = await new webdriver.Builder().forBrowser('firefox').build()

  // 访问极验demo页

  await driver.get('http://www.geetest.com/type/')
  await wasteTime()
  await driver.findElement(webdriver.By.css('.products-content li:nth-child(2)')).click()
  await wasteTime(2000)
  await driver.findElement(webdriver.By.css('.geetest_radar_tip')).click()
  console.log('success')
  // 隐藏原图再截图
  await wasteTime(2000)
  await driver.executeScript(`document.querySelector('.geetest_canvas_fullbg').style.display = 'none'`)

  // 找到验证码背景图元素, 是一个 canvas
  await wasteTime(2000)
  const bgCanvas = await driver.findElement(webdriver.By.css('.geetest_canvas_bg'))
  await driver.executeScript(`scroll(0, 0)`)
  // 获得一个 base64 格式的 png 截图
  await wasteTime()
  const bgPng = await bgCanvas.takeScreenshot()
  await wasteTime(1300)
  await fs.writeFile(`out.png`, bgPng.replace(/^data:image\/png;base64,/, ""), 'base64', function (err) {
    if (err) console.log(err);
  });
  await wasteTime(1400)
  const point = await findRightPoint()

  function findRightPoint() {
    return new Promise((resolve, reject) => {
      getPixels('out.png', 'image/png', function (err, pixels) {
        if (err) {
          console.log('bad image path')
          return reject(err)
        }
        let shape = pixels.shape.slice()
        let width = shape[0]
        let height = shape[1]
        for (let x = 60; x < width; x++) {
          for (let y = 0; y < height; y++) {
            let r = pixels.get(x, y, 0)
            let g = pixels.get(x, y, 1)
            let b = pixels.get(x, y, 2)
            if (r + g + b <= 118) {
              return resolve({
                x,
                y
              })
            }
          }
        }
        resolve(null)
      })
    })
  }

  wasteTime(2000)
  // 获取拼图滑块按钮
  const button = await driver.findElement(webdriver.By.css('.geetest_slider_button'))

  // 获取按钮位置等信息
  const buttonRect = await button.getRect()
  const x = parseInt(buttonRect.x);
  const y = parseInt(buttonRect.y);
  // 初始化 action
  let actions = driver.actions({
    async: true
  })
  actions = actions.move({
    x: x + 10,
    y: y + 10,
    duration: 100
  }).press()
  const count = 30 // 小编分成30步进行滑动
  const steps = getSteps(point.x, count)
  const totalDuration = 8000 // 一共耗时8秒, 慢才能充实轨迹~

  _.reduce(steps, (actions, step) => {
    return actions.move({
      x: x + 10 + step,
      y: y + 10 + _.random(-5, 40), // 加上y轴随机数
      duration: parseInt(_.random(totalDuration / count / 2, totalDuration / count * 2)) // 加上时长随机数
    })
  }, actions)

  await actions.move({
    x: x + point.x,
    y: y + 10,
    duration: 1000
  }).release().perform()

  // 随机拆成n份
  function getRandomDistribution(total, count) {
    let item = total / count
    item = item + _.random(-item * 2, item * 3)
    item = parseInt(item)
    if (count === 1) {
      return [total]
    } else {
      return [item].concat(getRandomDistribution(total - item, count - 1))
    }
  }

  // 获取每次滑动的X坐标
  function getSteps(total, count) {
    let distribution = getRandomDistribution(total, count)
    return _.map(distribution, (item, i) => {
      return _.sum(distribution.slice(0, i + 1))
    })
  }
}()

const wasteTime = (time = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('resolve')
      resolve()
    }, time);
  })
}