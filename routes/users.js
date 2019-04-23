var express = require('express');
var router = express.Router();
//引用相关的文件和代码包
var user = require('../models/user');
var crypto = require('crypto');
var movie = require('../models/movie');
var mail = require('../models/mail');
var comment = require('../models/comment');
const init_token = 'TKL02o';

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

//用户登录接口
router.post('/login', function (req, res, next) {
  //验证完整性，这里使用简单的if方式，可以使用正则表达式对输入的格式进行验证
  if (!req.body.username) {
    res.json({status: 1, message: "用户名为空"})
  }
  if (!req.body.password){
    res.json({status: 1, message: "密码为空"})
  }
  user.findUserLogin(req.body.username, req.body.password, function(err, userSave) {
    if (userSave.length != 0) {
      //通过MD5查看密码
      var token_after = getMD5Password(userSave[0]._id)
      res.json({status: 0, data: {tpken: token_after, user: userSave}, message: "用户登录成功！"})
    } else {
      res.json({status: 1, message: "用户名或者密码错误"})
    }
  })
});

//用户注册接口
router.post('/register', function (req, res, next){
  if(!req.body.username){
    res.json({status: 1, message: "用户名为空"});
  }
  if(!req.body.password){
    res.json({status: 1, message: "密码为空"});
  }
  if(!req.body.userMail){
    res.json({status: 1, message: "用户邮箱为空"});
  }
  if(!req.body.userPhone){
    res.json({status: 1, message: "用户手机为空"});
  }
  user.findByUsername(req.body.username, function (err, userSave){
    if(userSave.length != 0){
      //返回错误信息
      res.json({status: 1, message: "用户已被注册"});
    }else{
      var registerUser = new user({
        username: req.body.username,
        password: req.body.password,
        userMail: req.body.userMail,
        userPhone: req.body.userPhone,
        userAdmin: 0,
        userPower: 0,
        userStop: 0
      })
      registerUser.save(function () {
        res.json({status: 0, message: "注册成功"});
      })
    }
  })
});

//用户提交评论
router.post('/postComment', function (req, res, next){
  //验证完整性！！！
  if(!req.body.username) {
    var username = "匿名用户"
  }
  if(!req.body.movie_id) {
    res.json({status: 1, message: "电影ID为空"})
  }
  if (!req.body.context) {
    res.json({status: 1, message: "评论内容为空"})
  }

  //根据数据集建立一个新的数据内容
  var saveComment = new comment({
    movie_id: req.body.movie_id,
    username: req.body.username ? req.body.username :username,
    context: req.body.context,
    check: 0
  })
  //保存合适的数据集
  saveComment.save(function(err) {
    if(err){
      res.json({status:1, message: err})
    }else {
      res.json({status: 0, message: "评论成功"})
    }
  })
});

//用户点赞                          待测试
router.post('support', function (req, res, next){
  if(!req.body.movie_id) {
    res.json({status: 1, message: "电影ID传递失败"});
  }
  movie.findById(req.body.movie_id, function (err, supportMovie){
    //更新操作
    movie.update({_id: req.body.movie_id}, {movieNumSuppose: supportMovie.movieNumSuppose + 1}, function (err) {
      if(err){
        res.json({status: 1, message: "用户点赞失败", data: err})
      }
      res.json({status: 0, message: "点赞成功"})
    })
  })
});

//用户下载只返回下载地址
router.post('/download', function (req, res, next){
  //验证完整性
  if(!releaseEvents.body.movie_id) {
    res.json({status: 1, message: "电影ID传递失败"})
  }
  movie.findById(req.body.movie_id, function(err, supportMovie) {
    //更新操作
    movie.update({_id: req.body.movie_id}, {movieNumDownload: supportMovie.movieNumDownload + 1}, function(err){
      if(err){
        res.json({status: 1, message: "下载链接获取失败", data: err})
      }
      res.json({status: 0, message: "下载成功", data: supportMovie.movieDownload})
    })
  })
})

//用户找回密码
router.post('/findPassword', function (req, res, next){
  if (req.body.repassword){
    //当存在时验证其登陆情况或者验证其code
    if(req.body.token){
      //当存在code登录状态时，验证其状态
      if(!req.body.user_id){
        res.json({status: 1, message: "用户登录错误"})
      }
      if(!req.body.password) {
        res.json({status: 1, message: "用户老密码错误"})
      }
      if(req.body.token == getMD5Password(req.body.user_id)){
        user.findOne({_id: req.body.user_id, password: req.body.password}, function(err, checkUser) {
          if(checkUser) {
            user.update({_id:req.body.user_id}, {password: req.body.repassword}, function(err, userUpdate){
              if(err){
                res.json({status: 1, message: "更改错误", data: err})
              }
              res.json({status: 0, message: "更改成功", data: userUpdate})
            })
          }else {
            res.json({status: 1, message: "用户老密码错误"})
          }
        })
      }else {
        res.json({status: 1, message: "用户登录错误"})
      }
    }else {
    //不存在code时，直接验证mail和phone
      user.findUserPassword(req.body.username, req.body.userMail, req.body.userPhone, function(err, userFound){
        if(userFound.length != 0){
          user.update({_id: userFound[0]._id}, {password: req.body.repassword}, function(err, userUpdate){
            if(err){
              res.json({status: 1, message: "更改错误", data: err})
            }
            res.json({status: 0, message: "更改成功", data: userUpdate})
          })
        }else {
          res.json({status: 1, message: "信息错误"})
        }
      })
    }
  }else {
    //这里只是验证mail和phone，返回验证成功提示和提交的字段，用于改密码之后的操作
    if(!req.body.username){
      res.json({status: 1, message: "用户名称为空"})
    }
    if(!req.body.userMail){
      res.json({status: 1, message: "用户邮箱为空"})
    }
    if(!req.body.userPhone){
      res.json({status: 1, message: "用户手机为空"})
    }
    user.findUserPassword(req.body.username, req.body.userMail, req.body.userPhone, function(err, userFound){
      if(userFound.length != 0){
        res.json({status: 0, message: "验证成功，请修改密码", data: {username: req.body.username, userMail: req.body.userMail, userPhone: req.body.userPhone}})
      }else {
        res.json({status: 1, message: "信息错误"})
      }
    })
  }
});

//用户发送站内信
router.post('/sendEmail', function (req, res, next){
  //验证完整性
  if(!req.body.token){
    res.json({status: 1, message: "用户登录状态错误"})
  }
  if(!req.body.user_id){
    res.json({status: 1, message: "用户登录状态错误"})
  }
  if(!req.body.toUserName){
    res.json({status: 1, message: "未选择相关用户"})
  }
  if(!req.body.title){
    res.json({status: 1, message: "标题不能为空"})
  }
  if(!req.body.context){
    res.json({status: 1, message: "内容不能为空"})
  }
  if(req.body.token == getMD5Password(req.body.user_id)){
    //现获取要发送至用户的ID
    user.findByUsername(req.body.toUserName, function(err, toUser){
      if(toUser.length != 0){
        var NewEmail = new mail({
          fromUser: req.body.user_id,
          toUser: toUser[0]._id,
          title:req.body.title,
          context: req.body.context
        })
        NewEmail.save(function() {
          res.json({status: 0, message: "发送成功"})
        })
      } else {
        res.json({status: 1, message: "您发送的对象不存在"})
      }
    })
  } else {
    res.json({status: 1, message: "用户登录错误"})
  }
});
//用户显示站内信， 其中receive参数值为1时是发送的内容，值为2时是收到的内容
router.post('/users/showEmail', function (req, res, next){
  if (!req.body.token){
    res.json({status: 1, message: "用户登录状态错误"})
  }
  if (!req.body.user_id){
    res.json({status: 1, message: "用户登录状态错误"})
  }
  if (!req.body.receive){
    res.json({status: 1, message: "参数错误"})
  }
  if (req.body.token == getMD5Password(req.body.user_id)){
    if (req.body.receive == 1) {
      //发送站内信
      mail.findByFromUserId(req.body.user_id, function (err, sendMail){
        res.json({status: 0, message: "获取成功", data: sendMail})
      })
    }else {
      mail.findByToUserId(req.body.user_id, function (err, receiveMail){
        res.json({status: 0, message: "获取成功", data: receiveMail})
      })
    }
  } else {
    res.json({status: 1, message: "用户登录失败"})
  }
})

//获取MD5值
function getMD5Password(id){
  var md5 = crypto.createHash('md5');
  var token_before = id + init_token;
  // res.json(userSave[0]._id)
  return md5.update(token_before).digest('hex');
}

module.exports = router;
