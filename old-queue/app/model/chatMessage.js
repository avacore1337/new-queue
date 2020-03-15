/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for completions
var chatMessageSchema = new Schema({
  sender: String,
  message: String
});

var chatMessage = mongoose.model("chatMessage", chatMessageSchema);
module.exports = chatMessage;
