let EventEmitter = require('./EventEmitter')

let girl = new EventEmitter();
let drink = function (data) {
  console.log(data);
  console.log('喝酒');
};
let findboy = function () {
  console.log('交友');
};

girl.on('newListener', function (eventName) {
  // console.log('名称： ' + eventName);
});
girl.on('结婚', findboy);
girl.setMaxListeners(3);
console.log(girl.getMaxListeners());
girl.once('失恋', drink); // {'失恋': [drink]}
// girl.once('失恋', drink); // {'失恋': [drink]}
girl.prependListener('失恋', function (data) {
  console.log(data)
  console.log('before');
});
// girl.once('失恋', drink); // {'失恋': [drink]}
girl.emit('失恋', '1');
girl.emit('失恋', '1');
girl.emit('结婚', '1');
