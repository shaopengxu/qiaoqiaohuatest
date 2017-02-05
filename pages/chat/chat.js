/**
 * @fileOverview  Demo 示例
 */
var Paho = require('../../utils/mqttws31.js');
var app = getApp();


var userInfo = {};
var targetUserInfo = {};
var topic = "userInfoopenId/targetUserInfoopenId";

/**
 * 生成聊天消息
 * 
 */
function createUserMessage(content, user, isMe) {
    return { id: msgUuid(), type: 'speak', content, user, isMe };
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
        var that = this;
        app.getUserInfo(function(data){
            //更新数据
            userInfo = data;
            userInfo.openId = targetUserInfo.openId;
            console.log(userInfo);
            //TODO topic
            setInterval(function(){
                //TODO 可以优化
                var topicMessages = wx.getStorageSync(topic)||[];
                topicMessages = topicMessages.map(function(m){
                    m.user = {
                        nickName : (m.isMe ? userInfo.nickName: targetUserInfo.nickName),
                        image : (m.isMe ? userInfo.avatarUrl: targetUserInfo.avatarUrl)
                    };
                    return m;
                });
                that.setData({messages: topicMessages});
            }, 100);
           
        })
    },

    onLoad(query) {
        targetUserInfo = query;
    },

    /**
     * 后续后台切换回前台的时候，也要重新启动聊天
     */
    onShow() {
        
       
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
        //TODO messageid
        var message = new Paho.MQTT.Message("1::" + userInfo.openId + "::" + this.data.inputContent);
        //TODO userInfo.openId + "::" + targetUserInfo.openId
        message.destinationName = "userInfoopenId/targetUserInfoopenId" ;
        app.client.send(message);
        // 还要发一条反方向topic的message
    },
});