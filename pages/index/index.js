//index.js
//获取应用实例
const app = getApp()
var remoteUrl = app.globalData.remoteUrl;
var requestUserName = app.globalData.requestUserName;
var requestPwd = app.globalData.requestPwd;
var currentTextId = 1;
Page({
  data: {
    motto: '读取数据...',
    flag:0,
    rank:'0.00',
    level:'0.00',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onShow: function (options){
    var that = this;
    var requestFullUrl = remoteUrl + "/getTextToPronounce" + "/" +  requestUserName + "/" + requestPwd + "/" + currentTextId;
    console.log("requestUrl:" + requestFullUrl);
    wx.request({
      url: requestFullUrl,
      success:function(res){
        console.log(res.data);
        that.setData({
          motto: "请念:"+res.data
        })
      }
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this  
    app.getUserInfo(function (userInfo) {
      //更新数据  
      that.setData({
        userInfo: userInfo
      })
    })  
    
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  startRecode:function(){
    var s = this;
    console.log("start");
    wx.startRecord({
      success: function (res) {
        console.log(res);
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        s.setData({ recodePath: tempFilePath, isRecode: true });
      },
      fail: function (res) {
        console.log("fail");
        console.log(res);
        //录音失败  
      }
    });  
  },
  endRecode: function () {//结束录音   
    var s = this;
    console.log("end");
    wx.stopRecord();
    s.setData({ isRecode: false });
    wx.showToast(); 
    setTimeout(function () {
      var urls = remoteUrl + "upVoice";
      console.log(s.data.recodePath);
      console.log("uploadUrl:" + urls);
      wx.uploadFile({
        url: urls,
        filePath: s.data.recodePath,
        name: 'voice',
        header: {
          'content-type': 'multipart/form-data'
        },
        success: function (res) {
          var str = res.data;
          var data = JSON.parse(str);
          if (data.states == 1) {
            s.setData({ 
              rank: "南京话得分:"+data.rank,
              level:"打败了"+data.level+"%的人",
              flag:1 
              });
          }
          else {
            wx.showModal({
              title: '提示',
              content: data.message,
              showCancel: false,
              success: function (res) {
              }
            });
          }
          wx.hideToast();
        },
        fail: function (res) {
          console.log(res);
          wx.showModal({
            title: '提示',
            content: "网络请求失败，请确保网络是否正常",
            showCancel: false,
            success: function (res) {

            }
          });
          wx.hideToast();
        }
      });
    }, 1000)  
  }  
})
