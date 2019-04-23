var mongoose = require("../common/db");
var movie = new mongoose.Schema({
    movieId: String,
    movieName: String,
    movieImg: String,
    movieVideo: String,
    movieDownload: String,
    movieTime: String,
    movieNumDownload: Number,
    movieNumSuppose: Number,
    movieMainPage: Boolean
})
movie.static.findById = function(movieId, callBack){
    this.find({movieId: movieId}, callBack);
}

var movieModel = mongoose.model('movie', movie)

module.exports = movieModel