// pages/password/password.js
Page({
  data:{
    focus1: true,
    focus2: false,
    focus3: false,
    focus4: false,
    input1: '',
    input2: '',
    input3: '',
    input4: ''
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

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
  input1Change: function(){
    this.setData({focus1: false, focus2: true, focus3: false, focus4: false})
  },
  input2Change: function(){
    this.setData({focus1: false, focus2: false, focus3: true, focus4: false})
  },
  input3Change: function(){
    this.setData({focus1: false, focus2: false, focus3: false, focus4: true})
  },
  input4Change: function(){
    
  }
})