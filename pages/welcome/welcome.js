var app = getApp();

const http_server = require("../../config.js").http_server;

Page({
  data: {

  },

  startme:function(){
    //TODO  for teset
    //app.globalData.friend = {};
    //app.globalData.friend.openId = "shaopeng"
    
    wx.navigateTo({
      url: '../password/password'
    })
  },

  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //请求服务器 该用户是否已经登陆过
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
  }
})
