var express = require('express');
var router = express.Router();
const moment = require('moment');
const auth = require('../config/auth');
const web3 = require('web3');
const crypto = require('crypto');
const Tx = require('ethereumjs-tx');
const userServices = require("../services/userServices");
const userControllers = require('../controllers/userControllers');
const blockchainController = require('../controllers/blockchainController');
const blockchainServices = require("../services/blockchainServices");
const { calculateHours } = require('../helper/userHelper');
const { mail } = require('../helper/mailer');

const { Registration, Userwallet, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ, ContactInfo } = require('../models/userModel');

var isUser = auth.isUser;

//************ to get user data on header using session **********//
router.use(userControllers.sessionHeader);

router.get('/login', userControllers.loginPage);

router.get('/buy-coin', userControllers.buyPage);

router.get('/receive', userControllers.ReceivePage);

router.get('/send-uwct', userControllers.sendPage);

router.get('/signup', userControllers.signupPage);

router.get('/forgot-pass', userControllers.forgotPage);

// router.get('/transaction-table', userControllers.transactionPage);

// router.get('/profile', userControllers.settingPage);

// router.get('/kyc',isUser, userControllers.kycPage);

//***************** verify email **************// 
router.get('/verify-account', userControllers.verifyPage);

router.post('/login', userControllers.LoginPost);

//***************** get dashboard **************//
router.get('/dashboard', isUser, userControllers.dashboardPage);

//***************** get referral-table*************//
router.get('/referral-table', userControllers.referral);

router.get('/terms-condition', function (req, res) {
  res.render('terms-condition');
});


//***************** get create wallet **************//
router.get('/Create-wallet', isUser, blockchainController.createWallet);

/***************** get verfify key **************/
router.post('/Verify-key', isUser, blockchainController.verifyWallet);


//***************** post create wallet **************//
router.post('/submit-create-wallet', isUser, blockchainController.submitWallet);



//***************** get Wallet-success **************//
router.get('/Create-wallet-dash', isUser, function (req, res) {
  res.render('Create-wallet');
});

router.get('/change-password', isUser, function (req, res) {
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/login');
  } else {
    err_msg = req.flash('err_msg');
    success_msg = req.flash('success_msg');
    res.render('change-password', { err_msg, success_msg, layout: false, session: req.session, })
  }
});

//***************** get profile **************//
router.get('/profile', isUser, function (req, res) {
  err_msg = req.flash('err_msg');
  success_msg = req.flash('success_msg');
  var test = req.session.is_user_logged_in;

  if (test != true) {
    res.redirect('/login');
  } else {
    var user_id = req.session.re_us_id;
    Registration.findOne({ '_id': user_id }, function (err, result) {
      if (err) {
        console.log("Something went wrong");
      }
      else {
        // res.send(result);
        res.render('profile', { err_msg, success_msg, result, layout: false, session: req.session, });
      }
    });
  }
});

//***************** post update profile **************//
router.post('/update-profile', isUser, async function (req, res) {
  let user_id = req.session.re_us_id;
  let name = req.body.name.trim();
  let email = req.body.email.trim();
  let mob = req.body.mob.trim();
  let country = req.body.country.trim();

  let status = await userServices.updateARTUser(email, name);
  console.log(status);
  if (status == 1) {
    Registration.update({ _id: user_id }, { $set: { name: name, email: email, mobile_no: mob, country: country } }, { upsert: true }, function (err, result) {
      if (err) {
        console.log("Something went wrong");
        req.flash('err_msg', 'Something went wrong, please try again.');
        res.redirect('/profile');
      } else {
        req.flash('success_msg', 'Profile updated successfully.');
        res.redirect('/profile');
      }
    });
  }
  else {
    req.flash('err_msg', 'Something went wrong, please try again.');
    res.redirect('/profile');
  }
});

//***************** post changes password **************//
router.post('/submit-change-pass', isUser, function (req, res) {
  console.log("change password")
  var user_id = req.session.re_us_id;
  var old_pass = req.body.password;
  var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
  var mystr1 = mykey1.update(old_pass, 'utf8', 'hex')
  mystr1 += mykey1.final('hex');
  Registration.find({ '_id': user_id, 'password': mystr1 }, function (err, result) {
    if (err) {
      req.flash('err_msg', 'Something is worng');
      res.redirect('/change-password');
    } else {
      if (result.length > 0 && result.length == 1) {
        var check_old_pass = result[0].password;
        var mykey2 = crypto.createCipher('aes-128-cbc', 'mypass');
        var new_pass = mykey2.update(req.body.new_password, 'utf8', 'hex')
        new_pass += mykey2.final('hex');

        if (mystr1 != new_pass) {
          console.log(result);
          Registration.update({ _id: user_id }, { $set: { password: new_pass } }, { upsert: true }, function (err) {
            if (err) {
              req.flash('err_msg', 'Something went wrong.');
              res.redirect('/change-password');
            } else {
              req.flash('success_msg', 'Password changed successfully.');
              res.redirect('/change-password');
            }
          });
        }
        else {
          req.flash('err_msg', 'New password can not be same as current password.');
          res.redirect('/change-password');
        }
      }
      else {
        req.flash('err_msg', 'Please enter correct current password.');
        res.redirect('/change-password');
      }
    }
  });
});


router.post('/forgot-pass', userControllers.submitForgot);



router.post('/signup', userControllers.submitUser);

//***************** post login **************//
router.post('/verify-account', userControllers.verifyUser);

//***************** get Transaction-history **************//
router.get('/transaction-table', isUser, function (req, res) {
  err_msg = req.flash('err_msg');
  success_msg = req.flash('success_msg');
  var user_id = req.session.re_us_id;
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/login');
  } else {

    var user_id = req.session.re_us_id;
    Importwallet.findOne({ 'user_id': user_id, 'login_status': 'login' }, function (err, loginwallet) {
      if (err) {
        console.log("Something went wrong");
      }
      else {



        Tokendetails.find({ 'payment_status': 'pending' }, async function (err, response) {
          if (response != "" && response != null && response != undefined) {
            for (var i = 0; i < response.length; i++) {
              console.log(response.length);
              await blockchainServices.checkTxStatus(response);
            }
          }
          else {
            console.log('no record found.');
          }

        });


        //***************** get update transaction status **************//





        if (loginwallet != "" && loginwallet != null && loginwallet != undefined) {
          Userwallet.findOne({ '_id': loginwallet.wallet_id }, function (err, addresponse) {
            if (err) { console.log('Something is worng to Token details.') }
            else {
              var user_wallet = addresponse.wallet_address;

              Tokendetails.find({ $or: [{ 'receiver_wallet_address': addresponse.wallet_address }, { 'sender_wallet_address': addresponse.wallet_address }] }).sort([['auto', -1]]).exec(function (err, response) {

                if (err) { console.log('Something is worng to Token details.') }
                else {

                  var all_transaction = response;
                  res.render('transaction-table', { err_msg, success_msg, user_wallet, all_transaction, address: addresponse.wallet_address, layout: false, session: req.session, moment });

                }
              });
            }
          });

        } else {
          var user_wallet = "";
          var all_transaction = "";
          res.render('transaction-table', { err_msg, success_msg, user_wallet, all_transaction, layout: false, session: req.session, moment });
        }
      }
    });
  }
});


module.exports = router;
