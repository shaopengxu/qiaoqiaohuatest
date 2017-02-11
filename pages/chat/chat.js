var app = getApp();
const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;
var that = null;
var meUserInfo = {};
var friendUserInfo = {};

/**
 * 生成聊天消息
 * 
 */
function createUserMessage(content, user, isMe) {
    return { id: msgUuid(), type: 'speak', content, user, isMe };
}

/**
 * 收到单条消息
 */
function receiveMessage(message){
    message.isMe = message.fromOpenId == app.globalData.userInfo.openId;
    var friendOpenId = message.isMe? message.toOpenId : message.fromOpenId;
    var messages = wx.getStorageSync("messages_" + friendOpenId) || [];

    if(app.containsMessage(messages, message)){
        // 已经接受到该消息
        return; 
    }

    //删除多余的属性
    delete message.fromOpenId;
    delete message.toOpenId;
    console.log(messages);
    messages.push(message);
    wx.setStorageSync('messages_' + friendOpenId, messages);
    // 获取好友
    var friends = wx.getStorageSync('friends');
    if(!friends){
        return ;
    }
    var friendIndex = app.getFriendIndexFromList(friends, friendOpenId);
    //好友不存在，直接返回
    if(friendIndex < 0) {
        return ;
    }
    var friend = friends[friendIndex];
    //  刷新界面，好友的排序升为第一位
    if(friendIndex > 0){
        friends.splice(friendIndex, 1);
        friends.push(friend);
        wx.setStorageSync('friends', friends);
    }
    message.type = "speak";
    addMessage(message);
}

function addMessage(message){
    var msgs = that.data.messages;
    msgs.push(message);
    that.setData({messages: msgs});
}

// 声明聊天页面
Page({

    /**
     * 聊天使用到的数据，主要是消息集合以及当前输入框的文本
     */
    data: {
        messages: [],
        inputContent: 'Hi！',
        lastMessageId: 'none',
    },

    /**
     * 页面渲染完成后，启动聊天
     */
    onReady() {
        that = this;
        meUserInfo = app.globalData.userInfo;
        // 显示聊天信息
        // TODO 默认显示最近20条
        // 从服务器检查聊天有没有漏的
        var messages = wx.getStorageSync('messages_' + friendUserInfo.openId) || [];
        that.setData({messages: messages});
    },

    onLoad(query) {
        friendUserInfo = query;
    },

    /**
     * 后续后台切换回前台的时候，也要重新启动聊天
     */
    onShow() {
        // 监听websocket的消息
        wx.onSocketMessage(function(res) {
           //判断消息类型， 增加好友/批量推送未读消息/推送单条未读消息
           
           console.log("chat page , websocket get message! data = " + res.data);
           var data = JSON.parse(res.data);
           if(data.type == '2001'){
                // 增加好友
                addFriend(data.data);
           } else if(data.type == '1001'){
                // 未读消息
                console.log("receive message ! " + data.data);
                receiveMessage(data.data);
           } else if(data.type == '1002'){
               // 批量未读消息
           }
        })
       
    },

    /**
     * 页面卸载时，退出聊天
     */
    onUnload() {
        console.log("onUnload");
        
    },

    /**
     * 页面切换到后台运行时，退出聊天
     */
    onHide() {
        console.log("onHide");
        
    },

    
    /**
     * 用户输入的内容改变之后
     */
    changeInputContent(e) {
        this.setData({ inputContent: e.detail.value });
    },

    /**
     * 点击「发送」按钮，通过信道推送消息到服务器
     **/
    sendMessage(e) {
        var message = {};
        message.data = {};
        message.data.fromOpenId = meUserInfo.openId;
        message.data.toOpenId = friendUserInfo.openId;
        message.data.content = this.data.inputContent;
        message.data.type = "1";
        message.type = 1001;
        wx.sendSocketMessage({
          data: JSON.stringify(message),
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
    },
});