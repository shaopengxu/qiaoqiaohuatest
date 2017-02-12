var app = getApp()
const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;

var friend = null;
var isFirst = true;

/**
 * 邀请好友
 */
function addInvitorToFriend(){
  if(friend){
    wx.request({
      url: http_server + '/weixin/add_friend',
      data: {friendOpenId: friend.openId, sessionId: app.globalData.sessionId},
      method: 'GET',
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
        wx.redirectTo({
          url: '../index/index'
        })
      }
    })
  }
}

Page({
  data: {
    hideps: "hideps"
  },

  startme:function(){
    this.setData({hideps:""})
  },
  /**
   * 输入密码
   */
  inputPassword:function(event) {
    
    if(event.detail.value.length == 4) {
      console.log("input password: " + event.detail.value + " , isFirst " + isFirst);
      
      if(isFirst) {
        // 注册用户
        wx.request({
          url: http_server + '/weixin/register',
          data: {password: event.detail.value, sessionId: app.globalData.sessionId},
          method: 'GET', 
          success: function(res) {
            app.globalData.isLogin = true;
            addInvitorToFriend();
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })

      }else{
        wx.request({
          url: http_server + '/weixin/login',
          data: {password: event.detail.value, sessionId: app.globalData.sessionId},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            //TODO 判断是否登录成功
            app.globalData.isLogin = true;
            addInvitorToFriend();
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
      }
    }
  },

  onLoad: function (data) {
    console.log("invite_friend page, data = " + data.openId);
    var that = this
    friend = data;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
      app.globalData.userInfo = userInfo;
      wx.request({
          url: http_server + '/weixin/check_user_info',
          data: {encryptedData: userInfo.encryptedData, iv: userInfo.iv, code: userInfo.code, nickName: userInfo.nickName,
             avatarUrl: userInfo.avatarUrl},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          success: function(res){
            isFirst = res.data.data.isFirst;
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.sessionId = res.data.data.sessionId;
            
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
    })
  },
  onShareAppMessage: function () {
        return {
            title: '邀请聊天',
            desc: '加入私密聊天',
            path: 'pages/invite_friend/invite_friend?openId=' + app.globalData.userInfo.openId
        }
   },
   acceptInvite: function() {
       this.setData({hideps:""})
   }

})
