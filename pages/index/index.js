var app = getApp();
var Paho = require('../../utils/mqttws31.js');

// Create a client instance
//var client = new Paho.MQTT.Client('192.168.1.8', 8080, "clientId2");

Page({
    startChat: function() {
        wx.navigateTo({ url: '../chat/chat' });
        //var message = new Paho.MQTT.Message('hello world2');
        //message.destinationName = "test/topic";
        //client.send(message);
    },
    onLoad: function() {

/**
        client.onMessageArrived = function(msg) {
            wx.showToast({
                title: msg.payloadString
            });
        }

        client.onConnectionLost = function(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
        }

        client.connect({
            useSSL: false,
            cleanSession: false,
            keepAliveInterval: 60,
            onSuccess: function() {
                console.log('connected');

                client.subscribe("test/topic", {
                    qos: 1
                });
            }
        });
*/
    }
});
