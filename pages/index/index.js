var app = getApp();
const host = require("../../config.js").host;
const http_server = "https://" + host;
const websocket_server = "wss://" +  host + "/ws";

var that = null;

/**
 * 收到批量消息
 */
function receiveMessages(messages){
    for(var index= 0;index<messages.length;index++){
        receiveMessage(messages[index]);
    }
}

/**
 * 收到单条消息
   1 获取本地的消息list，判断是否已经接受该消息
 */
function receiveMessage(message) {
    
    if(!message) {
        return ;
    }
	console.log("receiverMessage message id " + message.messageId);
	
    message.isMe = message.fromOpenId == app.globalData.userInfo.openId;
    var friendOpenId = message.isMe? message.toOpenId : message.fromOpenId;
    var messages = wx.getStorageSync("messages_" + friendOpenId) || [];

    if(app.containsMessage(messages, message)) {
        // 已经接受到该消息
        return; 
    }

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
    if(friend) {
        // 更新未读数量
        if(!friend.unreadSize){
            friend.unreadSize = 0;
        }
        if(!friend.lastMessage){
            friend.lastMessage = "";
        }
        friend.unreadSize = friend.unreadSize + 1;
        friend.lastMessage = message.content;
    }
    //  刷新界面，好友的排序升为第一位
    if(friendIndex > 0){
        friends.splice(friendIndex, 1);
        friends.push(friend);
    }
    wx.setStorageSync('friends', friends);
    if(that){
        that.setData({friends: friends});
    }
}

/**
 * 添加好友
 */
function addFriend(friend){
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
    
    if(that){
        that.setData({friends: friends});
    }
}

/**
 * 获取好友数据
 */
function getFriendList() {
    try {
        //先从本地获取数据
        var frs = wx.getStorageSync('friends') ||[];
        that.setData({friends : frs});
        wx.request({
            url: http_server + '/weixin/get_friends',
            method: 'GET', 
            data: {sessionId: app.globalData.sessionId},
            success: function(res) {
                that.setData({'friends': res.data.data});
                frs = res.data.data;
                wx.setStorageSync('friends', frs);
            },
            fail: function() {
                app.failHandle();
            },
            complete: function() {
                // complete
            }
        })

    } catch (e) {
        console.log("exception, e " + e);
		app.failHandle();
    }
}

function wxConnectSocket() {
	//连接websocket
	wx.connectSocket({
	  url: websocket_server ,
	  data: {},
	  header:{ 
		'content-type': 'application/json'
	  },
	  method: 'GET', 
	  success: function(res){
  
	  },
	  fail: function() {
		app.failHandle();
	  },
	  complete: function() {
		// complete
	  }
	});
}

Page({

    data: {
        friends:[]
    },

    onLoad: function (params) {
        that = this;
        console.log("index page onLoad");
        wxConnectSocket();
        wx.onSocketOpen(function() {
            //websocket登录
            var message = {};
            message.type = "1";
            message.openId = app.globalData.userInfo.openId;
            message.password = app.globalData.userInfo.password;
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

        wx.onSocketError(function() {
            // 重连websocket
            console.log("websocket error, reconnect");
            wxConnectSocket();
        })
    },

    onShow: function() {
        console.log("index page onShow");
        //加载好友
        getFriendList();
        // 监听websocket的消息
        wx.onSocketMessage(function(res) {
           //判断消息类型， 增加好友/批量推送未读消息/推送单条未读消息
           console.log("websocket get message! data = " + res.data);
           var data = JSON.parse(res.data);
           if(data.type == '2001'){
                // 增加好友
                addFriend(data.data);
           } else if(data.type == '1001'){
                // 未读消息
                receiveMessage(data.data);
           } else if(data.type == '1002'){
               // 批量未读消息
                receiveMessages(data.data || []);
           }
        })
    },
    
    onUnload: function () {
    },
    
    startChat: function(event) {
        console.log("income talking to friend " + friend)
        var friendOpenId = event.currentTarget.id;
        var friends = wx.getStorageSync('friends');
        if(!friends){
            return;
        }
        var friendIndex = app.getFriendIndexFromList(friends, friendOpenId);
        console.log("friendOpenId " + friendOpenId + ", friendIndex " + friendIndex);
        if(friendIndex < 0) {
            return ;
        }
        var friend = friends[friendIndex];
        console.log("talking to friend " + friend)
        wx.navigateTo({ url: '../chat/chat?openId=' + friendOpenId
            + "&nickName=" + friend.friendNickName + "&image=" + friend.image});
        
    },

    navigateToMe: function(){
        wx.navigateTo({url: '../me/me'});
    },

    redirectToAddFriend: function(event) {
        wx.redirectTo({url: '../invite_friend/invite_friend'});
    }

 
});
