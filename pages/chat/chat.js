var app = getApp();
const http_server = require("../../config.js").http_server;
var that = null;
var meUserInfo = {};
var friendUserInfo = {};

/**
 * 收到批量消息
 */
function receiveMessages(messages){
    for(var index= 0;index<messages.length;index++) {
        receiveMessage(messages[index]);
    }
 }

/**
 * 收到单条消息
 */
function receiveMessage(message){
    console.log(" chat page,  receive message id " + message.messageId);
    message.isMe = message.fromOpenId == app.globalData.userInfo.openId;
    var friendOpenId = message.isMe? message.toOpenId : message.fromOpenId;
    var messages = wx.getStorageSync("messages_" + friendOpenId) || [];

    var isThisChat = message.isMe? (message.toOpenId == app.globalData.currentChatFriendUserInfo.openId)
           : (message.fromOpenId == app.globalData.currentChatFriendUserInfo.openId);

    if(app.containsMessage(messages, message)){
        // 已经接受到该消息
        //console.log("chat message has received")
        if(isThisChat) {
            that.setData({messages: messages});
            that.setData({lastMessageId : message.messageId});
        }
        return; 
    }

    messages.push(message);
    wx.setStorageSync('messages_' + friendOpenId, messages);
    console.log("chat page receive message, isThisChat " + isThisChat + ", isMe " + message.isMe);
    if(isThisChat){
        that.setData({messages: messages});
        that.setData({lastMessageId : message.messageId});
    }
    
}

/**
 * 发送聊天消息已读
 */
function sendMessageRead() {

    wx.request({
      url: http_server + '/weixin/message_read',
      data: {friendOpenId: app.globalData.currentChatFriendUserInfo.openId, sessionId: app.globalData.sessionId},
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

/**
 * 添加好友
 */
function addFriend(friend) {
    var friends = wx.getStorageSync('friends');
    if(!friends){
        return ;
    }
    var friendIndex = app.getFriendIndexFromList(friends, friend.openId);
    if(friendIndex >= 0) {
        return ;
    }
    friends.push(friend);
    wx.setStorageSync('friends', friends);
}

function onWebSocketOpen(){
    // 监听websocket的消息
    wx.onSocketMessage(function(res) {
        
        //判断消息类型， 增加好友/批量推送未读消息/推送单条未读消息
        console.log("chat page , websocket get message, res.data =  " + res.data);
        try{
            var data = JSON.parse(res.data);
            if(data.code != 10000){
                console.log("chat page, websocket get message, error code , code = " + data.code);
                return;
            }
            if(data.type == '2001'){
                    // 增加好友
                    addFriend(data.data);
            } else if(data.type == '1001'){
                    // 未读消息
                    console.log("receive message ! " + data.data);
                    receiveMessage(data.data);
                    sendMessageRead();
            } else if(data.type == '1002'){
                // 批量未读消息
                receiveMessages(data.data);
                sendMessageRead();
            }else{
                console.log("chat page, websocket 返回不正常type， type = " + data.type);
            }
        }catch(e){
            console.log("chat page, get websocket message, exception, e " + e);
        }
        
    })
}

// 声明聊天页面
Page({

    /**
     * 聊天使用到的数据，主要是消息集合以及当前输入框的文本
     */
    data: {
        messages: [],
        inputContent: '',
        lastMessageId: 'none',
		friendUserInfo: {},
		meUserInfo: {}
		
    },

    /**
     * 页面渲染完成后，启动聊天
     */
    onReady() {
        wx.setNavigationBarTitle({
          title: app.globalData.currentChatFriendUserInfo.nickName
        })
    },

    onLoad(data) {
        that = this;
        if(data && data.openId){
            app.globalData.currentChatFriendUserInfo = data;
            meUserInfo = app.globalData.userInfo;
        }
        
        
    },

    /**
     * 后续后台切换回前台的时候，也要重新启动聊天
     */
    onShow() {
        //this.setData({messages : []})
		// 显示聊天信息
        // 聊天记录向上拉，显示从本地存储读出的数据，如果已经读完了，从服务器拉数据
        var messages = wx.getStorageSync('messages_' + app.globalData.currentChatFriendUserInfo.openId) || [];
        this.setData({
            messages: messages, 
            friendUserInfo: app.globalData.currentChatFriendUserInfo,
            meUserInfo: meUserInfo 
        });
        this.setData({
            lastMessageId: (messages && messages.length > 0) ? messages[messages.length - 1].messageId : "" 
        });
        var lastMessageId = messages.length == 0 ? -1 : messages[messages.length - 1].messageId;
        wx.request({
          url: http_server + '/weixin/ask_for_msg_push',
          data: {lastMessageId: lastMessageId, friendOpenId: app.globalData.currentChatFriendUserInfo.openId, sessionId: app.globalData.sessionId},
          method: 'GET'
        })

        //检查websocket是否连接
        try{
            console.log("chat page, onShow check websocket , before")
            wx.sendSocketMessage({
                data: '{}',
                success: function(res){
                    // success
                },
                fail: function() {
                    // fail
                    console.log("chat page, onShow check websocket , fail")
                    app.wxConnectSocket(onWebSocketOpen);
                },
                complete: function() {
                    console.log("chat page, onShow check websocket , complete")
                }
            })
            onWebSocketOpen();
        }catch (e){
            console.log("chat page, onShow check websocket catch exception , e = " + e);
            console.log("chat page, onShow check websocket catch exception , reconnecting..." )
            app.wxConnectSocket(onWebSocketOpen);
        }
          
		
        
       
    },

    /**
     * 页面卸载时，退出聊天
     */
    onUnload() {
    },

    /**
     * 页面切换到后台运行时，退出聊天
     */
    onHide() {
        console.log("chat page, onHide");
        this.setData({messages : []})
    },

    
    /**
     * 用户输入的内容改变之后
     */
    changeInputContent(e) {
        this.setData({ inputContent: e.detail.value });
    },

    navigateToPerson (e){
        wx.navigateTo({
          url: '../person/person?openId=' + app.globalData.currentChatFriendUserInfo.openId
        })
    },

    /**
     * 点击「发送」按钮，通过信道推送消息到服务器
     **/
    sendMessage(e) {
        console.log("message content: " + this.data.inputContent);
        var message = {};
        message.data = {};
        message.data.fromOpenId = meUserInfo.openId;
        message.data.toOpenId = app.globalData.currentChatFriendUserInfo.openId;
        message.data.content = e.detail.value;
		message.data.showType = "speak"
        message.data.type = "1";
        message.type = 1001;
        wx.sendSocketMessage({
          data: JSON.stringify(message),
          success: function(res){
            // success
			// 信息转圈圈的图标去掉
            
          },
          fail: function() {
            console.log("chat page, send message, fail")
            app.wxConnectSocket(onWebSocketOpen);
          },
          complete: function() {
            // complete
            that.setData({ inputContent: ''});
          }
        })
        return {value : '' , cursor : 0};
		
    },
});