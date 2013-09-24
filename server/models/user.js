var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Schema
 */
var UserSchema = Schema({
    name: String,
    access_token: String,
    firstname: String,
    lastname: String,
    email: String,
    username: String,
    facebook_id: String,
    facebook: {}
});


module.exports = mongoose.model('UserModel', UserSchema);