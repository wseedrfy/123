const app = getApp();
const time = require("../../utils/time.js");
var startX, endX, startXCurri, endXCurri;
var moveFlag, moveFlagCurri = true;
var util = require("../../utils/util.js")

Page({

  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    lineHeight: getApp().globalData.lineHeight,
    rectHeight: getApp().globalData.rectHeight,
    curWeek: '第 ' + util.getweekString() + ' 周',
    colorArrays: ['#99CCFF',
      '#FFCC99',
      '#FFCCCC',
      '#CC6699',
      '#99CCCC',
      '#FF6666',
      '#CCCC66',
      '#66CC99',
      '#FF9966',
      '#66CCCC',
      '#6699CC',
      '#99CC99',
      '#669966',
      '#99CC99',
      '#99CCCC',
      '#66CCFF',
      '#CCCCFF',
      '#99CC66',
      '#CCCC99',
      '#FF9999',
    ],
    courseTime: [
      '8:00',
      '9:40',
      '10:00',
      '11:40',
      '14:30',
      '16:10',
      '16:20',
      '17:50',
      '19:40',
      '21:20',
      '22:05',
    ],
    whichWeek: '0',
    wlist: [],
    dayOfWeek: (new Date()).getDay(),
    // 添加课表
    showAdd: false,
    week: [], // 周数
    section: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    ],
    sectionIndex: [0, 0],

    Week: ["一", "二", "三", "四", "五", "六", "七"], // 星期 [1,2,3,4,5,6,7]
    WeekIndex: 0,
    addSubmitStyle: false,
    showscroll: false,
    curriculumAll: [],              // 用户添加/隐藏后，得到的课表
    curriFunc: [                   // 课表功能
      {text:"导入最新课程表",click:"importCurri"},
      {text:"手动添加课程",click:"feedbackHandler"},
      {text:"修改课程",click:"addCourseHandler"},
      {text:"分享课程表",click:"shareCurri"},
      {text:"自定义背景",click:"bgcCurri"},
      {text:"重置背景",click:"resetBgcCurri"}
    ],
    isAnimate: false,               // 控制动效
    // CSS中使用变量
    backgroundUrl: 'https://z3.ax1x.com/2021/08/14/fszRhT.jpg',
  },
  importCurri() {
    console.log('importCurri');
  },
  shareCurri() {
    console.log('shareCurri');
  },
  bgcCurri() {
    console.log('bgcCurri');
    let that = this;

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success(res) {
        
        console.log(res.tempFiles[0].tempFilePath);
        wx.saveFile({
          tempFilePath: res.tempFiles[0].tempFilePath,
          success(result){
            wx.showLoading({
              title: '处理中...',
            })
            // 重新渲染页面
            that.setData({
              backgroundUrl : result.savedFilePath
            })
            wx.setStorageSync('curriBgc',  result.savedFilePath)
            wx.hideLoading()
            // console.log(result.savedFilePath);
          },
          fail(error) {
            wx.showToast({
              title: '请求失败'+ error,
            })
          }
      })
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  resetBgcCurri() {
    try {
      wx.removeStorageSync('curriBgc')
    } catch (e){
      console.log(e);
    }
    this.setData({
      backgroundUrl: 'https://z3.ax1x.com/2021/08/14/fszRhT.jpg'
    })
    wx.showToast({
      title: '已重置背景',
      icon: 'none'
    })
  },
  showCurriculumPoint: function () {
    this.setData({
      showscroll: !this.data.showscroll,
      whichWeek: this.data.whichWeek
    })
  },

  onLoad: function (options) {
    var courseTime = wx.getStorageSync('args').courseTime;
    this.kb(util.getweekString());
    this.setData({
      weekNow: util.getweekString(),
      courseTime: courseTime? courseTime : that.data.courseTime,
    })

    console.log(this.data.backgroundUrl);
    // 从本地缓存获取backgroundUrl
    let fileUrl = wx.getStorageSync('curriBgc');
    let that = this;
    const getUrlFromLoad = (fileUrl) => {
      
      wx.getSavedFileList({
        success(res) {
          for(let i in res.fileList) {

            res.fileList[i].filePath == fileUrl ? that.setData({backgroundUrl:res.fileList[i].filePath}) : ''
          }
        }
      })
      console.log(that.data.backgroundUrl);
    }
    fileUrl ?  getUrlFromLoad(fileUrl) : ''
  },

  onShow: function (options) {

    app.loginState()
    this.kb(util.getweekString());
    this.initWeek()
    this.initWlistPoint()
  },

  onShareAppMessage: function (res) {
    return {
      title: 'WE校园',
    }
  },
  // 点击上面课表进行切换
  // clickWeek: function (e) {
  //   this.kb(this.data.whichWeek);
  //   this.setData({
  //     whichWeek: Number(e.currentTarget.id) + 1,
  //   })
  //   console.log(this.data.whichWeek)
  // },

  // 触摸开始事件
  touchStart: function (e) {
    startX = e.touches[0].pageX; // 获取触摸时的原点
    moveFlag = true;
  },
  // 触摸移动事件
  touchMove: function (e) {
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlag) {
      if (endX - startX > 50) {
        moveFlag = false;
        this.kb(this.data.whichWeek - 1);
      }
      if (startX - endX > 50) {
        moveFlag = false;
        this.kb(this.data.whichWeek + 1);
      }
    }
  },
    // 点击上面课表进行切换
    clickWeek: function (e) {
      // this.kb(this.data.whichWeek);
      this.setData({
        whichWeek: Number(e.currentTarget.id) + 1,
      })
      this.kb(this.data.whichWeek);
      console.log(this.data.whichWeek)
    },
  // 触摸结束事件
  touchEnd: function (e) {
    // this.kb(this.data.whichWeek);
    console.log(this.data.whichWeek)
    moveFlag = true; // 回复滑动事件
  },

  // 日期切换处理函数  返回时间格式 YYYY-MM-DD
  showDate(n) { 
    var date = new Date(wx.getStorageSync('configData').timeYear);
    date.setDate(date.getDate() + n);
    var month = date.getMonth() + 1
    var day = date.getDate()
    day = day > 9 ? day : "0" + day // 格式化日期
    date = "" + month + "/" + day;
    return [month,date];
  },

  // 显示当前周的课表
  kb: function (whichWeek) {
    var that = this;
    let args = wx.getStorageSync('args')
    // 处理上面日期
    whichWeek = whichWeek > 0 ? whichWeek : 1;
    var whichWeek_now = (Number(whichWeek) - 1) * 7;
    var arr = [];

    if (whichWeek > '20' || whichWeek < '1') {
      wx.showModal({
        showCancel: false,
        title: '提示',
        content: '超过范围'
      })
      return null;
    }
    
    for (var i = 0; i < 7; i++) {
      var [month, date] = this.showDate(whichWeek_now + i)
      arr.push(date);
      if(i == 6) this.setData({month})
    }
    // var personalInformation = wx.getStorageSync('personalInformation')
    // var curriculum = personalInformation.curriculum;
    var curriculum = this.changeCurriculum(args.addCurriculumLogs, args.ConcealCurriculumLogs);
    var wlist = [];
    var zc = 0;

    for (let i in curriculum) {
      zc = curriculum[i].zc;
      if (zc == whichWeek) {
        var kcmcc = curriculum[i].kcmc;
        if ((curriculum[i].kcmc + curriculum[i].jxcdmc).length > 20) {
          kcmcc = kcmcc.substring(0, 17 - curriculum[i].jxcdmc.length) + "...";
        }
        wlist.push({
          xqj: curriculum[i].xq,
          skjc: Number(curriculum[i].jcdm.substr(0, 2)),
          skcd: Number(curriculum[i].jcdm.substr(-2)) - Number(curriculum[i].jcdm.substr(0, 2)) + 1,
          kcmc: kcmcc,
          jxcdmc: curriculum[i].jxcdmc,
          teacher: curriculum[i].teaxms
        })
      }
    }
    // console.log(wlist,"初始wlist");

    that.setData({
      arr,
      whichWeek,
      multiIndex: [(Number(whichWeek) - 1), 0, 0, 0],
      wlist
    })

  },

  // 生成小绿点
  initWlistPoint(){
    var personalInformation = wx.getStorageSync('personalInformation')
    var curriculum = personalInformation.curriculum;
    //处理的绿色小点点
    var wlistPoint = new Array();
    for (var i = 0; i < 20; i++) { 
      wlistPoint[i] = new Array();
      for (var j = 0; j < 35; j++) {
        wlistPoint[i][j] = null;
      }
    }
    for (let i in curriculum) {
      var zc = curriculum[i].zc;
      // console.log(curriculum[i].jcdm);
      if(curriculum[i].jcdm) {
        let bright_skjc = Number(curriculum[i].jcdm.substr(0, 2)) + 1
        wlistPoint[zc-1][((bright_skjc / 2 - 1) * 7 + Number(curriculum[i].xq)) - 1] = 1
      }
    }
    this.setData({
      wlistPoint
    })
  },

  // 点击时显示toast
  showCardView: function (e) {
    wx.showToast({
      title: '教师:' + this.data.wlist[e.currentTarget.dataset.index].teacher + "\n" +
        '地点:' + this.data.wlist[e.currentTarget.dataset.index].jxcdmc,
      icon: 'none',
    })
  },

  // 跳转至 - 课表管理
  addCourseHandler: function (e) {
    wx.navigateTo({
      url: 'addcurriculum/addcurriculum'
    })
  },
  // 弹出 - 课表添加
  feedbackHandler: function (e) {
    var showAdd = this.data.showAdd
    var that = this
    if (showAdd) {
      this.setData({
        add_style: "add_hide"
      })
      setTimeout(() => {
        that.setData({
          showAdd: !showAdd
        })
      }, 200);
    } else {
      this.setData({
        add_style: "add_show",
        showAdd: !showAdd
      })
    }
  },
  ggggg(){
    console.log("111111");
  },
  // 弹出 - 设置页面
  seetingHandler: function (e) {
    console.log("已点击设置按钮");
    // 封装 timetable 和 curriLeft 的动画
    const animationFunc = (px,scale,opacity) => {
      
      var timetableAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        delay: 50,
      }).translateX(px).scale(scale).opacity(1).step().export();
      this.setData({timetableAnimation})

      var curriLeft = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        delay: 50,
      }).translateX(px).opacity(opacity).step().export();
      this.setData({
        curriLeft,
        isAnimate: !this.data.isAnimate
      })
      console.log(this.data.isAnimate);
      // this.data.isAnimate = !this.data.isAnimate;     // 更新 isAnimate 状态
    }
    this.data.isAnimate ? animationFunc(0,1,0) : animationFunc(250,0.9,1)
  },
  // 触摸开始事件
  touchStartCurri: function (e) {
    startXCurri = e.touches[0].pageX; // 获取触摸时的原点
    moveFlagCurri = true;
  },
  // 触摸移动事件
  touchMoveCurri: function (e) {
    endXCurri = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlagCurri) {
      if (startXCurri - endXCurri > 5) {
        moveFlagCurri = false;
        this.seetingHandler();
      }
    }
  },
  // 触摸结束事件
  touchEndCurri: function (e) {
    moveFlagCurri = true; // 回复滑动事件
  },


  // 添加课表

  initWeek() {
    // 初始化"设置周数"
    var week = [];
    for (var i = 0; i < 18; i++) {
      week.push([false, false]) //week.push([false, 'color:gary'])
    }
    this.setData({
      week: week
    })
  },
  // 设置 课程、地点、老师、星期选择器、课程选择器
  setCPT(e) {
    this.setData({
      [e.target.id]: e.detail.value
    })
    this.checkSubmit()
  },
  // 节数选择器
  ChangeSectionIndex(e) {
    var index = this.data.sectionIndex
    //修改第一列
    if (e.detail.column == 0) {
      index[e.detail.column] = e.detail.value
      if (e.detail.value > index[1]) { //选择后，第一列>第二列
        index[1] = e.detail.value
      }
    }
    //修改第二列
    else {
      if (e.detail.value < index[0]) //选择后，第二列<第一列
        wx.showToast({
          title: '注意选择格式',
          icon: "none"
        })
      else
        index[e.detail.column] = e.detail.value
    }
    this.setData({
      sectionIndex: index
    })
    this.checkSubmit()
  },
  // 周数选择按钮
  changeWB(e) {
    let data = this.data.week
    if (data[e.target.id - 1][0]) {
      data[e.target.id - 1][0] = false
      data[e.target.id - 1][1] = false // 'color: rgb(100, 100, 100);'
    } else {
      data[e.target.id - 1][0] = true
      data[e.target.id - 1][1] = true // "background:rgb(8, 178, 255);color:rgb(245,245,245);border:none;"
    }

    this.setData({
      week: data
    })
    this.checkSubmit()
  },
  // 新增课程按钮
  addSubmit(e) {
    let that = this;
    let args = wx.getStorageSync('args');
      
    // args
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    var week = []
    for (var i = 0; i < 18; i++) {
      if (this.data.week[i][0])
        week.push(i + 1)
    }
    // 检查填写是否为空
    if (this.data.course == null || this.data.course == "" || this.data.course == undefined) {
      this.showToast("课程名称不能为空")
    } else if (this.data.place == null || this.data.place == "" || this.data.place == undefined) {
      this.showToast("上课地点不能为空")
    } else if (this.data.teacher == null || this.data.teacher == "" || this.data.teacher == undefined) {
      this.showToast("任课老师不能为空")
    } else if (week == null || week == "" || week == undefined || week.length == 0) {
      this.showToast("请设置周数")
    } else {
      if (Number(this.data.sectionIndex[0] + 1) < 10) {
        var a = "0" + String(Number(this.data.sectionIndex[0] + 1))
      } else {
        var a = String(Number(this.data.sectionIndex[0] + 1))
      }
      if (Number(this.data.sectionIndex[1] + 1) < 10) {
        var b = "0" + String(Number(this.data.sectionIndex[1] + 1))
      } else {
        var b = String(Number(this.data.sectionIndex[1] + 1))
      }
      for (i = 0; i < week.length; i++) {
        var add = {
          'jcdm': a + b,
          'jxcdmc': this.data.place,
          'kcmc': this.data.course,
          'teaxms': this.data.teacher,
          'xq': time.formatDay(this.data.Week[this.data.WeekIndex]),
          'zc': String(week[i])
        }
        
        args.addCurriculumLogs.push(add)
      }
      // 更新本地缓存
      wx.setStorageSync('args', args);
      // console.log(args.addCurriculumLogs, 233);
      // 更新后台数据
      wx.cloud.callFunction({
        name: "curriculum",
        data: {
          type: "addCurriculumLogs",
          username: args.username,
          nickName: args.nickName,
          addCurriculumLogs: args.addCurriculumLogs,
        },
        success: res => {
          console.log(res);
          wx.showToast({
            title: '添加成功',
            icon: 'none',
          })
          that.onShow()
        },
        fail: err => {
          wx.showToast({
            title: '添加失败(校园网关闭或者服务器异常)',
            icon: 'none',
          })
        },
        complete() {
          that.setData({
            showAdd: !that.data.showAdd
          })
        }
      })


    }
  },
  // 处理课表增删
  changeCurriculum: function (addCurriculum, deCurriculum) {
    // console.log("进入函数");
    let allCurriculum = wx.getStorageSync('personalInformation').curriculum;

    if(deCurriculum.length && allCurriculum.length) {
      for (var i = 0; i < deCurriculum.length; i++) {
        for (var g = 0; g < allCurriculum.length; g++) {
          if (deCurriculum[i].zc == "全部") {
            if (allCurriculum[g].kcmc == deCurriculum[i].kcmc) {
              allCurriculum.splice(g, 1);
              g--;
            }
          } else {
            if (allCurriculum[g].kcmc == deCurriculum[i].kcmc && allCurriculum[g].jcdm == deCurriculum[i].jcdm && allCurriculum[g].zc == deCurriculum[i].zc && allCurriculum[g].xq == deCurriculum[i].xq) {
              allCurriculum.splice(g, 1);
              g--;
            }
          }
        }
      }
    }
    
    for (var i = 0; i < addCurriculum.length; i++) {
      allCurriculum.push(addCurriculum[i]);
    }
    return allCurriculum;
  },
  checkSubmit() {
    var week = []
    for (var i = 0; i < 18; i++) {
      if (this.data.week[i][0])
        week.push(i + 1)
    }
    // 检查填写是否为空
    if (this.data.course == null || this.data.course == "" || this.data.course == undefined ||
      this.data.place == null || this.data.place == "" || this.data.place == undefined ||
      this.data.teacher == null || this.data.teacher == "" || this.data.teacher == undefined ||
      week == null || week == "" || week == undefined || week.length == 0
    ) {
      this.setData({
        addSubmitStyle: false
      })
    } else {
      this.setData({
        addSubmitStyle: true
      })
    }

  },
  showToast(msg) {
    wx.showToast({
      title: msg,
      icon: "none"
    })
  }
})