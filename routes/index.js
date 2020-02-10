var express = require('express');
var router = express.Router();
var Account = require('../model/account');
var UserInfor = require('../model/userInfor');
var Friends = require('../model/friends');
var Message = require('../model/message');
var md5 = require('md5');
var axios = require('axios');
const CircularJSON = require('circular-json');
var start = new Date();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/sign-in', function(req, res) {
  Account.findOne({userName: req.body.userName}, function(err, doc){
    if (err) {
      res.status(401).send({message: 'Internal server error.'});
    } else {
      if (doc == null) {
        res.status(201).send({message: 'Account is not exists.'})
      } else {
        if (doc.password == md5(req.body.password)){
          // Lấy về id của userInfor
          UserInfor.findOne({userName: req.body.userName}, function(err, doc1){
            if (err) {
              res.status(401).send({message: 'Internal server error.'});
            } else {
              res.status(201).send({message: 'OK', checkConfiguration: doc1 == null ? 0 : doc.checkConfiguration, idUserInfor: doc1 == null ? '' : doc1._id});
            }
          });
        } else {
          res.status(201).send({message: 'Password is not correct.'})
        }
      }
    }
  });
});

router.post('/create_account', function(req, res, next){
  var account = {
    userName: req.body.userName,
    password: md5(req.body.password),
    checkConfiguration: 0,
  };
  Account.findOne({userName: req.body.userName}, 
    function(err, doc){
      if (err) {
        res.status(401).send({message: 'Internal server error.'});
      } else {
        if(doc !== null) {
          if(doc.userName == req.body.userName){
            res.status(201).send({message: 'Username already exists'})
          }
        } else {
          Account.create(account, function(err, success){
            if(err){
              console.log(err);
              res.status(401).send({message: 'Internal server error.'});
            }else{
              res.status(201).send({message: 'OK'});
            }
          })
        }
      }
  });
 });

 router.post('/get_user_infor', function(req, res){
   try {
      UserInfor.findById(req.body.userInforId, function(err, doc){
        if(err){
         return res.status(401).send({message: 'Internal server error.'});
        }else{
          res.status(200).send(doc);
        }
      })
   } catch (error) {
    return res.status(401).send({message: 'Internal server error.'});
   }
  
});

 router.post('/get_all_friend', function(req, res){
  UserInfor.findById(req.body.userId, function(err, doc){
    if(err){
      res.status(401).send({message: 'Internal server error.'});
    }else{
      try {
        UserInfor.find({'_id': {$in : doc.friends}}, function(err, doc){
          if (err) {
            res.status(401).send({message: 'Internal server error.'});
          } else {
            res.status(201).send(doc);
          }
        })
      } catch (error) {
        res.status(401).send({message: 'Internal server error.'});
      }
     
    }
  })
});

router.post('/get_all_friend_request', function(req, res){
  Friends.find({requester: req.body.idRequester}).populate('recipient').exec(function(err, doc){
    if( err){
      res.status(401).send({message: 'Internal server error.'});
    } else {
      res.status(201).send(doc);
    }
  })
});

 router.post('/create_user_information', function(req, res){
  var userInfor = {
    userName: req.body.userName,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    avatarURL: req.body.avatarURL
  };
  UserInfor.create(userInfor, function(err, doc){
    if(err){
      res.status(401).send({message: 'Internal server error.'});
    }else{
      Account.update({userName: req.body.userName}, { $set: { checkConfiguration: 1}}).exec();
      res.status(201).send({message: 'OK', id: doc._id});
    }
  });          
 });

 router.post('/update_user_information', function(req, res){
  var userInfor = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    avatarURL: req.body.avatarURL
  };
  UserInfor.findOneAndUpdate({userName: req.body.userName}, userInfor, function(err, doc){
    if(err){
      res.status(401).send({message: 'Internal server error.'});
    }else{
      res.status(201).send({message: 'OK'});
    }
  });          
 });

router.post('/request_friend', function(req, res){
  var requestDocument = {
    requester: req.body.requesterId,
    recipient: req.body.recipientId,
    status: 0
  };
  var receiveDocument = {
    requester: req.body.recipientId,
    recipient: req.body.requesterId,
    status: 1
  }
  Friends.insertMany([requestDocument, receiveDocument], function(err){
    if (err){
      res.status(401).send({message: 'Internal server error.'});
    } else {
      res.status(201).send({message: 'OK'});
    }
  })
});

router.post('/accept_friend', function(req, res){
  Friends.deleteMany({requester: {$in: [req.body.userId, req.body.friendId]}}, function(err){
    if (err) {
      res.status(401).send({message: 'Internal server error.'});
    } else {
      UserInfor.findOneAndUpdate({_id: req.body.userId}, {$push: {friends: req.body.friendId}}).exec();
      UserInfor.findOneAndUpdate({_id: req.body.friendId}, {$push: {friends: req.body.userId}}).exec();
      res.status(201).send({message: 'OK'});
    }
  });
});

router.post('/unfriend', function(req, res){
  UserInfor.findOneAndUpdate({_id: req.body.userId}, {$pull: {friends: req.body.unfriendId}}, function(err){
    if(err){
      res.status(401).send({message: 'Internal server error.'});
    } else {
      UserInfor.findOneAndUpdate({_id: req.body.unfriendId}, {$pull: {friends: req.body.userId}}).exec();
      res.status(201).send({message: 'OK'});
    }
  });
});

router.post('/cancle_request', function(req, res){
  Friends.deleteMany({requester: {$in: [req.body.idCancle, req.body.userId]}}, function(err){
    if (err) {
      res.status(401).send({message: 'Internal server error.'});
    } else {
      res.status(201).send({message: 'OK'});
    }
  });
});

router.post('/find_friend', function(req, res){
  //Lấy ds bạn bè
  UserInfor.findOne({userName: req.body.userName}, function(err, doc){
    if(err){
      res.status(401).send({message: 'Internal server error.'});
    } else {
      var conditions = {};
      if( doc === null) {
        conditions = {
          $text: {$search: req.body.searchValue},
          userName: {$ne: req.body.userName},
        }
      } else {
        conditions = {
          $text: {$search: req.body.searchValue},
          userName: {$ne: req.body.userName},
          _id: {$nin: doc.friends}
        }
      }
    
      UserInfor.find(conditions, function(err, doc){
        if (err) {
          res.status(401).send({message: 'Internal server error.'});
        } else {
          res.status(201).send(doc);
        }
      })
    }
  })
});

router.post('/store_message', function(req, res){
  var message = {
    sender: req.body.sender,
    receiver: req.body.receiver,
    content: req.body.content
  };
  
  Message.create(message, function(err){
    if( err) {
      res.status(401).send({message: 'Internal server error.'});
    } else {
      res.status(201).send({message: 'OK'});
    }
  })
});

router.post('/get_list_message', function(req, res){
  var condition = {
    $or: [
      {$and: [{sender: req.body.idUserInfor}, {receiver: req.body.chosenFriend}]},
      {$and: [{sender: req.body.chosenFriend}, {receiver: req.body.idUserInfor}]}
    ]
  }
  Message.find(condition, function(err, doc){
    if( err) {
      res.status(401).send({message: 'Internal server error.'});
    } else {
      res.status(201).send(doc)
    }
  });
});
 

module.exports = router;
