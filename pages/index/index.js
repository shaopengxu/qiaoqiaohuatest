var app = getApp();
var Paho = require('../../utils/mqttws31.js');

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

function addInvitorToFriend(){
  if(app.globalData.invitor){
    wx.request({
      url: 'http://weixin/add_friend',
      data: {openId: openId, friendOpenId: app.globalData.invitor},
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
        users:[{openId: "testuser1", nickname: "testuser1"},
               {openId: "testuser2", nickname: "testuser2"},
               {openId: "testuser3", nickname: "testuser3"}
            ]
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
        var time = new Date().getTime()+"";
        var that = this;
        app.client = new Paho.MQTT.Client('192.168.1.8', 8080, time)
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

    onLoad: function (params) {
        if(params){
            app.globalData.invitor = params.openId;
        }
        if(app.globalData.isLogin){
            addInvitorToFriend()
        }else{
            wx.redirectTo({
              url: '../welcome/welcome',
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
        var that = this
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function(userInfo){
            //更新数据
            that.setData({
                userInfo:userInfo
            })
            that.enter();
        })
        
    },

    onUnload: function () {
        app.client.disconnect();
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