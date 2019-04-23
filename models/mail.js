var mongoose = require("../common/db")
var mail = new mongoose.Schema({
    toUser: String,
    fromUser: String,
    title: String,
    context: String,
    sendTime: String
})

mail.static.findByToUserId = function (user_id, callBack) {
    this.find({toUser: user_id}, callBack)
}
mail.static.findByFromUserId = function (user_id, callBack) {
    this.find({fromUser: user_id}, callBack)
}

var mailModel = mongoose.model('mail', mail)

module.exports = mailModel