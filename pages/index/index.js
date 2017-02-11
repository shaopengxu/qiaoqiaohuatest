var app = getApp();
var Paho = require('../../utils/mqttws31.js');
const host = require("../../config.js").server_url;
const mqtt_host = require("../../config.js").mqtt_host;

var that = null;
/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
    if (!msgUuid.next) { 
        msgUuid.next = 0;
    }
    return 'msg-' + (++msgUuid.next) + new Date().getTime();
}

/**
 * 生成聊天消息
 * 
 */
function createUserMessage(content, isMe) {
    return { id: msgUuid(), type: 'speak', content, isMe };
}

/**
 * 获取好友数据
 */
function getFriendList() {
    try {
        //先从本地获取数据
        var frs = wx.getStorageSync('friends')
        if (frs) {
            this.setData({friends : frs});
            //请求好友数量，如果数量和本地获取的一致，则不需要再从服务器获取数据，否则再从服务器获取好友数据
            wx.request({
              url: 'https://' + host + '/weixin/get_friend_size',
              method: 'GET', 
              success: function(res){
                if(res.data.size != frs.length()){
                    //好友数量和服务器的不一致，重新获取
                    wx.request({
                        url: 'http://' + host + '/weixin/get_friends',
                        method: 'GET', 
                        success: function(res){
                            console.log('get friends : ' + res.data.data.friends);
                            that.setData({friends: res.data.data.friends});

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
        }
    } catch (e) {
    // Do something when catch error
    }
}

function addInvitorToFriend(){
    
  if(app.globalData.invitor){
    wx.request({
      url: 'http://' + host + 'weixin/add_friend',
      data: {openId: app.globalData.userInfo.openId, friendOpenId: app.globalData.invitor},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
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
}

Page({

    data: {
        motto: 'Hello World',
        userInfo: {},
        friends:[]
    },

    onLoad: function (params) {
        that = this;
        //加载好友
        getFriendList();

        //连接websocket
        wx.connectSocket({
          url: "ws://" ,
          data: {},
          // header: {}, // 设置请求的 header
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
          // login
          // 发送请求服务端推送未读消息
        })

        // 监听websocket的消息
        wx.onSocketMessage(function(res) {
           //判断消息类型， 增加好友/批量推送未读消息/推送单条未读消息
           var data = res.data;

           
           if(data.type == '2001'){
                // 增加好友
           } else if(data.type == '1003'){
                // 未读消息
           } else if(data.type == '1004'){
               // 批量未读消息
           }
        })
        
        
    },

    onShareAppMessage: function () {
        return {
            title: '自定义分享标题',
            desc: '自定义分享描述',
            path: 'pages/index/index?openId=' + app.globalData.userInfo.nickName
        }
    },

    //事件处理函数
    getLog: function() {
        wx.navigateTo({
        url: '../logs/logs'
        })
    },
    /**
     * 启动聊天
     */
    enter() {
        console.log("call enter()");
        if(app.client){
            return ;
        }
        var time = new Date().getTime()+"";
        app.client = new Paho.MQTT.Client(mqtt_host, 8080, time)
        app.client.connect({
            useSSL: false,
            cleanSession: false,
            keepAliveInterval: 60,
            onSuccess: function() {
                console.log('connected');
                //TODO  userInfo.openId + "::" + targetUserInfo.openId
                app.client.subscribe("userInfoopenId/#", {
                    qos: 1
                });
            }
        });
        app.client.onMessageArrived = function(msg) {
            //TODO 解密
            console.log("get message : " + msg.payloadString + ", topic : " + msg.topic);
            
            var msgInfos = msg.payloadString.split("::");
            //messageId::userid::content
            
            var messages = wx.getStorageSync(msg.topic) || []
            if(msgInfos[1] == app.globalData.userInfo.openId){
                messages.push(createUserMessage(msgInfos[2], true));
            }else{
                messages.push(createUserMessage(msgInfos[2], false));
            }
            wx.setStorageSync(msg.topic, messages)
            
        }

        app.client.onConnectionLost = function(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
        }
    },

   
    /**
     * 退出聊天
     */
    quit() {
        if(app.client){
            app.client.disconnect();
            app.client = null;
        }
    },

    

    onUnload: function () {
        this.quit();
    },
    
    startChat: function(event) {
        console.log(event);
        var id = event.currentTarget.id;
        wx.navigateTo({ url: '../chat/chat?openId=' + id + "&nickName=" + id});
    },

    clearBuffer: function(event){
        wx.clearStorageSync();
    }

});
