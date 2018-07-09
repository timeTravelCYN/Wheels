const webdriver = require('selenium-webdriver')
const fs = require('fs');
!async function () {

  // 新建一个 firefox 的 driver 实例
  let driver = await new webdriver.Builder().forBrowser('firefox').build()

  // 访问极验demo页

  await driver.get('http://www.geetest.com/type/')
  await wasteTime()
  await driver.findElement(webdriver.By.css('.products-content li:nth-child(2)')).click()
  await wasteTime()
  await driver.findElement(webdriver.By.css('.geetest_radar_tip')).click()
  console.log('success')
  // 隐藏原图再截图
  await wasteTime()
  await driver.executeScript(`document.querySelector('.geetest_canvas_fullbg').style.display = 'none'`)

  // 找到验证码背景图元素, 是一个 canvas
  await wasteTime(2000)
  const bgCanvas = await driver.findElement(webdriver.By.css('.geetest_canvas_bg'))
  await driver.executeScript(`scroll(0, 0)`)
  // 获得一个 base64 格式的 png 截图
  await wasteTime()
  const bgPng = await bgCanvas.takeScreenshot().then(function (data) {
    var base64Data = data.replace(/^data:image\/png;base64,/, "")
    fs.writeFile(`${new Date().getTime()}.png`, base64Data, 'base64', function (err) {
      if (err) console.log(err);
    });
  })
}()

const wasteTime = (time = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('resolve')
      resolve()
    }, time);
  })
}