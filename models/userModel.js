var mongoose = require('mongoose');

const validator = require('validator');


/**********RegistrationSchema**********/
var RegistrationSchema = mongoose.Schema({

    name: {
        type: String
    },
    first_name: {
        type: String
    },

    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {

            validator: validator.isEmail,
            message: '{VALUE} Entered Invalid Email'
        }

    },
    email_verify: {

        type: String,
        enum:['pending','verified'],
        default :'pending'

    },
    mobile_no: {

        type: String,
        default: null
    },
    address: {

        type: String,
        default: null
    },
    user_address: {

        type: String,
        default: null
    },
    country: {

        type: String,
        default: null
    },
    state: {

        type: String,
        default: null
    },
    city: {

        type: String,
        default: null
    },
    dob: {

        type: String,
        default: null
    },
    password: {
        type: String,

    },

    created_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    },
    deleted_by: {

        type: String,
        default: null
    },

    updated_at: {

        type: String,
        default: null
    },
    status: {

        type: String,
        enum: ['active', 'inactive'],
        default: 'active'

    },
    deleted: {

        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    profile_image: {

        type: String,

    },
    dataURL: {

        type: String,

    },
    qr_secret: {

        type: String,

    },
    qr_status: {

        type: String,

    },
    ref_code: {

        type: String,

    },
    ref_from: {

        type: String,

    },
    otp: {

        type: String,

    },
    auth: {

        type: String,
        enum: ['email', '2fa'],
        default: 'email'
    },
    // link_status:{
    //     type:String,

    // }
    // tokens:[{
    //         access:{
    //             type: String,
    //             required: true
    //         },
    //         token:{

    //             type: String,
    //             required: true
    //         }

    //     }]
});

/**********UserwalletSchema**********/
var Userwalletschema = mongoose.Schema({

    user_id: {
        type: String
    },
    wallet_address: {
        type: String
    },
    passphrase: {
        type: String
    },
    created_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    },
    deleted_by: {

        type: String,
        default: null
    },

    updated_at: {

        type: String,
        default: null
    },
    status: {

        type: String,
        enum: ['active', 'inactive'],
        default: 'active'

    },
    deleted: {

        type: String,
        enum: ['0', '1'],
        default: '0'
    },
});


var Registration = mongoose.model('User_registration', RegistrationSchema);

/**********UserwalletSchema**********/
var Userwalletschema = mongoose.Schema({

    user_id: {
        type: String
    },
    wallet_address: {
        type: String
    },
    passphrase: {
        type: String
    },
    created_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    },
    deleted_by: {

        type: String,
        default: null
    },

    updated_at: {

        type: String,
        default: null
    },
    status: {

        type: String,
        enum: ['active', 'inactive'],
        default: 'active'

    },
    deleted: {

        type: String,
        enum: ['0', '1'],
        default: '0'
    },
});

var Userwallet = mongoose.model('User_wallet', Userwalletschema);

module.exports = {
    Registration: Registration,
    Userwallet: Userwallet
    
};
