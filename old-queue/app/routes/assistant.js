/* jslint node: true */
"use strict";

var queueSystem = require('../model/queueSystem.js');
var validate = queueSystem.validate;

var Statistic = require("../model/statistic.js");

module.exports = function (socket, io) {

  function doOnQueue(queueName, action) {
    var queue = queueSystem.findQueue(queueName);
    queue[action]();

    // console.log('trying to ' + action + ' ' + queueName);

    io.to(queueName).emit(action);
    io.to("lobby").emit("lobby" + action, queueName);

    if (action === 'hide') {
      io.to("admin").emit('hide', queueName);
    } else if (action === 'show') {
      io.to("admin").emit('show', queueName);
    }
  }

  socket.on('badLocation', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var ugKthid = socket.handshake.session.user.ugKthid;
    var user = req.user;
    var queueName = req.queueName;
    user.badLocation = true;

    // teacher/assistant-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for badLocation failed");
      //res.end();
      return;
    }

    io.to("user_" + user.ugKthid).emit('badLocation', {ugKthid: user.ugKthid, sender: ugKthid, queueName: queueName, type: req.type});
    io.to(queueName).emit('update', user);

    var queue = queueSystem.findQueue(queueName);
    queue.updateUser(user);

    // console.log("Bad location at " + queueName + " for " + user.username);
  });

  socket.on('putUser', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var ugKthid = socket.handshake.session.user.ugKthid;
    var newUser = req.user;
    var queueName = req.queueName;

    // teacher/assistant-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for badLocation failed");
      //res.end();
      return;
    }

    io.to(queueName).emit('join', newUser);
    io.to("lobby").emit('lobbyjoin', {
      queueName: queueName,
      ugKthid: newUser.ugKthid
    });

    var queue = queueSystem.findQueue(queueName);
    queue.addUser(newUser);

    // console.log("Assistant insert in " + queueName + " for " + newUser.username);
  });

  // admin stops helping a user (marked in the queue)
  socket.on('stopHelp', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for stopHelp failed");
      //res.end();
      return;
    }

    var targetUgKthid = req.ugKthid;
    var queue = queueSystem.findQueue(queueName);
    queue.stopHelpingQueuer(targetUgKthid, queueName);

    io.to(queueName).emit('stopHelp', {
      ugKthid: targetUgKthid,
      helper: ugKthid
    });

    // console.log(targetUgKthid + ' is no longer getting help in ' + queueName);
  });


  // teacher/assistant messages a user
  socket.on('messageUser', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var sender = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for messageUser failed");
      //res.end();
      return;
    }

    var ugKthid = req.ugKthid;
    var message = req.message;

    io.to("user_" + ugKthid).emit('msg', {
      message: message,
      sender: sender
    });

    // console.log('user ' + ugKthid + ' was messaged from ' + sender + ' at ' + queueName + ' with: ' + message);
  });

  // teacher/assistant emits to all users (teacher/assistant included)
  socket.on('broadcast', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var message = req.message;
    var sender = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for broadcast failed");
      //res.end();
      return;
    }

    io.to(queueName).emit('msg', {
      message: message,
      sender: sender
    });

    // console.log('emit in ' + queueName + ', msg: ' + message);
  });

  // teacher/assistant emits to all teacher/assistant
  socket.on('broadcastFaculty', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    // console.log("Recevie request to send message to faculty");
    var queueName = req.queueName;
    var message = req.message;
    var sender = socket.handshake.session.user.ugKthid;

    // console.log("queueName = " + queueName);
    // console.log("message = " + message);
    // console.log("sender = " + sender);

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for broadcast failed");
      //res.end();
      return;
    }

    var queue = queueSystem.findQueue(queueName);
    queue.addChatMessage(sender, message);
    var teacherList = queue.teacher;
    var assistantList = queue.assistant;

    for (var i = 0; i < teacherList.length; i++) {
      var teacher = teacherList[i];

      io.to("user_" + teacher.ugKthid).emit('msg', {
        message: message,
        sender: sender
      });

      // console.log("emiting teacher: " + "user_" + teacher.ugKthid);
    }
    for (i = 0; i < assistantList.length; i++) {
      var assistant = assistantList[i];

      io.to("user_" + assistant.ugKthid).emit('msg', {
        message: message,
        sender: sender
      });

      // console.log("emiting assistant: " + assistant.ugKthid);
    }
    // console.log('emitTA in ' + queueName + ', msg: ' + message);
  });


  // admin helps a user (marked in the queue)
  socket.on('help', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = req.ugKthid;
    var helper = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(helper, "teacher", queueName) || validate(helper, "assistant", queueName))) {
      // console.log("validation for help failed");
      //res.end();
      return;
    }

    var queue = queueSystem.findQueue(queueName);
    queue.helpingQueuer(ugKthid, queueName, helper);

    io.to(queueName).emit('help', {
      ugKthid: ugKthid,
      helper: helper
    });

    // console.log(ugKthid + ' is getting help in ' + queueName);
  });


  // user being kicked from queue
  socket.on('kick', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var user = req.user;
    var assistant = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(assistant, "teacher", queueName) || validate(assistant, "assistant", queueName))) {
      // console.log("validation for kick failed");
      //res.end();
      return;
    }
    var queue = queueSystem.findQueue(queueName);
    queue.removeUser(user.ugKthid);

    if (!user.help) {
      if (user.completion) {
        queue.removeCompletion(user.ugKthid);
      }
    }

    // console.log('a user was kicked from ' + queueName);

    io.to(queueName).emit('leave', user);
    io.to("lobby").emit('lobbyleave', {
      queueName: queueName,
      ugKthid: user.ugKthid
    });
  });


  // assistant/teacher purges a queue
  socket.on('purge', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var assistant = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(assistant, "teacher", queueName) || validate(assistant, "assistant", queueName))) {
      // console.log("validation for purge failed");
      //res.end();
      return;
    }

    var queue = queueSystem.findQueue(queueName);
    queue.purgeQueue();

    // console.log(queueName + ' -list purged by ' + assistant);

    io.to(queueName).emit('purge');
    io.to("lobby").emit('lobbypurge', queueName);
  });

  // trying to schedule a lab session
  socket.on('addSchedule', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // admin/teacher-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for lock failed");
      //res.end();
      return;
    }

    // console.log("Validation successful. Would have scheduled: " + JSON.stringify(req.schedule));
  });

  // trying to clear all schedules for a given queue
  socket.on('removeSchedules', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // admin/teacher-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for lock failed");
      //res.end();
      return;
    }

    // console.log("Validation successful. Would have cleared the schedule for : " + queueName);
  });

  //===============================================================


  // admin locks a queue
  socket.on('lock', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // admin/teacher-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for lock failed");
      //res.end();
      return;
    }

    doOnQueue(queueName, 'lock');
  });

  // admin unlocks a queue
  socket.on('unlock', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var ugKthid = socket.handshake.session.user.ugKthid;

    // admin/teacher-validation
    if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
      // console.log("validation for unlock failed");
      //res.end();
      return;
    }

    doOnQueue(queueName, 'unlock');
  });


  // Add a comment about a user
  socket.on('flag', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var ugKthid = req.ugKthid;
    var queueName = req.queueName;
    var sender = socket.handshake.session.user.ugKthid;
    var message = req.message;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for flag failed");
      //res.end();
      return;
    }

    var queue = queueSystem.findQueue(queueName);
    queue.addAssistantComment(ugKthid, sender, queueName, message);

    // console.log('flagged');
    io.to(queueName).emit('flag', {
      ugKthid: ugKthid,
      message: message
    });
  });

  // Remove all comments about a user
  socket.on('removeFlags', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var ugKthid = req.ugKthid;
    var queueName = req.queueName;
    var sender = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for flag failed");
      //res.end();
      return;
    }

    var queue = queueSystem.findQueue(queueName);
    queue.removeAssistantComments(ugKthid, sender, queueName);

    // console.log('removed flags');
    io.to(queueName).emit('removeFlags', {
      ugKthid: ugKthid
    });
  });

  socket.on('completion', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var assistant = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(assistant, "teacher", queueName) || validate(assistant, "assistant", queueName))) {
      // console.log("validation for completion failed");
      //res.end();
      return;
    }

    var completion = req.completion;
    completion.assistant = assistant;

    // console.log("Added the following completion: " + JSON.stringify(completion));

    var queue = queueSystem.findQueue(queueName);
    queue.addCompletion(completion);

    queueSystem.userLeavesQueue(queue, completion.ugKthid, false); // TODO : should take a variable 'booking' instead of hardcoding 'false'

    // console.log('completion set for user : ' + completion.ugKthid);
    io.to(queueName).emit('leave', {
      ugKthid: completion.ugKthid
    });
    io.to("lobby").emit('lobbyleave', {
      queueName: queueName,
      ugKthid: completion.ugKthid
    });
    if (completion.task) {
      io.to("user_" + completion.ugKthid).emit('completion', {
        message: completion.task
      });
    }
  });

  socket.on('setMOTD', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var MOTD = req.MOTD;
    var sender = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for setMOTD failed");
      //res.end();
      return;
    }

    // find the queue and save the MOTD to the queue in the database
    var queue = queueSystem.findQueue(queueName);
    queue.setMOTD(MOTD);

    // console.log('\'' + MOTD + '\' added as a new MOTD in ' + queueName + '!');

    io.to(queueName).emit('setMOTD', {
      MOTD: MOTD
    });
  });

  socket.on('setInfo', function (req) {
    if(socket.handshake.session.user === undefined){
      return;
    }
    var queueName = req.queueName;
    var info = req.info;
    var sender = socket.handshake.session.user.ugKthid;

    // teacher/assistant-validation
    if (!(validate(sender, "teacher", queueName) || validate(sender, "assistant", queueName))) {
      // console.log("validation for setMOTD failed");
      //res.end();
      return;
    }

    // find the queue and save the MOTD to the queue in the database
    var queue = queueSystem.findQueue(queueName);
    queue.setInfo(info);

    // console.log('\'' + info + '\' added as a new info in ' + queueName + '!');

    io.to(queueName).emit('setInfo', {
      info: info
    });
  });

};
