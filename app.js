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
              
              that.globalData.userInfo = res.userInfo
              that.globalData.userInfo.code = response.code
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
  
  failHandle: function(){
		wx.showToast({
		  title: '连接断开，请重新登录',
		  icon: 'error',
		  duration: 2000
		});
		wx.redirectTo("../welcome/welcome");
  },
  
  globalData:{
    isFirst: false,
    userInfo: null,
    sessionId: null,
    isLogin: false,
    invitor: null
  },
  client:null
})