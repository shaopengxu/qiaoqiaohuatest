//index.js
//获取应用实例
var app = getApp();
var isFirst = false;
var openId = "";
var password = "";
var passwordConfirm = "";


function loginSuccess(){
    app.globalData.isLogin = true;
      wx.redirectTo({
        url: '../index/index',
        success: function(res){
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

function addInvitorToFriend(){
  if(app.globalData.invitor){
    wx.request({
      url: 'http://weixin/add_friend',
      data: {openId: openId, friendOpenId: app.globalData.invitor},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
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
}

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hideps: "hideps"
  },

  startme:function(){
    this.setData({hideps:""})
  },
  inputPassword:function(event){
    console.log("password: " + event.detail.value);
    if(event.detail.value.length == 4){
      //TODO 根据isFirst等信息判断要怎么处理
      if(isFirst){
        console.log("come in");
        //TODO 注册用户
        wx.request({
          url: 'http://weixin/register',
          data: {openId: openId, password: event.detail.value},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            loginSuccess();
            addInvitorToFriend()
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })

      }else{
        //TODO 检查用户密码是否正确
        wx.request({
          url: 'http://weixin/login',
          data: {openId: openId, password: event.detail.value},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            loginSuccess();
            addInvitorToFriend()
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
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      });
      //请求服务器 该用户是否已经登陆过
      wx.request({
        url: 'http://192.168.1.8:8081/weixin/check_user_info',
        data: {nickName: userInfo.nickName},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function(res){
          // success TODO isFirst openId set value
          console.log(res.data.data);
          isFirst = res.data.data.isFirst;
          openId = res.data.data.openId;
           
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