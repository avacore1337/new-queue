/* jslint node: true */
"use strict";

//===============================================================

var async = require('async');
var lodash = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Statistic = require('./statistic.js');

var User = require('./user.js');
var userSchema = User.schema;
var Booking = require('./booking.js');
var bookingSchema = Booking.schema;
var Admin = require('./admin.js');
var adminSchema = Admin.schema;
var Completion = require('./completion.js');
var completionSchema = Completion.schema;
var chatMessage = require('./completion.js');
var completionSchema = chatMessage.schema;
var Message = require('./message.js');
var messageSchema = Message.schema;
var chatMessage = require('./chatMessage.js');
var chatMessageSchema = chatMessage.schema;

// Schema used for queues
var queueSchema = new Schema({
  name: String,
  locked: { type: Boolean, default: false },
  hiding: { type: Boolean, default: false },
  motd: { type: String, default: "You can do it!" },
  info: { type: String, default: "Lorem Ipsum !!" },
  queue: {type:[userSchema], default: []},
  bookings: {type:[bookingSchema], default: []},
  teacher: {type:[adminSchema], default: []},
  assistant: {type:[adminSchema], default: []},
  completions: {type:[completionSchema], default: []},
  messages: {type:[messageSchema], default: []},
  chatMessages: {type:[chatMessageSchema], default: []}
});


// Updates the MOTD
queueSchema.methods.setMOTD = function (message) {
  this.motd = message;
  this.save();
};

queueSchema.methods.addChatMessage = function (sender, message) {
  this.chatMessages.push({
    sender: sender,
    message: message
    });
};

//calculates the amount of people that are requesting help
queueSchema.methods.calculateHelp = function () {
  var helpCount = 0;
  for (var i = 0; i < this.queue.length; i++) {
    if(this.queue[i].help){
      helpCount += 1;
    }
  }
  return helpCount;
};

// Returns true if the given user has a completion, otherwise false
queueSchema.methods.hasCompletion = function (ugKthid) {
  var ret = false;
  this.completions.forEach(function (completion, i, completions) {
    // console.log("Current completion : " + JSON.stringify(completion));
    if (completion.ugKthid === ugKthid) {
      ret = true;
    }
  });
  return ret;
};

// Returns true if the given user has a completion, otherwise false
queueSchema.methods.getMessagesFor = function (ugKthid) {
  var retList = [];
  this.messages.forEach(function (message, i, messages) {
    if (message.ugKthid === ugKthid) {
      // console.log("Found a message for user '" + ugKthid + "', it is : " + JSON.stringify(message));
      retList.push(message.message);
    }
  });
  return retList;
};

// Adds a new completion
queueSchema.methods.addCompletion = function (completion) {
  this.completions.push({ugKthid: completion.ugKthid, assistant: completion.assistant});
  if(completion.task){
    this.messages.push({ugKthid: completion.ugKthid, message: completion.task});
  }
  this.save();
};

// Removes the completion for the given user
queueSchema.methods.removeCompletion = function (ugKthid) {
  this.completions = this.completions.filter(function (completion) {
    return completion.ugKthid !== ugKthid;
  });
  this.save();
};

// Removes all completions
queueSchema.methods.clearCompletions = function (ugKthid) {
  this.completions = [];
  this.save();
};

// Returns true if the given user is in the queue, otherwise false
queueSchema.methods.inQueue = function (ugKthid) {
  for(var i = 0; i < this.queue.length; i++){
    if(ugKthid === this.queue[i].ugKthid){
      return true;
    }
  }
  return false;
};

// Updates the Info
queueSchema.methods.setInfo = function (message) {
  this.info = message;
  this.save();
};

// takes a user as a parameter and adds to the queue
queueSchema.methods.addUser = function (user) {
  var helpCount = this.calculateHelp();
  var stat = new Statistic({
    username: user.username,
    queue: this.name,
    help: user.help,
    leftQueue: false,
    queueLength: this.queue.length,
    helpAmount: helpCount,
    presentAmount: this.queue.length - helpCount
  });
  // console.log(stat);
  stat.save();
  this.queue.push(user);
  this.save();
};

queueSchema.methods.addBooking = function (bookingData) {
  this.bookings.push(bookingData);
  this.save();
};

queueSchema.methods.forAssistant = function (fn) {
  this.assistant.forEach(fn);
};

queueSchema.methods.forTeacher = function (fn) {
  this.teacher.forEach(fn);
};

queueSchema.methods.getUser = function (ugKthid) {
  for (var i = 0; i < this.queue.length; i++) {
    if(this.queue[i].ugKthid === ugKthid){
      return this.queue[i];
    }
  }
};

// takes a ugKthid as a parameter and removes the user form the queue
queueSchema.methods.removeUser = function (ugKthid) {
  var helpCount = this.calculateHelp();
  var user = this.getUser(ugKthid);
  var stat = new Statistic({
    username: user.username,
    queue: this.name,
    help: user.help,
    leftQueue: true,
    queueLength: this.queue.length,
    helpAmount: helpCount,
    presentAmount: this.queue.length - helpCount
  });
  stat.save();
  this.queue = this.queue.filter(function (user) {
    return user.ugKthid !== ugKthid;
  });
  this.save();
};

// takes a ugKthid as a parameter and removes the booking from the queue
// not tested yet
queueSchema.methods.removeBooking = function (ugKthid) {
  for (var i = 0; i < this.bookings.length; i++) {
    var remove = false;
    for (var j = 0; j < this.bookings[i].users.length; j++) {
      if (this.bookings[i].users[j] === ugKthid) {
        remove = true;
      }
      if (remove) {
        this.bookings.splice(i, 1);
      }
    }
  }
  this.save();
};

// takes a user as a parameter and adds to the queue
queueSchema.methods.addTeacher = function (teacher) {
  for (var i = 0; i < this.teacher.length; i++) {
    if(this.teacher[i].ugKthid === teacher.ugKthid){
    return false;
    }
  }
  this.teacher.push(teacher);
  this.save();
  return true;
};

// takes a ugKthid as a parameter and removes the user form the queue
queueSchema.methods.removeTeacher = function (ugKthid) {
  this.teacher = this.teacher.filter(function (teacher) {
    return teacher.ugKthid !== ugKthid;
  });
  this.save();
};

// takes a user as a parameter and adds to the queue
queueSchema.methods.addAssistant = function (assistant) {
  for (var i = 0; i < this.assistant.length; i++) {
    if(this.assistant[i].ugKthid === assistant.ugKthid){
      return false;
    }
  }
  this.assistant.push(assistant);
  this.save();
  return true;
};

// takes a ugKthid as a parameter and removes the user form the queue
queueSchema.methods.removeAssistant = function (ugKthid) {
  this.assistant = this.assistant.filter(function (assistant) {
    return assistant.ugKthid !== ugKthid;
  });
  this.save();
};

// locks the queue
queueSchema.methods.lock = function () {
  this.locked = true;
  this.save();
};

// unlocks the queue
queueSchema.methods.unlock = function () {
  this.locked = false;
  this.save();
};

// hide the schema
queueSchema.methods.hide = function () {
  this.hiding = true;
  this.save();
};

// show the schema
queueSchema.methods.show = function () {
  this.hiding = false;
  this.save();
};

// empty the queue
queueSchema.methods.purgeQueue = function () {
  for(var i = 0; i < this.queue.length; i++){
    var user = this.queue[i];
    var stat = new Statistic({
        username: user.username,
        queue: this.name,
        help: user.help,
        leftQueue: true,
        queueLength: 0,
        helpAmount: 0,
        presentAmount: 0
      });
    stat.save();
    this.queue[i].remove();
    this.save();
  }
  this.queue = [];
  this.save();
};

// empty the queue
queueSchema.methods.purgeBookings = function () {
  this.bookings = [];
  this.save();
};

// takes a function "fn" and applies it on every user
queueSchema.methods.forUser = function (fn) {
  this.queue.forEach(fn);
  this.save();
};

// parameter "user" is the replacing user
queueSchema.methods.updateUser = function (user) {
  this.queue.forEach(function (usr, i, queue) {
    if (usr.ugKthid === user.ugKthid) {
      queue[i].comment = user.comment;
      queue[i].location = user.location;
      queue[i].badLocation = user.badLocation;    }
  });
  this.save();
};

// set a comment from a assistant to a user (comment regarding help given by the assistant)
queueSchema.methods.addAssistantComment = function (ugKthid, sender, queue, message) {
  this.messages.push({ugKthid: ugKthid, message: message});
  this.queue.forEach(function (usr, i, queue) {
    if (usr.ugKthid === ugKthid) {
      var user = usr;
      user.messages.push(message);
      lodash.extend(queue[i], user);
    }
  });
  this.save();
};

// Remove comments about a user
queueSchema.methods.removeAssistantComments = function (ugKthid, sender, queue) {
  this.messages = this.messages.filter(function (message) {
    return message.ugKthid !== ugKthid;
  });
  this.queue.forEach(function (usr, i, queue) {
    if (usr.ugKthid === ugKthid) {
      var user = usr;
      user.messages = [];
      lodash.extend(queue[i], user);
    }
  });
  this.save();
};

// Removes all comments
queueSchema.methods.clearAssistantComments = function () {
  this.messages = [];
  this.save();
};

// set a user as getting help
queueSchema.methods.helpingQueuer = function (ugKthid, queue, helper) {
  this.queue.forEach(function (usr, i, queue) {
    if (usr.ugKthid === ugKthid) {
      var user = usr;
      user.gettingHelp = true;
      user.helper = helper;
      lodash.extend(queue[i], user);
    }
  });
  this.save();
};

// set a user as no longer getting help
queueSchema.methods.stopHelpingQueuer = function (ugKthid, queue) {
  this.queue.forEach(function (usr, i, queue) {
    if (usr.ugKthid === ugKthid) {
      var user = usr;
      user.gettingHelp = false;
      user.helper = "";
      lodash.extend(queue[i], user);
    }
  });
  this.save();
};

var Queue = mongoose.model("Queue", queueSchema);

module.exports = Queue;
