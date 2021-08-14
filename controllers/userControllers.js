const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH, coinBalanceETH } = require('../helper/ethHelper');
const {Tokendetails} = require('../models/userModel');


const sessionHeader = async (req, res, next) => {
    
    res.locals.session = req.session;
    let user_id = res.locals.session.re_us_id;
    let result = userServices.checkUserId(user_id);
    if (result) {
        res.locals.greet = function () {
            return result;
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    }
    else {
        return null;
    }
}

const logout = async (req, res) => {
    req.session.destroy();
    res.redirect('/signup');
}

const landingPage = async (req, res) => {
    let rates = await userServices.getRates();
    if (rates) {
        res.render('index', {
            token_values: rates
        });
    }
    else {
        res.render('index');
    }
}


const dashboardPage = async (req, res) => {
    console.log("Welcome to dashboard")
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let test = req.session.is_user_logged_in;
    if (test != true) {
        res.redirect('/Login');
    }
    else {
        let user_id = req.session.re_us_id;
        let user_wallet = req.session.wallet;
        let user = await userServices.checkUserId(user_id);
        let ref_code = user.ref_code;
        let rates = await userServices.getRates();
        let usdValue = rates.usdValue;
        let etherValue = rates.etherValue;
        // let btcValue = rates.btcValue;
        // let bnbValue = rates.bnbValue;
        let loginwallet = await blockchainServices.importWalletFindId(user_id);
        console.log("login wallet",loginwallet)
        if (loginwallet) {
            let result = await blockchainServices.userWalletFindId(loginwallet.wallet_id);
            console.log("in dashboard results",result)
            if (result) {
                req.session.wallet = true;
                let wallet_creation = result.created_at;
                let today = await userServices.createAtTimer();
                let wallet_time_difference = calculateHours(new Date(wallet_creation), new Date(today));
                wallet_details = result;
                import_wallet_id = loginwallet._id;
                let all_transaction = await blockchainServices.findTransactions(wallet_details.wallet_address);
                await blockchainServices.checkTxStatus(all_transaction);
                all_transaction = await blockchainServices.findTransactions(wallet_details.wallet_address);
                let balance = await blockchainServices.getCoinBalance(wallet_details.wallet_address);
                let rown_bal = balance;
                // let bnbBalance = await balanceMainBNB(wallet_details.wallet_address);
                let ethBalance = await balanceMainETH(wallet_details.wallet_address);
                let coinbalance = await coinBalanceETH(wallet_details.wallet_address);
                // let usdbalance = await usdBalanceUSD(wallet_details.wallet_address);
                let usd_value = Math.round(usdValue * coinbalance * 100) / 100;
                let usd_actual = (1 / parseFloat(usdValue)) * coinbalance;
                // let bnb_value = (1 / parseFloat(bnbValue)) * bnbBalance;
                let eth_value = (1 / parseFloat(etherValue)) * ethBalance;
                let full_value = coinbalance + eth_value;
                full_value = Math.round(full_value * 100) / 100;
                // res.render('dashboard', { err_msg, success_msg, ref_code, wallet_details, usdValue, etherValue, btcValue, bnbValue, import_wallet_id, balance, rown_bal, layout: false, session: req.session, crypto, all_transaction, wallet_time_difference, moment, bnbBalance, coinbalance, usd_value, ethBalance, full_value });
                res.render('dashboard', { err_msg, success_msg, ref_code, wallet_details, full_value, usdValue, ethBalance, etherValue, import_wallet_id, balance, rown_bal, layout: false, session: req.session, crypto, all_transaction, wallet_time_difference, moment, coinbalance, usd_value,});
            
            }
        }
        else {
            // let usd_value = 0;
            // let bnbBalance = 0;
            // let ethBalance = 0;
            // let coinbalance = 0;
            // res.render('front/dashboard', { err_msg, success_msg, ref_code, wallet_details, usdValue, etherValue, btcValue, bnbValue, import_wallet_id, rown_bal, layout: false, session: req.session, crypto, all_transaction: [], coinbalance, bnbBalance, usd_value, ethBalance });
            req.session.wallet = false;
            res.redirect('/Create-wallet');
        }
    }
}

const loginPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let test = req.session.is_user_logged_in;
    if (test == true) {
        res.redirect('/dashboard');
    }
    else {
        res.render('login', { err_msg, success_msg, layout: false, session: req.session });
    }
}


const sendPage = async (req, res) => {
    res.render('send-uwct')  
}

const signupPage = async (req, res) => {
        let err_msg = req.flash('err_msg');
        let success_msg = req.flash('success_msg');
        let ref_link = "";
        if (req.body.ref_link != "" && req.body.ref_link != undefined) {
            ref_link = req.body.ref_link.trim();
        }
        let test = req.session.is_user_logged_in;
        if (test == true) {
            res.redirect('/dashboard');
        } else {
            if (req.query.code) {
                res.render('signup', { err_msg, success_msg, layout: false, session: req.session, ref_link: req.query.code });
            } else {
                res.render('signup', { err_msg, success_msg, layout: false, session: req.session, ref_link: '' });
            }
        }
    
}

const forgotPage = async (req, res) => {
        let err_msg = req.flash('err_msg');
        let success_msg = req.flash('success_msg');
        var test = req.session.is_user_logged_in;
        if (test == true) {
            res.redirect('/dashboard');
        }
        else {
            res.render('forgot-pass', { err_msg, success_msg, layout: false, session: req.session, });
        }
}


const verifyPage = async (req, res) => {
            let err_msg = req.flash('err_msg');
            let success_msg = req.flash('success_msg');
            var test = req.session.is_user_logged_in;
            if (test == true) {
                res.redirect('/dashboard');
            } else {
                res.render('verify-account', { err_msg, success_msg, layout: false, session: req.session })
            }
}
    

const walletSuccess = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let wallet_address = "";
    let test = req.session.is_user_logged_in;
    if (test != true) {
        res.redirect('/login');
    }
    else {
        if (req.query.wallet) {
            wallet_address = Buffer.from(req.query.wallet, 'base64').toString('ascii');
        }
        res.render('wallet-success', { err_msg, success_msg, wallet_address, layout: false, session: req.session, });
    }
}

const referral = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var test = req.session.is_user_logged_in;
    if (test == true) {
        let user_id = req.session.re_us_id;
        let user = await userServices.checkUserId(user_id);
        // let ref_code = user.ref_code;
        // let referrals = await userServices.findReferData(ref_code);
        res.render('referral-table', { err_msg, success_msg, layout: false, session: req.session})
    } else {
        res.redirect('/login');

    }
}


const submitUser = async (req, res) => {
    
   let user = await userServices.checkUser(req.body.email);
   console.log(req.body)
            if (user)
         {
            
                req.flash('err_msg', 'Email already exists. Please enter another email.');
                res.redirect('/signup');
            }
            
        if (req.body.password == req.body.conf_pass) {
            let mystr = await userServices.createCipher(req.body.password);
            let created = await userServices.createAtTimer();
            let new_user=await userServices.addUser(req.body, mystr, created);
            let user = await userServices.checkUser(req.body.email);
                    await userServices.addUser(req.body);
                    let otp = new_user.otp;
                    req.session.success = true;
                    req.session.re_usr_name = user.name;
                    req.session.re_usr_email = user.email;
                    req.session.is_user_logged_in = false;
                    let subject = 'OTP for your new account on Abu Bakr website';
                    let text = 'Hello ' + req.body.email + ',<br><br>\n\nCongratulations on signing up with Abu Bakr website!<br><br>\n\n' +
                        'Your one-time password (OTP) for signing up is: ' + otp + '. This would be valid only for the next 10 minutes.' +
                        '<br><br>\n\nOnce you enter the OTP and create a new wallet, we will credit it by 50 Abu Bakr (worth US$50)  as a limited-time joining bonus.<br><br>\n\n' +
                        'Moreover, you can earn more by referring your friends and earn US$10 equivalent Abu Bakr tokens every time your friend joins by using your referral code. Your friend will also get US$10 equivalent Abu Bakr tokens for using your referral code !<br><br>\n\n' +
                        'Time: ' + user.created + '<br><br>\n\n'
                    'If this withdrawal attempt was not made by you it means someone visited your account. It may be an indication you have been the target of a phishing attempt and might want to consider moving your funds to a new wallet.' + '<br><br>\n\n' + 'Regards,<br>\nAbu Bakr Team<br>\nhttps://theartwcoin.com';
                    await mail(req.body.email, subject, text);
                    req.flash('success_msg', 'User registered. Please verify to continue.');
                    res.redirect('/verify-account');
                }
                else {
                    req.flash('err_msg', 'Password does not match.');
                    res.redirect('/signup');
                }
}
    
const LoginPost = async (req, res) => {
                let user = await userServices.checkUser(req.body.email);
                let password = req.body.password.trim();
                let mystr = await userServices.createCipher(password);
                if (user) {
                    let userLogin = await userServices.checkUserPass(req.body.email.trim(), mystr);
                   
                    if (userLogin) {
                        let status = userLogin.status;
                        let email_status = userLogin.email_verify;
                    

                        if (status == 'active' ) {
                            req.session.success = true;
                            req.session.re_us_id = userLogin._id;
                            req.session.re_usr_name = userLogin.name;
                            req.session.re_usr_email = userLogin.email;
                            req.session.is_user_logged_in = true;
                            res.redirect('/dashboard');
                        } else {
                            req.flash('err_msg', 'Your account is not verified.');
                            res.redirect('/login')
                        }
                    }
                    else {
                        req.flash('err_msg', 'The username or password is incorrect.');
                        res.redirect('/login');
                    }
                }
                else {
                    req.flash('err_msg', 'Please enter valid Email address.');
                    res.redirect('/login');
                }
            
}
        

const verifyUser = async (req, res) => {
                let user_otp = req.body.otp;
                let email = req.session.re_usr_email;  
                console.log("In controlller verify", email);
                console.log("hiiii");
                let user = await userServices.checkUser(email)
            ;
                console.log("EMAIL",email)
                console.log("In log" , user);
                if (user) {
                    if (user.otp === user_otp) {
                        let userUpdated = await userServices.updateEmailStatus(user._id);
                        if (userUpdated) {
                            req.session.is_user_logged_in = false;
                            res.redirect('/login');
                        }
                        else {
                            req.flash('err_msg', 'Please enter correct secret code.');
                            res.redirect('verify-account');
                        }
                    }
                }
                else {
                    req.flash('err_msg', 'Something went wrong.');
                    res.redirect('verify-account');
                }
}



const submitForgot = async (req, res) => {
    let user = await userServices.checkUser(req.body.email);
    console.log(user)
    if (!user) {
        req.flash('err_msg', 'Please enter registered Email address.');
        res.redirect('/forgot-pass');
    }
    else {
        let new_pass = Math.random().toString(36).slice(-5);
       
        let mystr1 = await userServices.createCipher(new_pass);
        
        let userUpdated = await userServices.updateUserPassword(req.body.email, mystr1);
        if (userUpdated) {
           console.log("passsss")
           let otp = new_pass;

            let subject = 'OTP for changing password.'
            let text = 'Hello ' + req.body.email + ',<br><br>\n\n' +
                'Your one-time password (OTP) for change password is: ' + otp +
                '<br><br>\n\n' + 'This would be valid for only for the next 10 minutes<br><br>\n\n' +
                'If this password change attempt was not made by you it means someone visited your account. It may be an indication you have been the target of a phishing attempt and might want to consider moving your funds to a new wallet.' + '<br><br>\n\n' + 'Regards,<br>\nAbu Bakr Team<br>\nhttps://theartwcoin.com';
            await mail(req.body.email, subject, text);
            req.flash('success_msg', 'Password has been sent successfully to your registered email.');
            res.redirect('/forgot-pass');
        }
        else {
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/forgot-pass');
        }
    }
}

module.exports = {
    sessionHeader,
    dashboardPage,
    referral,
    signupPage,
    LoginPost,
    submitUser,
    forgotPage,
    verifyPage,
    verifyUser,
    submitForgot,
    loginPage,
    walletSuccess,
    sendPage,
    logout,
    landingPage

};
