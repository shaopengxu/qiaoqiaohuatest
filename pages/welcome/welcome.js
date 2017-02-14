//index.js
//获取应用实例
var app = getApp();

const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;





Page({
  data: {

  },

  startme:function(){
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
        data: {encryptedData: userInfo.encryptedData, iv: userInfo.iv, code: userInfo.code, nickName: userInfo.nickName,
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
