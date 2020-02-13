var m = require('mithril');

export default {

  getAllSymbols: (cb) => {
    m.request({
      method: "GET",
      url: `${baseUrl[env]}/vfs/?path=`
    })
    .then(cb)
  }

}