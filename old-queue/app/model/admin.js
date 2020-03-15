/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for admins, teachers and teacher assistans
var adminSchema = new Schema({
  username: String,
  ugKthid: String,
  realname: String,
  addedBy: { type: String, default: '' }
});



var Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
