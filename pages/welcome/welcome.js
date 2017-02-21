var app = getApp();
const http_server = require("../../config.js").http_server;
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
  if(password1 == ''){
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
  }else{
    // 第二遍输入
    if(password != password1){
      
      that.setData({popErrorShow: 1})
      currentFocus = 5;
      return ; 
    }
  }
  if(app.globalData.isFirst) {
    
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
          
          wx.redirectTo({
              url: '../index/index'
          })
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
    // 逻辑错误
    console.log("password page, error , user need login password, not register password")
  }
  
}


Page({
  data: {
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    showPassword: "display: none",
    popTitle: '请设置登录密码',
    popErrorShow: 0,
    focus : false
  },

  makeFocus: function(){
    this.setData({focus:false});
    this.setData({focus:true});
  },

  startme:function(){
    //this.setData({showPassword: "", focus: true})
    
    if(!app.globalData.userAuth){
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '用户授权失败，请重新进入',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
        return;
    }
    if(app.globalData.isFirst){
      this.setData({showPassword: "", focus: true})
    }else{
      wx.navigateTo({
        url: '../password/password'
      })
    }
   
  },
  closePassword: function(){
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
      popErrorShow: '0',
      focus: false
    })
  },
  onLoad: function () {
    var that = this
    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo && userInfo.openId){
      app.globalData.userInfo = userInfo;
      app.globalData.isFirst = false;
      wx.redirectTo({
        url: '../password/password'
      })
      return ;
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      if(!app.globalData.userAuth){
        console.log("welcome init getUserInfo 用户授权失败")
        app.globalData.errorMessage = "用户授权失败";
        return;
      }
      //请求服务器 该用户是否已经登陆过
      wx.request({
        url: http_server + '/weixin/check_user_info',
        data: {encryptedData: app.globalData.encryptedData, iv: app.globalData.iv, code: app.globalData.code, nickName: userInfo.nickName,
             avatarUrl: userInfo.avatarUrl},
        method: 'GET', 
        success: function(res){
          console.log("welcome page, http check_user_info success, statusCode = " + res.statusCode);
          if(res.statusCode == 200){
            app.globalData.isFirst = res.data.data.isFirst;
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.sessionId = res.data.data.sessionId;
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            if(app.globalData.isFirst) {
              wx.clearStorageSync();
            }else{
              wx.redirectTo({
                url: '../password/password'
              })
              return ;
            }
          }else{
            app.globalData.errorMessage = "服务器异常，请稍后重试";
          }
        },
        fail: function() {
          // fail
          console.log("welcome page, http check_user_info fail")
          app.globalData.errorMessage = "网络异常，请稍后重试";
        },
        complete: function() {
          // complete
        }
      })
      
    })
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
      popTitle: '请设置密码',
      popErrorShow: '0',
      focus: false
    })
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
