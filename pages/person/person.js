var app = getApp();
const http_server = require("../../config.js").http_server;

Page({
  data:{ 
    friend : null,
    nickName : ""
  },
  onLoad:function(data){
    if(data && data.openId){
       var friends = wx.getStorageSync('friends');
       console.log("person page, openId = " + data.openId)
       var friend = app.getFriendByOpenId(friends, data.openId);
       if(!friend){
         wx.showToast({
            title: '不存在该好友',
            icon: 'error',
            duration: 1000
          });
          wx.navigateBack({
            delta: 1
          })
          return;
       }
       this.setData({friend: friend});
    }

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  //清空聊天记录
  deleteChatMessage:function(){
    wx.request({
      url: http_server + '/weixin/delete_chat_message',
      data: {friendOpenId : this.data.friend.friendOpenId, sessionId : app.globalData.sessionId},
      method: 'GET',
      success: function(res){
        wx.showToast({
          title: '清空聊天记录成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
    
  },
  changeImage: function(){
      wx.request({
        url: http_server + '/weixin/change_random_image',
        data: {friendOpenId : this.data.friend.friendOpenId, sessionId : app.globalData.sessionId},
        method: 'GET', 
        success: function(res){
          //更新当前图片
          //更新缓存的friend的信息
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
  },
  updateNickName: function(){
    wx.request({
      url: http_server + '/weixin/update_friend_nick_name',
      data: {friendOpenId : this.data.friend.friendOpenId, nickName: this.data.nickName, sessionId : app.globalData.sessionId},
      method: 'GET', 
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
})