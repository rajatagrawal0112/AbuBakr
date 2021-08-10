const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const { mail } = require('../helper/mailer');
const userServices = require("../services/userServices");

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
    res.redirect('/login');
}

const dashboardPage = async (req, res) => {
    res.render('dashboard')
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

const buyPage = async (req, res) => {
    res.render('buy-coin')  
}
const ReceivePage = async (req, res) => {
    res.render('receive')  
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


// const settingPage = async (req, res) => {
//         let err_msg = req.flash('err_msg');
//         let success_msg = req.flash('success_msg');
    
//         let test = req.session.is_user_logged_in;
//         if (test == true) {
//             res.render('profile', { err_msg, success_msg, layout: false, session: req.session});
//         }
//             else {
//                 res.redirect('/dashboard');
//             }
// }

// const kycPage = async (req, res) => {
//             let err_msg = req.flash('err_msg');
//             let success_msg = req.flash('success_msg');
        
//             let test = req.session.is_user_logged_in;
//             if (test == false) {
//                 res.redirect('/login');
//             }
//                 else {
//                     res.render('kyc', { err_msg, success_msg, layout: false, session: req.session });
//                 }
// }

// const transactionPage = async (req, res) => {
//         let err_msg = req.flash('err_msg');
//         let success_msg = req.flash('success_msg');
    
//         let test = req.session.is_user_logged_in;
//         if (test == true) {
//             res.render('transaction-table', { err_msg, success_msg, layout: false, session: req.session });
//         }
//             else {
//                 res.redirect('/login');
//             }
// }

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

// const verifyUser = async (req, res) => {
//     let user_otp = req.body.otp;
//     let email = req.session.re_usr_email;
//     let user = await userServices.checkUser(email);
//     if (user) {
        
//         if (user.otp === user_otp) {
//             let userUpdated = await userServices.updateEmailStatus(user._id);
//             if (userUpdated) {
//                 req.session.is_user_logged_in = true;
//                 req.session.success = true;
//                 req.session.re_us_id = userLogin._id;
//                 req.session.re_usr_name = userLogin.name;
//                 req.session.re_usr_email = userLogin.email;
//                 res.redirect('login');
//             }
//             else {
//                 req.flash('err_msg', 'Please enter correct secret code.');
//                 res.redirect('verify-account');
//             }
//         }
//     }
//     else {
//         req.flash('err_msg', 'Something went wrong.');
//         res.redirect('verify-account');
//     }
// }



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
    // transactionPage,
    referral,
    // settingPage,
    signupPage,
    LoginPost,
    submitUser,
    forgotPage,
    verifyPage,
    verifyUser,
    submitForgot,
    // kycPage,
    loginPage,
    walletSuccess,
    buyPage,
    ReceivePage,
    sendPage,
    logout

};
