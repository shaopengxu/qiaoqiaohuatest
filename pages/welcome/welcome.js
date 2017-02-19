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

function updateField(that, number){
    if(currentFocus == 1){
      that.setData({"input1": number, popError: " "});
    }else if(currentFocus == 2){
      that.setData({"input2": number, popError: " "});
    }else if(currentFocus == 3){
      that.setData({"input3": number, popError: " "});
    }else if(currentFocus == 4){
      that.setData({"input4": number, popError: " "});
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
    this.setData({showPassword: "", focus: true})
    /*
    if(!app.globalData.userAuth){
        wx.showToast({
          title: '用户授权失败',
          icon: 'error',
          duration: 1000
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
   */
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
    
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      if(!app.globalData.userAuth){
        console.log("welcome init getUserInfo 用户授权失败")
        wx.showToast({
          title: '用户授权失败',
          icon: 'error',
          duration: 1000
        })
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
            if(app.globalData.isFirst) {
              wx.clearStorageSync();
            }
          }else{
            wx.showToast({
              title: '用户信息服务器返回异常，请稍后重试',
              icon: 'error',
              duration: 1000
            })
          }
        },
        fail: function() {
          // fail
          console.log("welcome page, http check_user_info fail")
          wx.showToast({
            title: '用户信息服务器出错，请稍后重试 == ',
            icon: 'error',
            duration: 1000
          })
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
        input1: password[0],
        input2: password[1],
        input3: '',
        input4: ''
      })
    }else if(password.length == 3){
      this.setData({
        input1: password[0],
        input2: password[1],
        input3: password[2],
        input4: ''
      })
    }else if(password.length == 4){
      this.setData({
        input1: password[0],
        input2: password[1],
        input3: password[2],
        input4: password[3]
      })
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
