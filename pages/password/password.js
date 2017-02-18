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
  function inputPassword(password) {

    if(backGround && urlAfterFromBackGround){
        backGround = false;
        if(password == app.globalData.userInfo.password){
          console.log("from password redirect to ... " + urlAfterFromBackGround);
            wx.redirectTo({
              url: urlAfterFromBackGround + "?fromBackGround=true"
            })
            return;
        }else{
          wx.showToast({
            title: '密码错误',
            icon: 'error',
            duration: 10000
          })
          return ;
        }
    }
    console.log("password page isFirst  " + app.globalData.isFirst + " sessionId = " + app.globalData.sessionId + " needAddFriend " + needAddFriend)
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

  function updateField(that, number){
    if(currentFocus == 1){
      that.setData({"input1": number});
    }else if(currentFocus == 2){
      that.setData({"input2": number});
    }else if(currentFocus == 3){
      that.setData({"input3": number});
    }else if(currentFocus == 4){
      that.setData({"input4": number});
    }
  }

Page({
  data:{
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    tip:"密码输入错误超过5次，请10分钟后重新尝试"
  },
  onLoad:function(data) {
      console.log("password page needAddFriend " + data.needAddFriend);
      if(data && data.backGround){
         console.log("back ground " + data.backGround);
         backGround = data.backGround;
         urlAfterFromBackGround = data.url;
      }
      if(data && data.needAddFriend){

        needAddFriend = data.needAddFriend;
      }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  click1: function(){
    updateField(this, "1");
    password = password + "1";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click2: function(){
    updateField(this, "2");
    password = password + "2";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click3: function(){
    updateField(this, "3");
    password = password + "3";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click4: function(){
    updateField(this, "4");
    password = password + "4";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click5: function(){
    updateField(this, "5");
    password = password + "5";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click6: function(){
    updateField(this, "6");
    password = password + "6";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click7: function(){
    updateField(this, "7");
    password = password + "7";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click8: function(){
    updateField(this, "8");
    password = password + "8";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click9: function(){
    updateField(this, "9");
    password = password + "9";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  click0: function(){
    updateField(this, "0");
    password = password + "0";
    if(currentFocus == 4){
      inputPassword(password);
      currentFocus = 0
    }else{
      currentFocus ++;
    }
    
  },
  clickdel: function(){
    if(currentFocus > 1){
      currentFocus --;
      updateField(this, "");
    }
  },
  clickdot: function(){

  }
})