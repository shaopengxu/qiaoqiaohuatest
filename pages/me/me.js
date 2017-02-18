var app = getApp();
Page({
  data:{
    userInfo : null
  },
  onLoad:function(options){
    this.setData({userInfo: app.globalData.userInfo})
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
  navegateBackToIndex: function(){
    wx.redirectTo({url: '../index/index'});
  },
  quit: function(){
    wx.navigateBack({
      delta: 100
    })
  }
})