//app.js
App({

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (response) {
          wx.getUserInfo({
            success: function (res) {
              //console.log("ws.login return code = " + response.code);
              //console.log("ws.getUserInfo return encryptedData " + res.encryptedData);
              console.log("wx.getUserInfo success");
              that.globalData.userInfo = res.userInfo
              that.globalData.encryptedData = res.encryptedData
              that.globalData.iv = res.iv
              that.globalData.code = response.code
              that.globalData.userAuth = true;
              typeof cb == "function" && cb(that.globalData.userInfo)
              
            },
            fail:function(){
              console.log("wx.getUserInfo fail");
              that.globalData.userAuth = false;
            }
          })
        },
        fail: function(){
          console.log("wx.login fail");
          that.globalData.userAuth = false
        }
      })
    }
  },

  checkUserInfo: function(callback) {
    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo && userInfo.openId){
      this.globalData.userInfo = userInfo;
      this.globalData.isFirst = false;
      if(callback){
        callback();
        return;
      }else {
        wx.redirectTo({
          url: '/pages/password/password'
        })
        return ;
      }
      
    }
    //调用应用实例的方法获取全局数据
    this.getUserInfo(function(userInfo){
      if(!this.globalData.userAuth){
        console.log("welcome init getUserInfo 用户授权失败")
        this.globalData.errorMessage = "用户授权失败";
        return;
      }
      //请求服务器 该用户是否已经登陆过
      wx.request({
        url: http_server + '/weixin/check_user_info',
        data: {encryptedData: this.globalData.encryptedData, iv: this.globalData.iv, code: this.globalData.code, nickName: userInfo.nickName,
             avatarUrl: userInfo.avatarUrl},
        method: 'GET', 
        success: function(res){
          console.log("welcome page, http check_user_info success, statusCode = " + res.statusCode);
          if(res.statusCode == 200){
            this.globalData.isFirst = res.data.data.isFirst;
            this.globalData.userInfo.openId = res.data.data.openId;
            this.globalData.sessionId = res.data.data.sessionId;
            wx.setStorageSync('userInfo', this.globalData.userInfo);
            if(app.globalData.isFirst) {
              wx.clearStorageSync();
            }else{
              if(callback){
                callback();
                return;
              }else{
                wx.redirectTo({
                  url: '../password/password'
                })
                return ;
              }
             
            }
          }else{
            this.globalData.errorMessage = "服务器异常，请稍后重试";
          }
        },
        fail: function() {
          // fail
          console.log("welcome page, http check_user_info fail")
          this.globalData.errorMessage = "网络异常，请稍后重试";
        },
        complete: function() {
          // complete
        }
      })
      
    })
  },

  getFriendByOpenId: function(friends, openId) {
    if((!friends) || (!openId)){
      return null;
    }

    for(var index = 0; index< friends.length;index++) {
       if(friends[index].friendOpenId == openId) {
          return friends[index];
       }
    }
    return null;
  },

  onLaunch: function () {
  },

  onShow(){
    

  },

  onHide(){
    
    // 从后台返回
    var pages = getCurrentPages();
    //如果是welcome page，或者密码页， 就不需要进入密码页
    if(pages.length <= 1 || pages[pages.length-1].__route__.indexOf("password") >= 0){
      return ;
    }
    
    wx.redirectTo({
      url: '/pages/password/password?backGround=true&url=/' + pages[pages.length-1].__route__,
      success: function(res){
        // success
        console.log("app onHide navigate to password success ")
      },
      fail: function() {
        console.log("app onHide navigate to password fail ")
      },
      complete: function() {
        // complete
      }
    })
     
  
  },

  containsMessage: function(messages, message){
    if((!messages) || (!message)){
      return false;
    }
    for(var index = 0;index < messages.length; index++){
      if(messages[index].messageId == message.messageId){
        return true;
      }
    }
    return false;
  },

  getFriendIndexFromList: function(friends, friendOpenId){
      if ((!friends) || (!friendOpenId)) {
          return -1;
      }
      
      for (var index = 0; index< friends.length; index++) {
          if(friends[index].friendOpenId == friendOpenId) {
              return index;
          }
      }
      return -1;
  },

  /**
 * 邀请好友
 */
addInvitorToFriend: function(callbackFunc) {
  var http_server = require("config.js").http_server;
  var that = this;
  console.log("app.js addInvitorToFriend friend: " + this.globalData.friend);
  if(this.globalData.friend){
    
    wx.request({
      url: http_server + '/weixin/add_friend',
      data: {friendOpenId: this.globalData.friend.openId, sessionId: this.globalData.sessionId},
      method: 'GET',
      success: function(res) {
        // success
        console.log("app.js, http add friend success, statusCode = " + res.statusCode);
        if(res.statusCode == 200){
          console.log("add friend result code = " + res.data.code); 
          callbackFunc()
        }else{
          wx.showToast({title: "添加好友服务器返回异常，请稍后重试", icon: "error", duration: 1000})
        }
      },
      fail: function() {
        // fail
        console.log("app.js, http add friend fail");
        wx.showToast({title: "添加好友服务器出错，请稍后重试", icon: "error", duration: 1000})
      }
    })
  }
},
  
  failHandle: function(){
    
		wx.showToast({
		  title: '连接断开，请重新登录',
		  icon: 'error',
		  duration: 2000
		});
		wx.navigateBack({
      delta: 100
    });
  },

  websocketOpen: function(callback){
    var that =this;
    wx.onSocketOpen(function() {
          console.log("websocket open");
          wx.onSocketError(function() {
              // 重连websocket
              console.log("websocket error, reconnect");
              //wxConnectSocket();
          })
          wx.onSocketClose(function() {
            console.log("websocket closed");
          })
          
          setInterval(function (){

            wx.sendSocketMessage({
              data: '{}'
            })
          }, 50000);
          
          //websocket登录
          var message = {};
          message.type = "1";
          message.openId = that.globalData.userInfo.openId;
          message.password = that.globalData.userInfo.password;

          wx.sendSocketMessage({
          data: JSON.stringify(message),
          success: function(res) {
              console.log("websocket login success!");
              if(callback){
                callback();
              }
          },
          fail: function() {
              // fail
              console.log("websocket login fail!");
          },
          complete: function() {
              // complete
          }
        })
      })
  },

  wxConnectSocket: function(callback) {
    var that = this;
    var websocket_server = require("config.js").ws_server;
      //连接websocket
      console.log("websocket connecting");
      wx.connectSocket({
        url: websocket_server,
        data: {},
        header:{ 
        'content-type': 'application/json'
        },
        method: 'GET', 
        success: function(res){
            that.socketOpen = true;
            that.websocketOpen(callback);
            
        },
        fail: function() {
          console.log("websocket connect fail")
          that.failHandle();
        },
        complete: function() {
        // complete
        }
      });
   },
  
  globalData:{
    currentChatFriendUserInfo: null, // 当前聊天对象 
    isFirst: true, // 是否注册过
    userInfo: null,
    sessionId: null,
    isLogin: false,
    invitor: null,
    encryptedData: null,
    iv: null,
    code: null,
    friend: null,
    socketOpen : false,
    hasInivte : false,
    userAuth: true, // 用户授权
    
  },
  client:null
})