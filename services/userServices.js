const moment = require("moment");
const { generateCode } = require('../helper/userHelper');
const { Registration } = require('../models/userModel');
const crypto = require('crypto');
var axios = require('axios');

const addUser = async (userDetails, pass,mystr, created ) => {
  let ref_code = generateCode();
  let otp = Math.floor(Math.random() * 900000) + 100000;
  const userObject = {
    name: userDetails.name,
    first_name: '',
    last_name: '',
    email: userDetails.email,
    password: pass,
    created_at: created,
    email_verify_status: 'pending',
    mobile_no: userDetails.mob,
    address: '',
    user_address: '',
    country: '',
    state: '',
    city: '',
    status: 'active',
    profile_image: '',
    otp: otp
  };
  try {
    const user = new Registration(userObject);
    await user.save();
    console.log("user",user);
    return userObject;
  } catch (error) {
    return null;
  }
};

const checkUser = async (email) => {
    let user = await Registration.findOne({ 'email': email });
    if (user) {
      return user;
    }
  };

  const checkUserPass = async (email, password) => {
    let user = await Registration.findOne({ 'email': email, 'password': password });
    if (user) {
      return user;
    }
  };

  const checkUserId = async (user_id) => {
    let user = await Registration.findOne({ '_id': user_id });
    if (user) {
      return user;
    }
  };

  const createCipher = async (text) => {
    let mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
    let mystr1 = mykey1.update(text, 'utf8', 'hex')
    mystr1 += mykey1.final('hex');
    return mystr1;
  };

  const updateUserPassword = async (email, password) => {
    try {
      let user = await Registration.findOne({ 'email': email });
      if (user) {
        await Registration.update({ 'email': email }, { $set: { password: password } });
      }
      let userUpdated = await Registration.findOne({ 'email': email });
      return userUpdated;
    } catch (error) {
      return null;
    }
  };
  
  const createAtTimer = async () => {
    let indiaTime1 = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
    let indiaTime = new Date(indiaTime1);
    let created_at = indiaTime.toLocaleString();
    return created_at;
  };

  const updateEmailStatus = async (id) => {
    try {
      let user = await Registration.findOne({ '_id': id });
      if (user) {
        await Registration.update({ '_id': id }, { $set: { email_verify: 'verified', otp: null } });
      }
      let userUpdated = await Registration.findOne({ '_id': id });
      return userUpdated;
    } catch (error) {
      return null;
    }
  };

  const updateARTUser = async (email, name) => {
    try {
      var data = JSON.stringify({
        "pass" : "toIbb5gvcKHCBvF1qr6hihMYU",
        "email" : email,
        "name" : name
      });
      var config = {
        method: 'post',
        url: 'https://theartw.com/api/profile/update',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      let response = await axios(config);
      let status = response.data.status;
      return status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
module.exports = {
    addUser,
    checkUser,
  checkUserPass,
  checkUserId,
  createCipher,
  updateUserPassword,
  createAtTimer,
  updateEmailStatus,
  updateARTUser
  };