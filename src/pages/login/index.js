// pages/login/index.js
// import {
//   getArticleList
// } from "../api/home";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.WxCache.put('userName','宫世源')
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  getPhoneNumber: function (res) {
    const encryptedData = res.detail.encryptedData
    const iv = res.detail.iv
    if (res.detail.encryptedData) {
      //用户按了允许授权按钮
      var that = this;
      wx.login({
        success(res) {
          const code = res.code
          // 根据小程序返回的密钥传给后端获取真正的手机号
          axios({
            url: '/wx/miniProgram/login',
            method: "POST",
            data: {
              code: code
            }
          }).then(({
            res
          }) => {
            if (res.status === 0) {
              axios({
                url: '/wx/miniProgram/getPhoneNumber',
                method: "POST",
                data: {
                  code: code,
                  encryptedData: encryptedData,
                  iv: iv
                }
              }).then(({
                res
              }) => {
                wx.switchTab({
                  url: '../index/index',
                  success: (res) => {}
                })
              })
            }
          })

        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})