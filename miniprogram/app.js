// app.js
import {
  runInContext
} from './utils/evil-eval.min.js';
const api = require('./utils/api')
const util = require("./utils/util.js")
App({
  // 登录昨天判断
  loginState: function(){
    let username = wx.getStorageSync('args').username
    if(!username){
      wx.showModal({
        title: '登录提示',
        showCancel: false, //是否显示取消按钮
        content: "是否要登录",
        cancelText: "否", //默认是“取消”
        // cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "是", //默认是“确定”
        // confirmColor: 'red', //确定文字的颜色
        success: function (res) {
          if (!res.cancel) {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          } else {
            wx.navigateBack({
            })
          }
        },
        fail: function (res) {}, //接口调用失败的回调函数
        complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
      })
    }
  },

  // js本地运行
  jsRun(args, code) {
    const sandbox = {
      wx,
      util,
      api,
      args,
      app: getApp()
    };
    const runCode = runInContext(code, sandbox);
    return runCode
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    let rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    // 获取设备信息
    wx.getSystemInfo({
      success: res => {
        // 胶囊高度
        this.globalData.rectHeight = rect.height;
        // 获取屏幕宽度
        let windowWidth = res.windowWidth;
        // 获取状态栏的高度
        let statusBarHeight = res.statusBarHeight;
        this.globalData.statusBarHeight = statusBarHeight;
        // 根据胶囊的位置计算文字的行高以及距离状态栏文本的位置
        let lineHeight = (rect.top - statusBarHeight) * 2 + rect.height;
        this.globalData.lineHeight = lineHeight;
        // 根据胶囊的位置计算距离右侧的宽度，用于设置返回按钮至左侧的距离
        let leftDistance = windowWidth - rect.right;
        this.globalData.leftDistance = leftDistance;
      },
      fail: erro => {
        console.log(res)
      }

    })

  },
  globalData: {
    userInfo: null,
    Comment:[],
    // func: {}
  }
})