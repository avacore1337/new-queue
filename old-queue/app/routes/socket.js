/* jslint node: true */
"use strict";

var queueSystem = require('../model/queueSystem.js');
var validate = queueSystem.validate;

var User = require("../model/user.js");
var Statistic = require("../model/statistic.js");

module.exports = function (socket, io) {

  function shortString (str, len) {
    return str.length <= len ? str : str.substring(0, len - 3).concat("...");
  }

  function alterText (str) {
    var counter = 0;
    for (var i = 0; i < str.length; i++) {
      if(str.charAt(i) === " " || str.charAt(i) === "\t" || str.charAt(i) === "\n") {
        counter = 0;
      }else{
        if(counter > 20) {
          str = [str.slice(0, i), " ", str.slice(i)].join("");
          counter = 0;
        }else{
          counter++;
        }
      }
    }
    return str;
  }

  // console.log("connected");
  // Setup the ready route, join room and emit to room.
  socket.on('listen', function (req) {
    // console.log('a user added to ' + req);
    socket.join(req);
    try {
      var ugKthid = socket.handshake.session.user.ugKthid;
      // console.log("Current user = " + JSON.stringify(ugKthid));
      if (ugKthid) { // TODO : Temporary fix
        socket.join('user_' + ugKthid);
      }
    } catch (err) {
      // console.log("User is not logged in.");
    }
  });

  socket.on('stopListening', function (req) {
    // console.log('a user left ' + req);
    socket.leave(req);
  });

  // user joins queue
  socket.on('join', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var user = req.user;
    user.location = shortString(user.location, 30);
    user.comment = shortString(user.comment, 140);
    user.comment = alterText(user.comment);
    user.ugKthid = socket.handshake.session.user.ugKthid;
    user.username = socket.handshake.session.user.username;
    user.realname = socket.handshake.session.user.realname;

    var queue = queueSystem.findQueue(queueName);

    if (queue.inQueue(user.ugKthid)) {
      return;
    }

    // console.log('A user joined to ' + queueName);

    var newUser = new User({
      username: user.username,
      ugKthid: user.ugKthid,
      realname: user.realname,
      location: user.location,
      comment: user.comment,
      help: user.help
    });

    // Set the variable 'completion' to true if they have a completion and want to present
    if (!newUser.help) {
      if (queue.hasCompletion(newUser.ugKthid)) {
        newUser.completion = true;
      }
    }

    // Append the messages added about this user
    newUser.messages = queue.getMessagesFor(newUser.ugKthid);

    queue.addUser(newUser);

    // console.log("User : " + JSON.stringify(newUser) + " wants to join the queue.");
    io.to(queueName).emit('join', newUser);
    io.to("lobby").emit('lobbyjoin', {
      queueName: queueName,
      ugKthid: newUser.ugKthid
    });

  });

  // user gets updated
  socket.on('update', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var user = req.user;
    user.location = shortString(user.location, 30);
    user.comment = shortString(user.comment, 140);
    user.comment = alterText(user.comment);
    user.ugKthid = socket.handshake.session.user.ugKthid;
    user.realname = socket.handshake.session.user.realname;
    user.username = socket.handshake.session.user.username;
    user.badLocation = false;

    // console.log(JSON.stringify(user)); // check which uses is given --- need the one doing the action and the one who is "actioned"

    // console.log('a was updated in ' + queueName);

    var course = queueSystem.findQueue(queueName);
    course.updateUser(user);
    io.to(queueName).emit('update', course.getUser(user.ugKthid));
  });

  // a user marks themself as getting help
  socket.on('receivingHelp', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    var course = queueSystem.findQueue(queueName);
    course.helpingQueuer(ugKthid, queueName, "");

    io.to(queueName).emit('help', {
      ugKthid: ugKthid
    });

    // console.log(ugKthid + ' is getting help in ' + queueName);
  });

  // user leaves queue
  socket.on('leave', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // console.log(ugKthid); // check which uses is given --- need the one doing the action and the one who is "actioned"
    // console.log("Validerande: " + JSON.stringify(socket.handshake.session.user));

    var queue = queueSystem.findQueue(queueName);
    if (!queue.inQueue(ugKthid)) {
      return;
    }

    var user = queue.getUser(ugKthid);
    queue.removeUser(ugKthid);
    if (!user.help) {
      if (queue.hasCompletion(ugKthid)) {
        queue.removeCompletion(ugKthid); // TODO : This function does not exist
      }
    }

    // console.log('a user left ' + queueName);

    io.to(queueName).emit('leave', {
      ugKthid: ugKthid
    });
    io.to("lobby").emit('lobbyleave', {
      queueName: queueName,
      ugKthid: ugKthid
    });
  });

  socket.on('getStatistics', function (req) {
    var start = req.start;
    var end = req.end;
    var queueName = req.queueName;
    // console.log("start: " + start);
    // console.log("end: " + end);
    Statistic.getStatistics(queueName, start, end, function (err, statData) {
      socket.emit("statistics", statData);
      // console.log("finished");
    });
  });

  socket.on('getJSONStatistics', function (req) {
    var start = req.start;
    var end = req.end;
    var queueName = req.queueName;
    // console.log("start: " + start);
    // console.log("end: " + end);
    Statistic.getJSONStatistics(queueName, start, end, function (err, statData) {
      socket.emit("JSONStatistics", statData);
      // console.log("finished");
    });
  });

  // TODO : This has been changed to only have them join a room based on their ID, no more session interaction
  socket.on('setUser', function (req) {
    // console.log("user_" + req.ugKthid);
    socket.join("user_" + req.ugKthid); // joina sitt eget rum, för privata meddelande etc
    socket.handshake.session.user = {};
    socket.handshake.session.user.location = "";
    socket.handshake.session.user.realname = '' + req.realname;
    socket.handshake.session.user.username = "guestname-" + req.realname;
    socket.handshake.session.user.ugKthid = "guest-" + req.realname;
    // console.log('Socket-setUser: ' + JSON.stringify(req));
    // console.log('session is: ' + JSON.stringify(socket.handshake.session.user));
  });

};
