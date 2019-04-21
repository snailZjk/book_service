var mongoose = require("../common/db")
var mail = new mongoose.Schema({
    mailToUser: String,
    mailFromUser: String,
    mailTitle: String,
    mailContext: String,
    mailSendTime: String
})

