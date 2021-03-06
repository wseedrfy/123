var util = require("../../../../utils/util.js")
var app = getApp()
const args = wx.getStorageSync('args')
Page({
  data: {
    isChecked: true,
    ReplyChecked:true,  // 新增-回复
    InputComment: " ",
    CommentList: [],
    ContentTime:0,      // 新增-回复
    showEdit: false,    // 控制评论区弹窗显示
    comEdit: false,     // 评论区复制/删除弹窗
    comReply:false,
    CardID:"",
    ShowDelCom: 0,      // 评论区控制是否出现“删除”按钮
    Commentindex: 0,    // 评论区的 index
    Commentindex222:0,
    ShowReplyComment:0,
    ReplyCom_input:"",
    obtainIndex:0,
    iconUrl: '',
    Starurl: "../../../../images/zan1.png",
    Star_count: 0,
  },
  
  More: function () {
    var showEdit = this.data.showEdit
    var that = this

    if (showEdit) {
      this.setData({
        edit_style: "edit_hide"
      })
      setTimeout(() => {
        that.setData({
          showEdit: !showEdit
        })
      }, 200);
    } else {
      this.setData({
        edit_style: "edit_show",
        showEdit: !showEdit
      })
    }
  },
  EditComment: function (e) {              // 12-27 重构本函数
    let index = e.currentTarget.dataset.index;
    this.data.Commentindex = index;
    let edit_style = this.data.edit_style;
    // picker动画样式
    if(edit_style == undefined || edit_style == 'edit_hide') {
      edit_style = 'edit_show'
    }else {
      edit_style = 'edit_hide'
    }
    console.log(edit_style);
    this.setData({ comEdit:!this.data.comEdit,edit_style:edit_style})
    
    // 在点其他位置时，index = undefined
    if(index != undefined) {
      let nickName = this.data.CommentList[index].nickName;  // 该评论的评论者
      let username = this.data.CommentList[index].username;  // 该评论的评论者学号
      let ShowDelCom = 0;
      // 判断是否本人的评论 -> 凭学号
      if(username == args.username) {
        ShowDelCom = 1;
      }
      this.setData({
        ShowDelCom,
        CommentName:nickName,
        CommentContent:this.data.CommentList[index].InputComment
      })
    }
    // this.data.ShowDelCom = 0;    //初始化
  },
  //删除评论
  DelComment: function () {
    var index = this.data.Commentindex
    var that = this
    const content = this.data.content;
    let character = {
      userName: args.username,
      iconUrl: args.iconUrl,
      nickName: args.nickName
    }
    let be_character = {
      iconUrl: content.iconUrl,
      nickName: content.nickName
    }
    let InputComment = this.data.CommentList[index].InputComment; 

    let changeStatusTime = new Date().getTime();
    wx.showModal({
      title: '提示',
      content: '确定删除?',
      success(res) {
        console.log(that.data.CardID)
        that.setData({
          ShowDelCom:0
        })
        if (res.confirm) {
          console.log('用户点击确定')
          that.data.CommentList.splice(index, 1)
          // console.log("that.data.CommentList", that.data.CommentList)
          // console.log(that.data.content._id);
          wx.cloud.callFunction({
            name: 'CampusCircle',
            data: {
              type: 'delComment',
              username : that.data.username,
              _id: that.data.content._id,
              CommentList: that.data.CommentList
            },
            success: res => {
              // 12-27 新增,修改评论状态
              wx.cloud.callFunction({
                name:'CampusCircle',
                data: {
                  type: 'CancelCommentControlLogs',
                  character: character,
                  username : that.data.username,
                  be_character: be_character,
                  be_username: that.data.content.username,
                  content: InputComment,
                  createTime: changeStatusTime,
                  arcticle: content,
                  arcticle_id: content._id,
                  _id: that.data.content._id
                }
              }),
              
              console.log("success")
              that.ShowComment()
              that.setData({
                comEdit: !that.data.comEdit
              })
            },
            fail: err => {
              console.error
              that.setData({
                comEdit: !that.data.comEdit
              })
            },
          })
          console.log();
          
        } else if (res.cancel) {
          console.log('用户点击取消')
          that.setData({
            ShowDelCom:1
          })
        }
      }
    })
  },

  CopyComment: function () {
    wx.setClipboardData({
      //准备复制的数据
      data: this.data.CommentContent,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
    this.setData({
      comEdit: !this.data.comEdit
    })
  },
  //删除
  DelCard: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定删除?',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name: 'CampusCircle',
            data: {
              _id: that.data.CardID,
              username : that.data.username,
              type: 'delCard'
            },
            success: res => {
              console.log("success")
              that.setData({
                showEdit: !that.data.showEdit
              })
              let pages = getCurrentPages(); //获取小程序页面栈
              let beforePage = pages[pages.length - 2]; //获取上个页面的实例对象
              console.log("beforePage", beforePage)
              let beforePage_ = pages[pages.length - 3]; //获取上个页面的实例对象
              console.log("beforePage", beforePage_)
              beforePage.onLoad();
              beforePage_.onPullDownRefresh()
              wx.navigateBack({
                delta: 1,
              })
            },
            fail: err => {
              console.error
              that.setData({
                showEdit: !that.data.showEdit
              })
            },
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  Comment_Inputting: function () {
    this.setData({
      isChecked: false,
    })
  },
  // 评论内容判空 返回布尔值：false -> 非空; true -> 空/全是空格
  isNull( str ){
    if ( str == "" ) return true ;
    var regu = "^[ ]+$" ;
    var re = new RegExp(regu);
    return re.test(str);
  },
  formSubmit: function (e) { //添加与存储
    var that = this;
    // 判空
    let res = this.isNull(e.detail.value.InputComment);
    if( res ) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
    } else {
      let add = {
        "InputComment": e.detail.value.InputComment,
        "CommentTime": new Date().getTime(),
        "iconUser": args.iconUrl,  
        "nickName": args.nickName,
        "username": args.username
      }
      wx.showLoading({
        title: '发送中',
        mask: true
      })
      this.data.CommentList.push(add)
      wx.cloud.callFunction({
        name: 'CampusCircle',
        data: {
          CommentList: that.data.CommentList,
          username : that.data.username,
          Time: that.data.content.Time,
          _id: that.data.content._id,
          type: 'writeComment'
        },
        success: res => {
          wx.hideLoading()
          console.log("成功添加",res);
          that.ShowComment()
        },
        fail: err => {
          wx.showToast({
            title: '请求失败',
            icon: 'none',
          })
          console.error
        }
      })
      this.setData({
        Input: ""
      })
      // 12-27新增：将评论以记录形式上传
      // 处理得到评论者信息
      let character = {
        userName:args.username,
        iconUrl:args.iconUrl,
        nickName:args.nickName
      }
      // 被评论者信息
      let be_character = {
        userName:this.data.content.username,    
        iconUrl:this.data.content.iconUrl,
        nickName:this.data.content.nickName
      }
      // 评论时间 
      let commentTime = new Date().getTime();
      // 如果想在后台看到具体的时间年月日，请用下面这句
      // let starTime = util.timeago(new Date().getTime(),'Y年M月D日');

      // 云函数增加一条评论记录
      wx.cloud.callFunction({
        name: "CampusCircle",
        data: {
          type: "CommentControlLogs",
          character: character,
          be_character:be_character,
          username : that.data.username,
          be_username: that.data.content.username,
          content: e.detail.value.InputComment,
          createTime:commentTime,
          arcticle:this.data.content,
          arcticle_id:this.data.content._id,
          _id: this.data.content._id
        },
        success(res) { console.log(res,"调用评论云函数成功"); },
        fail(e) { 
          wx.showToast({
            title: '评论失败',
            icon: 'none'
          }) 
          console.log(e,"评论失败");
        }
      })
    }
  },
  ShowComment: function () {
    var Show = []
    let length = this.data.CommentList.length
    var copyList = JSON.parse(JSON.stringify(this.data.CommentList))
    for (let i = 0; i < this.data.CommentList.length; i++) {
      if (copyList[i].replyList) {
        var replylen = copyList[i].replyList.length
      }
      var PreTime = this.data.CommentList[i].CommentTime
      console.log("PreTime", PreTime)
      var AftTime = util.timeago(PreTime, 'Y年M月D日')
      for (let j = 0; j < replylen; j++) {
        var PreTime2 = copyList[i].replyList[j].ReplyTime
        console.log("PreTime2", PreTime2)
        var AftTime2 = util.timeago(PreTime2, 'Y年M月D日')
        copyList[i].replyList[j].ReplyTime = AftTime2
      }
      // console.log(content);
      Show.push({
        InputContent: this.data.CommentList[i].InputComment,
        InputTime: AftTime,
        iconUser: this.data.CommentList[i].iconUser,
        nickName: this.data.CommentList[i].nickName,
        username:this.data.CommentList[i].username,
        replyList: copyList[i].replyList
      })
    }

    app.globalData.allList.forEach(e => {
      if(e){
        if (e._id === this.data.CardID) {
          console.log(233)
          e.CommentList = this.data.CommentList
        }
      }
    })
    this.setData({
      ShowList: Show,
      CommentNum: length,
    })
  },

  ShowImg: function (e) {
    var Photo = this.data.content.AllPhoto
    var index = e.target.dataset.index
    wx.previewImage({
      current: Photo[index],
      urls: Photo,
    })
  },
  onLoad: function (options) {
    var that = this;
    var content = JSON.parse(options.content)  // 将JSON帖子信息转成对象
    var more=0
    that.setData({ content })
    console.log(content,"options");
    // 被评论者信息
    if(args.iconUrl===content.iconUrl && args.nickName===content.nickName && args.username===content.username){
      more=1
      console.log("match")
    }
    //var more = options.del  //--------------不理解为啥要改。改成了（371-376）,识别发布者是不是“我”,是就弹出“编辑”icon
    var Time = util.timeago(that.data.content.Time, 'Y年M月D日')
    that.data.username = args.username
    var openusername = {
      username:args.username,
      iconUrl:args.iconUrl,
      nickName:args.nickName
    }
    this.data.Star = content.Star
    this.data.ContentTime = content.Time
    this.data.CardID = content._id
    wx.cloud.callFunction({
      name: 'CampusCircle',
      data: {
        username : that.data.username,
        Time: content.Time,
        _id: content._id,
        type: 'readComment'
      },
      complete: res => {
        // this.data.Star = res
        this.data.CommentList = res.result.data[0].CommentList
        this.data.Star_User = res.result.data[0].Star_User
        this.data.Star_count = res.result.data[0].Star_count
        if (this.data.CommentList) {
          this.setData({
            content: content
          })
          this.ShowComment()
        } else {
          this.data.CommentList = []
          content.CommentList = []
          this.setData({
            CommentNum: 0,
            content: content
          })
          console.log("我得到content了",this.data.content);
        }
      }
    });

    // 判空
    if (content.Star_User == undefined || !content.Star_User) {
      content.Star_User = []
      that.setData({
        content: content,
        openusername:openusername
      })
    }
    this.setData({
      iconUrl: args.iconUrl,
      openusername:openusername
    })
    for(var i = 0;i<content.Star_User.length;i++){
      if(content.Star_User[i].username===openusername.username){
        that.setData({
          Starurl: "../../../../images/zan.png",
        })
      }
    }
    this.setData({
      Time: Time,
      more: more,
    })
    console.log(content)
  },
  //点赞
  get_Star() {
    
    var Star_User = this.data.content.Star_User
    var openusername = this.data.openusername

    let character = {                            // 处理得到点赞者信息
      userName:args.username,
      iconUrl:args.iconUrl,
      nickName:args.nickName
    }
    let be_character = {                         // 被点赞者信息
      userName:this.data.content.username,       // 学号来查找
      iconUrl:this.data.content.iconUrl,
      nickName:this.data.content.nickName
    }
    let starTime = new Date().getTime();          // 点赞时间
    // 如果想在后台看到具体的时间年月日，请用下面这句
    // let starTime = util.timeago(new Date().getTime(),'Y年M月D日');
    if (!Star_User) {
      Star_User = []
    }
    var that = this
    var Starif = false
    //判断是不是为点赞过的username
    for (var i = 0 ;i<Star_User.length;i++){
      if(Star_User[i].username===openusername.username){
        Starif = true
        Star_User.splice(Star_User.indexOf(openusername), 1)
        that.setData({
        Starurl: "../../../../images/zan1.png",
      })
      wx.cloud.callFunction({   // 云函数更改点赞状态
        name: "CampusCircle",
        data: {
          type: "StarControlLogs",
          username : that.data.username,
          be_username: that.data.content.username,
          Time: that.data.content.Time,
          _id: that.data.content._id,
          Star: Star_count,
          Star_User: Star_User,
          // 上面三条为迎合旧点赞函数
          character: character,
          be_character:be_character,
          createTime:starTime,
          arcticle:this.data.content,
          arcticle_id:this.data.content._id
        },
        success(res) { console.log(res,"调用'取消点赞'云函数成功"); },
        fail(e) { 
          wx.showToast({
            title: '点赞失败',
            icon: 'none'
          }) 
          console.log(e,"点赞失败");
        }
      })
      }
    }
    if (!Starif) {
      //push到username
      openusername.Star_time = new Date().getTime()
      Star_User.push(openusername)
        wx.showToast({
          title: '点赞成功',
          icon: "none"
        })
        that.setData({
          Starurl: "../../../../images/zan.png",
        })
        var Star_count = Star_User.length
        wx.cloud.callFunction({
          name: "CampusCircle",
          data: {
            username : that.data.username,
            be_username: that.data.content.username,
            type: "StarControlLogs",
            Time: that.data.content.Time,
            Star: Star_count,
            Star_User: Star_User,
            // 为迎合新云函数
            character: character,
            be_character:be_character,
            createTime:starTime,
            arcticle:this.data.content,
            arcticle_id:this.data.content._id,
            _id:this.data.content._id
          },
          success(res) {
            console.log(res)
          }
        })
    }
    app.globalData.allList.forEach(e => {
      if(e){
        if (e._id === this.data.CardID) {
          e.Star =  Star_User.length
          e.Star_User = Star_User
        }
      }
    })

  },
  onShow: function () {
    this.ShowComment()
  },

})