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
              console.log("ws.login return code = " + response.code);
              console.log("ws.getUserInfo return encryptedData " + res.encryptedData);
              that.globalData.userInfo = res.userInfo
              that.globalData.encryptedData = res.encryptedData
              that.globalData.iv = res.iv
              that.globalData.code = response.code
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
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
addInvitorToFriend: function(callbackFunc){
  var http_server = require("config.js").http_server;
  var that = this;
  console.log("addInvitorToFriend   in line 63");
  if(this.globalData.friend){
    console.log("addInvitorToFriend   in line 65");
    wx.request({
      url: http_server + '/weixin/add_friend',
      data: {friendOpenId: this.globalData.friend.openId, sessionId: this.globalData.sessionId},
      method: 'GET',
      success: function(res){
        // success
        that.globalData.res =res;
        callbackFunc()

      },
      fail: function() {
        // fail
      },
      complete: function() {
        
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
      delta: 1
    });
  },

  websocketOpen: function(){
    var that =this;
    wx.onSocketOpen(function() {
          //websocket登录
          var message = {};
          message.type = "1";
          message.openId = that.globalData.userInfo.openId;
          message.password = that.globalData.userInfo.password;
          wx.sendSocketMessage({
          data: JSON.stringify(message),
          success: function(res) {
          },
          fail: function() {
              // fail
          },
          complete: function() {
              // complete
          }
        })
      })
  },

  wxConnectSocket: function() {
    var that = this;
    var websocket_server = require("config.js").ws_server;
      //连接websocket
      wx.connectSocket({
        url: websocket_server ,
        data: {},
        header:{ 
        'content-type': 'application/json'
        },
        method: 'GET', 
        success: function(res){
            that.socketOpen = true;
            that.websocketOpen();
        },
        fail: function() {
          that.failHandle();
        },
        complete: function() {
        // complete
        }
      });
   },
  
  globalData:{
    isFirst: true,
    userInfo: null,
    sessionId: null,
    isLogin: false,
    invitor: null,
    encryptedData: null,
    iv: null,
    code: null,
    friend: null,
    res: null,
    socketOpen : false
  },
  client:null
})