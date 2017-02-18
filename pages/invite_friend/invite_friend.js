var app = getApp()
const http_server = require("../../config.js").http_server;

var isFirst = true;
var redirectToWelcome = false;



Page({
  data: {
    invite: true
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
    if(data && data.openId){
      console.log("invite_friend page, data = " + data.openId);
      this.setData({invite: false})
      app.globalData.friend = data;
      app.getUserInfo(function(userInfo){
        //更新数据
        wx.request({
          url: http_server + '/weixin/check_user_info',
          data: {encryptedData: app.globalData.encryptedData, iv: app.globalData.iv, code: app.globalData.code, nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            app.globalData.isFirst = res.data.data.isFirst;
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.sessionId = res.data.data.sessionId;
            
            if(app.globalData.isFirst) {
              wx.clearStorageSync();
            }
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
      })
    }else if(data && data.inviteFriend){
      this.setData({invite: true}) 
    }else{
      redirectToWelcome = true;
      
    }
  },
  onShow: function(){
    if(redirectToWelcome) {
        wx.redirectTo({
          url: '../welcome/welcome'
        })
    }
  },
  onShareAppMessage: function () {
        app.globalData.hasInvite = true;
        
        return {
            title: '朋友蜜语',
            desc: '加入朋友密码',
            path: '/pages/invite_friend/invite_friend?openId=' + app.globalData.userInfo.openId
        }
   },
   acceptInvite: function() {
       if(app.globalData.isLogin){
          app.addInvitorToFriend();
       }else{
         wx.navigateTo({
           url: '../password/password?needAddFriend=true'
         })
       }
       
   }

})
