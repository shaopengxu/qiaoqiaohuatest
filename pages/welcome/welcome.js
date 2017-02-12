//index.js
//获取应用实例
var app = getApp();
var isFirst = false;
var openId = "";
var password = "";
var passwordConfirm = "";

const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;


function loginSuccess() {
    app.globalData.isLogin = true;
      wx.redirectTo({
        url: '../index/index',
        success: function(res){
          console.log("login success");
          // success
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
    })
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
      console.log("input password: " + event.detail.value);
      
      if(isFirst) {
        // 注册用户
        wx.request({
          url: http_server + '/weixin/register',
          data: {password: event.detail.value, sessionId: app.globalData.sessionId},
          method: 'GET', 
          success: function(res) {
            app.globalData.userInfo.password = event.detail.value;
            loginSuccess();
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
            app.globalData.userInfo.password = event.detail.value;
            //TODO 判断是否登录成功
            loginSuccess();
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
          isFirst = res.data.data.isFirst;
          app.globalData.userInfo.openId = res.data.data.openId;
          app.globalData.sessionId = res.data.data.sessionId;

          if(isFirst) {
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
