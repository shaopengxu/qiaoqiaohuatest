var app = getApp();
const http_server = require("../../config.js").http_server;

var password = ""
var needAddFriend = false;
var backGround = false;
var urlAfterFromBackGround = "";
var currentFocus = 1;


  /**
   * 输入密码
   */
  function inputPassword() {
    console.log("password page, inputPassword, password = " + password + ", backGround = " + backGround)
    if(backGround && urlAfterFromBackGround) {
        backGround = false;
        if(!app.globalData.userInfo.password) {
          console.log("password page, inputPassword, backGroud = true, but app.globalData.userInfo.password = null, redirect to root page");
          //返回到welcome page
          wx.navigateBack({
            delta: 100
          })
          return ;
        }
        if(password == app.globalData.userInfo.password) {
          console.log("password page, inputPassword, backGround = true, from password redirect to ... " + urlAfterFromBackGround);
          wx.redirectTo({
            url: urlAfterFromBackGround + "?fromBackGround=true"
          })
          return;
        } else {
          currentFocus++;
          app.globalData.errorMessage = "登陆密码错误";
          return ;
        }
    }
    console.log("password page isFirst  " + app.globalData.isFirst + " sessionId = " + app.globalData.sessionId + " needAddFriend " + needAddFriend + ", openId = " + app.globalData.userInfo.openId)
    if(app.globalData.isFirst) {
      // 逻辑错误
      console.log("password page, error , user need register password, not login password")
    }else{
      wx.request({
        url: http_server + '/weixin/login',
        data: {password: password, sessionId: app.globalData.sessionId ? app.globalData.sessionId : '', openId: app.globalData.userInfo.openId},
        method: 'GET', 
        success: function(res){
          //TODO 判断是否登录成功
          console.log("password page, http login success, statusCode = " + res.statusCode);
          if(res.statusCode == 200) {
            console.log("password page, http login success, field success = " + res.data.success + ", code  = " + res.data.code + ", errorMessage = " + res.data.errorMessage);
            if(res.data.data.success) {
              app.globalData.isLogin = true;
              app.globalData.userInfo.password = password;
              app.globalData.sessionId = res.data.data.sessionId;
            }else {
              app.globalData.errorMessage = "登陆密码错误";
              currentFocus ++;
              return; 
            }
          }else{
            app.globalData.errorMessage = "登陆服务器返回异常，请稍后重试"
            return ;
          }
          if(needAddFriend) {
            app.addInvitorToFriend(loginSuccess);
          }else{
            loginSuccess()
          }
          
        },
        fail: function() {
          // fail
          console.log("password page, http login fail ");
          app.globalData.errorMessage = "登陆服务器出错，请稍后重试"
          return ;
        },
        complete: function() {
          // complete
        }
      })
    }
    
  }

  function loginSuccess() {
     
      wx.redirectTo({
        url: '../index/index' + (needAddFriend? ('?navigateToOpenId=' + app.globalData.friend.openId): ''),
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
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    tip: '',
    focus: true
    //"密码输入错误超过5次，请10分钟后重新尝试"
  },
  onLoad:function(data) {
      if(data) {
        console.log("password page onLoad, data.needAddFriend = " + data.needAddFriend + ", data.backGround = " + data.backGround);
      }
      if(data && data.backGround) {
         backGround = data.backGround;
         urlAfterFromBackGround = data.url;
      }
      if(data && data.needAddFriend) {
        needAddFriend = data.needAddFriend;
      }
  },
  makeFocus: function(){
    
    this.setData({focus:false});
    this.setData({focus:true});
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    currentFocus = 1;
    password = '';
    this.setData({
      input1: '',
      input2: '',
      input3: '',
      input4: ''
    })
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  inputNumber: function(e){
    password = e.detail.value.length > 4 ? e.detail.value.substring(0, 4): e.detail.value;
    if(password.length == 1 ){
      this.setData({
        input1: password[0],
        input2: '',
        input3: '',
        input4: ''
      })
    }else if(password.length == 2){
      this.setData({
        input1: '*',
        input2: password[1],
        input3: '',
        input4: ''
      })
    }else if(password.length == 3){
      this.setData({
        input1: '*',
        input2: '*',
        input3: password[2],
        input4: ''
      })
    }else if(password.length == 4){
      this.setData({
        input1: '*',
        input2: '*',
        input3: '*',
        input4: password[3]
      })
      inputPassword();
    }else if(password.length == 0){
      this.setData({
        input1: '',
        input2: '',
        input3: '',
        input4: ''
      })
    }
    return {
      value: password
    }
  }
})