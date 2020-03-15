/* jslint node: true */
"use strict";

var schedule = require('node-schedule');

exports.scheduleForEveryNight = function (callback) {
  var rule = new schedule.RecurrenceRule();
  rule.hour = 4;
  rule.minute = 0;
  var j = schedule.scheduleJob(rule, callback);
};