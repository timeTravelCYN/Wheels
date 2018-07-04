  window.onload = function () {
    var app = new MyVue({
      el: '#app',
      data: {
        number: 0,
        count: 0,
      },
      methods: {
        increment: function () {
          this.number++;
        },
        incre: function () {
          this.count++;
        }
      }
    })
  }