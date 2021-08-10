const moment = require("moment");
const crypto = require('crypto');
const { createWalletHelper,checkWalletPrivateHelper} = require('../helper/ethHelper');
const { Registration, Userwallet, RefCode, Importwallet } = require('../models/userModel');

const createWallet = async () => {
    let newData = await createWalletHelper();
    if(newData){
        return newData;
    }
};

const createHash = async (user_passphrase) => {
    let hash = crypto.createHash('sha256').update(user_passphrase).digest('base64');
    if(hash){
        return hash;
    }
};

const checkWalletPrivate = async (pk) => {
    let newData = await checkWalletPrivateHelper(pk);
    if(newData){
        return newData;
    }
};

const userWalletEntry = async (user_id, address, hash, created) => {
    const UserwalletDataObject = {
        user_id: user_id,
        wallet_address: address,
        passphrase: hash,
        created_at: created,
        status: 'active',
        deleted: '0'
    };
    try {
      const userwallet = new Userwallet(UserwalletDataObject);
      await userwallet.save();
      return UserwalletDataObject;
    } catch (error) {
      console.log("Error", error.message);
    }
};

const userWalletFindWallet = async (address) => {
    let userwallet = await Userwallet.findOne({'wallet_address': address});
    if(userwallet){
        return userwallet;
    }
};

module.exports = {
    createWallet,
    createHash,
    userWalletEntry,
    checkWalletPrivate,
    userWalletFindWallet
};