/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for completions
var messageSchema = new Schema({
  ugKthid: String,
  message: String
});

var Message = mongoose.model("Message", messageSchema);
module.exports = Message;
