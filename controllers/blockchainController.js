const { compareSync } = require("bcryptjs");
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const { mail } = require('../helper/mailer');
const {AdminCoinTransfer} = require('../helper/ethHelper');

const signupReward = '50';
const referReward = '10';
const coinFees = '1';
const adminAddress = process.env.ADMIN;


const createWallet = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let passphrase = "";
    let test = req.session.is_user_logged_in;
    if (test != true) {
        res.redirect('/login');
    }
    else {
        let passphraseNew = await blockchainServices.createWallet();
        if (passphraseNew) {
            console.log("system",passphrase)
            passphrase = passphraseNew;
        }
        res.render('dash-private-key', { err_msg, success_msg, passphrase, layout: false, session: req.session });
    }
}

const verifyWallet = async (req, res) => {
    let user_passphrase = req.body.passphrase;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let test = req.session.is_user_logged_in;
    if (test != true) {
        res.redirect('/login');
    } else {
        res.render('verify-private-key', { err_msg, success_msg, user_passphrase, layout: false, session: req.session });
    }
}

// const submitWallet = async (req, res) => {
//     let user_id = req.session.re_us_id;
//     let user_passphrase = req.body.passphrase.trim();
//     let check_passphrase = req.body.check_key.trim();
//     let hash = await blockchainServices.createHash(user_passphrase);
//     if (user_passphrase == check_passphrase) {
//         let created = await userServices.createAtTimer();
//         let address = await blockchainServices.checkWalletPrivate(user_passphrase);
//         let dummyUser = await userServices.checkUserId(user_id);
//         // let status = await blockchainServices.addARTwallet(dummyUser.email, address);
//         // console.log(status);
//         // if(status == 1){
//             let UserwalletData = await blockchainServices.userWalletEntry(user_id, address, hash, created);
//             if (UserwalletData) {
//                 let walletData = blockchainServices.userWalletFindWallet(address);
//                 let user = await userServices.checkUserId(user_id);
//                 let sendReward = parseInt(signupReward);
//                 if(user.ref_from){
//                 //     // let hashObject = await AdminCoinTransfer(address, referReward);
//                     sendReward = sendReward + parseInt(referReward);
//                 //     // let hash = hashObject.transactionHash;
//                 //     // await blockchainServices.addTransaction(user_id, walletData._id, adminAddress, address, hash, referReward, 'ARTW');
//                     let userRefer = await userServices.checkUserReferCode(user.ref_from);
//                     let subject = 'Referral bonus credited.'
//                     let text = 'Hello '+ user.email + ',<br><br>\n\n' +
//                     'Congratulations we have credited your ARTW account by 5 ARTW (worth US$5) as your friend signed up using your referral code!<br><br>\n\n' + 
//                     'Earn more ARTW by referring your friends and stand a chance to win exclusive ARTW NFTs !!' + '<br><br>\n\n' + 'Regards,<br>\nTeam THEARTW<br>\nhttps://theartwcoin.com';
//                     await mail(user.email, subject, text);
//                     let userReferred = await userServices.checkUserWallet(userRefer._id);
//                     let referAddress = userReferred.wallet_address;
//                     let hashObject2 = await AdminCoinTransfer(referAddress, referReward);
//                     let hash2 = hashObject2.transactionHash;
//                     await blockchainServices.addTransaction(userRefer._id, userReferred._id, adminAddress, referAddress, hash2, referReward, 'ARTW');
//                     if(hashObject2){
//                         await userServices.refUpdate(user.ref_code, user.ref_from);
//                     }
//                 }
//                 let finalSend = sendReward.toString();
//                 let hashObject3 = await AdminCoinTransfer(address, finalSend);
//                 console.log(finalSend,'-------------------finalSend',typeof finalSend);
//                 let hash3 = hashObject3.transactionHash;
//                 await blockchainServices.addTransaction(user_id, walletData._id, adminAddress, address, hash3, finalSend, 'ARTW');
//                 let userwallet = await blockchainServices.userWalletFindWallet(address);
//                 await blockchainServices.importWalletEntry(user_id, userwallet._id, created);
//                 res.redirect('/Create-wallet-success?wallet=' + Buffer.from(address).toString('base64'));
//             }
//             else {
//                 req.flash('err_msg', 'Something went wrong.');
//                 res.redirect('/Create-wallet-dash');
//             }
//         // }
//         // else {
//         //     req.flash('err_msg', 'Something went wrong.');
//         //     res.redirect('/Create-wallet-dash');
//         // }
//     }
//     else {
//         res.redirect('/verify-key');
//     }
// }
const submitWallet = async (req, res) => {
    let user_id = req.session.re_us_id;
    let user_passphrase = req.body.passphrase.trim();
    let check_passphrase = req.body.check_key.trim();
    let hash = await blockchainServices.createHash(user_passphrase);
    if (user_passphrase == check_passphrase) {
        let created = await userServices.createAtTimer();
        let address = await blockchainServices.checkWalletPrivate(user_passphrase);
        let UserwalletData = await blockchainServices.userWalletEntry(user_id, address, hash, created);
        if (UserwalletData) {
            let user = await userServices.checkUserId(user_id);
            // if(user.ref_from){
            //     await AdminCoinTransfer(address, referReward);
            //     let userRefer = await userServices.checkUserReferCode(user.ref_from);
            //     let subject = 'Referral bonus credited.'
            //     let text = 'Hello '+ user.email + ',<br><br>\n\n' +
            //     'Congratulations we have credited your ARTW account by 10 ARTW (worth US$10) as your friend signed up using your referral code!<br><br>\n\n' + 
            //     'Earn more ARTW by referring your friends and stand a chance to win exclusive ARTW NFTs !!' + '<br><br>\n\n' + 'Regards,<br>\nTheArtW Team<br>\nhttps://theartwcoin.com';
            //     await mail(user.email, subject, text);
            //     let userReferred = await userServices.checkUserWallet(userRefer._id);
            //     let referAddress = userReferred.wallet_address;
            //     let hashObject = await AdminCoinTransfer(referAddress, referReward);
            //     if(hashObject){
            //         await userServices.refUpdate(user.ref_code, user.ref_from);
            //     }
            // }
            // console.log("reward",signupReward)
            // await AdminCoinTransfer(address, signupReward);
            // let userwallet = await blockchainServices.userWalletFindWallet(address);
            // await blockchainServices.importWalletEntry(user_id, userwallet._id, created);
 // await AdminCoinTransfer(address, signupReward);
            // let userwallet = await blockchainServices.userWalletFindWallet(address);
            // await blockchainServices.importWalletEntry(user_id, userwallet._id, created);

            if(user.ref_from){
                await AdminCoinTransfer(address, referReward);
                let userRefer = await userServices.checkUserReferCode(user.ref_from);
                let subject = 'Referral bonus credited.'
                let text = 'Hello '+ user.email + ',<br><br>\n\n' +
                'Congratulations we have credited your ARTW account by 10 ARTW (worth US$10) as your friend signed up using your referral code!<br><br>\n\n' + 
                'Earn more ARTW by referring your friends and stand a chance to win exclusive ARTW NFTs !!' + '<br><br>\n\n' + 'Regards,<br>\nTheArtW Team<br>\nhttps://theartwcoin.com';
                await mail(user.email, subject, text);
                let userReferred = await userServices.checkUserWallet(userRefer._id);
                let referAddress = userReferred.wallet_address;
                let hashObject = await AdminCoinTransfer(referAddress, referReward);
                if(hashObject){
                    await userServices.refUpdate(user.ref_code, user.ref_from);
                }
            }
            console.log("reward",signupReward)
            await AdminCoinTransfer(address, signupReward);
            let userwallet = await blockchainServices.userWalletFindWallet(address);
            await blockchainServices.importWalletEntry(user_id, userwallet._id, created)
            res.redirect('/Create-wallet-success?wallet=' + Buffer.from(address).toString('base64'));
        }
        else {
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/Create-wallet-dash');
        }
   
    }
    else {
        res.redirect('/verify-key');
    }
}

module.exports = {
    createWallet,
    verifyWallet,
    submitWallet
};