var mongoose = require("../common/db")
var article = new mongoose.Schema({
    articleTitle: String,
    articleContext: String,
    articleTime: String
})
