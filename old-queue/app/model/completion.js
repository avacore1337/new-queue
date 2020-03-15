/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for completions
var completionSchema = new Schema({
  ugKthid: String,
  assistant: String
});

var Completion = mongoose.model("Completion", completionSchema);
module.exports = Completion;
