var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/movieServer", {useNewUrlParser: true}, function(err){
    if(err){
        console.log('Connection Error.' + err)
    }else{
        console.log('Connection success!')
    }
});
module.exports = mongoose;