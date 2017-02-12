var app = getApp();
const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;
const websocket_port = require("../../config.js").websocket_port;
const websocket_server = "ws://" +  host + ":" + websocket_port + "/websocket";

var that = null;


function receiveMessages(messages){
    for(var index= 0;index<messages.length;index++){
        receiveMessage(messages[index]);
    }
}

/**
 * 收到单条消息
 */
function receiveMessage(message) {
    console.log("receiverMessage message id " + message.messageId);
    if(!message) {
        return ;
    }
    message.isMe = message.fromOpenId == app.globalData.userInfo.openId;
    message.showType = 'speak'
    var friendOpenId = message.isMe? message.toOpenId : message.fromOpenId;
    var messages = wx.getStorageSync("messages_" + friendOpenId) || [];

    if(app.containsMessage(messages, message)) {
        // 已经接受到该消息
        return; 
    }

    //删除多余的属性
    delete message.fromOpenId;
    delete message.toOpenId;
    
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
                that.setData({friends: res.data.data});
                frs = res.data.data;
                wx.setStorageSync('friends', frs);
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        })

    } catch (e) {
        console.log("exception, e " + e);
    // Do something when catch error
    }
}



Page({

    data: {
        friends:[]
    },

    onShow: function() {
        //加载好友
        getFriendList();
    },
    onLoad: function (params) {
        that = this;
        //加载好友
        getFriendList();
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
            // fail
          },
          complete: function() {
            // complete
          }
        });

        wx.onSocketOpen(function() {
            //websocket登录
            var message = {};
            message.type = "1";
            message.openId = app.globalData.userInfo.nickName;
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
                    // fail
                },
                complete: function() {
                    // complete
                }
            });
        })
    },

    onShow: function() {
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
        console.log(event);
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

    redirectToAddFriend: function(event) {
        wx.navigateTo({url: '../invite_friend/invite_friend'});
    }

 
});
