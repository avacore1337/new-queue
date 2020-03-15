/* jslint node: true */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema used for bookings
var bookingSchema = new Schema({
  users: [String],
  time: { type: Number, default: 0},
  length: { type: Number, default: 0},
  comment: String,
});


var Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;