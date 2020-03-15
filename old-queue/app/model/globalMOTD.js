/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for global MOTD
var globalMOTDSchema = new Schema({
  message: { type: String, default: '' },
});

// Updates the MOTD
globalMOTDSchema.methods.addGlobalMOTD = function (message) {
  this.message = message;
  this.save();
};

var GlobalMOTD = mongoose.model("GlobalMOTD", globalMOTDSchema);
module.exports = GlobalMOTD;