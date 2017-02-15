var app = getApp();
const http_server = require("../../config.js").http_server;

var password1 = ""
var password2 = ""
var needAddFriend = false;

  /**
   * 输入密码
   */
  function inputPassword(password) {
    
    if(app.globalData.isFirst) {
      // 注册用户
      wx.request({
        url: http_server + '/weixin/register',
        data: {password: password, sessionId: app.globalData.sessionId},
        method: 'GET', 
        success: function(res) {
          app.globalData.isLogin = true;
          app.globalData.userInfo.password = password;
          if(needAddFriend){
              app.addInvitorToFriend(loginSuccess);
          }else{
            loginSuccess()
          }
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
        data: {password: password, sessionId: app.globalData.sessionId},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function(res){
          //TODO 判断是否登录成功

          app.globalData.isLogin = true;
          app.globalData.userInfo.password = password;
          
          if(needAddFriend){
              app.addInvitorToFriend(loginSuccess);
          }else{
            loginSuccess()
          }
          
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

  function loginSuccess() {
    
      wx.redirectTo({
        url: '../index/index',
        success: function(res){
          
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
  data:{
    focus1: true,
    focus2: false,
    focus3: false,
    focus4: false,
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    tip:"密码输入错误超过5次，请10分钟后重新尝试"
  },
  onLoad:function(data) {
      if(app.globalData.isFirst){
          this.setData({tip: '请设置登录密码'});
      }
      if(data && data.needAddFriend){
          needAddFriend = true;
      }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  input1Change: function(e){
    this.setData({focus1: false, focus2: true, focus3: false, focus4: false, input1: e.detail.value})
  
  },
  input2Change: function(e){
    this.setData({focus1: false, focus2: false, focus3: true, focus4: false, input2: e.detail.value})
  },
  input3Change: function(e){
    this.setData({focus1: false, focus2: false, focus3: false, focus4: true, input3: e.detail.value})
  },
  input4Change: function(e){
    password1 = this.data.input1 + this.data.input2 + this.data.input3 + e.detail.value;
    if(app.globalData.isFirst){
        inputPassword(password1);
    }else{
        inputPassword(password1);
    }
  }
})