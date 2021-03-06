var app = getApp()
const http_server = require("../../config.js").http_server;

var isFirst = true;
var redirectToWelcome = false;
var password = '';
var password1 = '';
var currentFocus = 1;

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
    taImage: '',
    focus: false
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
    var that = this;
    if(data && data.openId) {
      
      console.log("invite_friend page, data.openId = " + data.openId + ", data.image = " + data.image);
      this.setData({invite: false, taImage: data.image})
      app.globalData.friend = data;
      
      app.chekcUserInfo(function(){
        if(openId == app.globalData.userInfo.openId){
          wx.redirectTo({
            url: '../password/password'
          })
          return;
        }
        var f = getFriendByOpenId(wx.getStorageSync('friends'), data.openId);
        if(f){
          wx.redirectTo({
            url: '../password/password?directToOpenId=' + data.openId
          })
          return;
        }
      });
      
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
    if(app.globalData && app.globalData.userInfo && app.globalData.userInfo.avatarUrl){
      this.setData({myImage: app.globalData.userInfo.avatarUrl});
    }
    if(app.globalData.friend && app.globalData.friend.image){
      this.setData({taImage: app.globalData.friend.image})
    }
    /*
    if(redirectToWelcome) {
        wx.redirectTo({
          url: '../welcome/welcome'
        })
    }
    */
  },
  makeFocus: function(){
    this.setData({focus:false});
    this.setData({focus:true});
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
       if(!app.globalData.isFirst){
         wx.navigateTo({
           url: '../password/password?needAddFriend=true'
         })
          //app.addInvitorToFriend();
       }else{
         this.setData({showPassword: "", focus: true})
       }
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
      inputPassword(this);
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
