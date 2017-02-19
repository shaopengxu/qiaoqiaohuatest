var app = getApp()
const http_server = require("../../config.js").http_server;

var isFirst = true;
var redirectToWelcome = false;
var password = '';
var password1 = '';
var currentFocus = 1;



function updateField(that, number){
    if(currentFocus == 1){
      that.setData({"input1": number, popError: "display:none"});
    }else if(currentFocus == 2){
      that.setData({"input2": number, popError: "display:none"});
    }else if(currentFocus == 3){
      that.setData({"input3": number, popError: "display:none"});
    }else if(currentFocus == 4){
      that.setData({"input4": number, popError: "display:none"});
    }
  }

  /**
   * 输入密码
   */
  function inputPassword(that) {
    console.log("welcome page, inputPassword, password = " + password)
    if(!password || password.length != 4){
      wx.showToast({title:"输入密码异常", icon: "fail", duration:1000})
      return ;
    }
    if(password1 == '') {
      // 第一遍输入
      password1 = password
      password = '';
      currentFocus = 1;
      that.setData({
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        popTitle: '请再次输入密码'
      })
      return ;
    }else {
      // 第二遍输入
      if(password != password1){
        //wx.showToast({title:"密码不一致", icon:"warn", duration:1000})
        that.setData({popError: ""})
        currentFocus = 5;
        return ; 
      }
    }
    
    if(isFirst) {

      // 注册用户
      wx.request({
        url: http_server + '/weixin/register',
        data: {password: password, sessionId: app.globalData.sessionId},
        method: 'GET', 
        success: function(res) {
          console.log("welcome page, http register success, statusCode = " + res.statusCode);
          if(res.statusCode == 200) {
            app.globalData.isLogin = true;
            app.globalData.userInfo.password = password;
            app.addInvitorToFriend(function(){
              wx.redirectTo({
                url: '../index/index?navigateToOpenId=' + app.globalData.friend.openId
               })
            });
          }else{
            
            wx.showToast({
              title: '用户注册服务器返回异常，请稍后重试',
              icon: 'error',
              duration: 1000
            })
          }
          
        },
        fail: function() {
          // fail
          console.log("welcome page, http register fail ");
          wx.showToast({
            title: '用户注册服务器出错，请稍后重试 == ',
            icon: 'error',
            duration: 1000
          })
        }
      })
    }else{

    }
  
  }

Page({
  data: {
    invite: true,
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    showPassword: "display: none",
    popTitle: '请设置登录密码',
    popError: 'display:none',
    myImage: '',
    taImage: ''
  },

  closePassword: function(){
    this.setData({showPassword: "display: none"})
    password1 = '';
    password = "";
    currentFocus = 1;
    this.setData({
      showPassword: "display: none",
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      popTitle: '请设置密码',
      popError: 'display:none'
    })
  },

  onLoad: function (data) {
    if(data && data.openId) {
      var that = this;
      console.log("invite_friend page, data.openId = " + data.openId + ", data.image = " + data.image);
      this.setData({invite: false, taImage: data.image})
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
            that.setData({myImage: app.globalData.userInfo.avatarUrl})
            if(app.globalData.isFirst) {
              wx.clearStorageSync();
            }
            if(res.data.data.openId == app.globalData.friend.openId){
              console.log("invite page, invite myself");
              app.globalData.friend = null;
              wx.showToast({
                title: '不能邀请自己为好友',
                icon: 'error',
                duration: 1000
              });
              setTimeout(function (){
                wx.redirectTo({
                  url: '../welcome/welcome',
                  success: function(res){
                    // success
                    console.log("invite page, invite myself, redirectTo welcome success");
                  },
                  fail: function() {
                    // fail
                    console.log("invite page, invite myself, redirectTo welcome failed");
                  },
                  complete: function() {
                    // complete
                  }
                })
              }, 1000);
              
              return ;
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
      this.setData({invite: true, myImage: app.globalData.userInfo.avatarUrl}) 
    }else if(data && data.fromBackGround){
    }else{
      redirectToWelcome = true;
    }
  },
  onShow: function(){
    password1 = '';
    password = "";
    currentFocus = 1;
    this.setData({
      showPassword: "display: none",
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      popTitle: '请设置密码'
    })
    /*
    if(redirectToWelcome) {
        wx.redirectTo({
          url: '../welcome/welcome'
        })
    }
    */
  },
  onShareAppMessage: function () {
        app.globalData.hasInvite = true;
        setTimeout(function (){
          wx.navigateBack({
            delta: 1
          })
        }, 1000);
        return {
            title: '朋友蜜语',
            desc: '加入朋友密码',
            path: '/pages/invite_friend/invite_friend?openId=' + app.globalData.userInfo.openId
               + "&image=" + app.globalData.userInfo.avatarUrl
        }
   },
   acceptInvite: function() {
       if(app.globalData.isFirst){
         wx.navigateTo({
           url: '../password/password?needAddFriend=true'
         })
          //app.addInvitorToFriend();
       }else{
         this.setData({showPassword: ""})

         
       }
   },
   click1: function(){
    updateField(this, "1");
    password = password + "1";
    if(currentFocus == 4){
      inputPassword(this);
    }else{
      currentFocus ++;
    }
    
  },
  click2: function(){
    updateField(this, "2");
    password = password + "2";
    if(currentFocus == 4){
      inputPassword(this);
      
    }else{
      currentFocus ++;
    }
    
  },
  click3: function(){
    updateField(this, "3");
    password = password + "3";
    if(currentFocus == 4){
      inputPassword(this);
     
    }else{
      currentFocus ++;
    }
    
  },
  click4: function(){
    updateField(this, "4");
    password = password + "4";
    if(currentFocus == 4){
      inputPassword(this);
      
    }else{
      currentFocus ++;
    }
    
  },
  click5: function(){
    updateField(this, "5");
    password = password + "5";
    if(currentFocus == 4){
      inputPassword(this);
      
    }else{
      currentFocus ++;
    }
    
  },
  click6: function(){
    updateField(this, "6");
    password = password + "6";
    if(currentFocus == 4){
      inputPassword(this);
     
    }else{
      currentFocus ++;
    }
    
  },
  click7: function(){
    updateField(this, "7");
    password = password + "7";
    if(currentFocus == 4){
      inputPassword(this);
     
    }else{
      currentFocus ++;
    }
    
  },
  click8: function(){
    updateField(this, "8");
    password = password + "8";
    if(currentFocus == 4){
      inputPassword(this);
      
    }else{
      currentFocus ++;
    }
    
  },
  click9: function(){
    updateField(this, "9");
    password = password + "9";
    if(currentFocus == 4){
      inputPassword(this);
  
    }else{
      currentFocus ++;
    }
    
  },
  click0: function(){
    updateField(this, "0");
    password = password + "0";
    if(currentFocus == 4){
      inputPassword(this);
     
    }else{
      currentFocus ++;
    }
    
  },
  clickdel: function(){
    if(currentFocus > 1){
      currentFocus --;
      updateField(this, "");
      password = password.substr(0, password.length -1 );
      console.log("password page , click del password = " + password)
    }
  },
  clickdot: function(){

  }

})
