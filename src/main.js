// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI, {size: 'small'})

// 深克隆
Vue.prototype.$deepClone = function (value) {
  /**
   * 判断是否是基本数据类型
   * @param value
   */
  function isPrimitive(value) {
    return (typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'symbol' ||
      typeof value === 'boolean')
  }

  /**
   * 判断是否是一个js对象
   * @param value
   */
  function isObject(value) {
    return typeof value === "object"
  }

  // 记录被拷贝的值，避免循环引用的出现
  var memo = [];

  function baseClone(value) {
    var res;
    // 如果是基本数据类型，则直接返回
    if (isPrimitive(value)) {
      return value;
      // 如果是引用数据类型，我们浅拷贝一个新值来代替原来的值
    } else if (value instanceof Date) {
      return new Date(value)
    } else if (Array.isArray(value)) {
      res = [].concat(value);
    } else if (isObject(value)) {
      res = Object.assign({}, value);
    }

    // 检测我们浅拷贝的这个对象的属性值有没有是引用数据类型。如果是，则递归拷贝
    for (var key in res) {
      if (res.hasOwnProperty(key)) {
        if (typeof res[key] === "object" && res[key] !== null) {
          //此处我们用memo来记录已经被拷贝过的引用地址。以此来解决循环引用的问题
          if (memo.indexOf(res[key]) > -1) {
            res[key] = memo[memo.indexOf(res[key])];
          } else {
            memo.push(res[key]);
            res[key] = baseClone(res[key])
          }
        }
      }
    }
    return res;
  }

  return baseClone(value)
}

/* eslint-disable no-new */
new Vue({
    el: '#app',
    components: {App},
    template: '<App/>'
})
