var app = getApp();
const host = require("../../config.js").host;
const http_port = require("../../config.js").http_port;
const http_server = "http://" + host + ":" + http_port;
const websocket_port = require("../../config.js").websocket_port;
const websocket_server = "ws://" +  host + ":" + websocket_port + "/websocket";

var that = null;

/**
 * 收到单条消息
 */
function receiveMessage(message){
    message.isMe = message.fromOpenId == app.globalData.userInfo.openId;
    var friendOpenId = message.isMe? message.toOpenId : message.fromOpenId;
    var messages = wx.getStorageInfoSync("messages_" + friendOpenId) || [];

    if(app.containsMessage(messages, message)){
        // 已经接受到该消息
        return; 
    }

    //删除多余的属性
    delete message.fromOpenId;
    delete message.toOpenId;
    
    
    messages.push(message);
    wx.setStorageSync('messages' + friendOpenId, messages);
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
    }
    // 更新未读数量
    friend.unreadSize = friend.unreadSize + 1;
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
        //请求好友数量，如果数量和本地获取的一致，则不需要再从服务器获取数据，否则再从服务器获取好友数据
        wx.request({
            url: http_server + '/weixin/get_friend_size',
            method: 'GET', 
            data: {sessionId: app.globalData.sessionId},
            success: function(res) {
                if(res.data.data != frs.length) {
                    //好友数量和服务器的不一致，重新获取
                    wx.request({
                        url: http_server + '/weixin/get_friends',
                        method: 'GET', 
                        data: {sessionId: app.globalData.sessionId},
                        success: function(res){
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
                }
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

    onLoad: function (params) {
        that = this;
        //加载好友
        getFriendList();
        console.log("websocket connectting!, websocket url " + websocket_server);
        //连接websocket
        wx.connectSocket({
          url: websocket_server ,
          data: {},
          header:{ 
            'content-type': 'application/json'
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
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

        wx.onSocketOpen(function() {
          console.log("websocket connected!");
          var message = {};
          message.type = "1";
          message.openId = app.globalData.userInfo.nickName;
          message.password = app.globalData.userInfo.password;
          wx.sendSocketMessage({
            data: JSON.stringify(message),
            success: function(res){
              console.log("websocket login success")
            },
            fail: function() {
              // fail
            },
            complete: function() {
              // complete
            }
          })
          // login
          // 发送请求服务端推送未读消息
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
                //TODO  未读消息

                receiveMessage(data.data);
           } else if(data.type == '1002'){
               console.log("websocket get message!");
               //TODO 批量未读消息
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
        wx.navigateTo({url: '../invite_friend/invite_friend?openId=shaopeng'});
    }

 
});
