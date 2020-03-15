/* jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var queueSystem = require('../model/queueSystem.js');
var dns = require('dns');

var validate = queueSystem.validate;
// returnerar alla kurser som finns (lista av strängar)
router.get('/queueList', function (req, res) {
  var retList = [];

  queueSystem.forQueue(function (queue) {
    // console.log("trying to get length of " + queue.name + ": " + queue.queue.length);
    retList.push({
      name: queue.name,
      length: queue.queue.length,
      locked: queue.locked,
      hiding: queue.hiding
    });
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(retList));
  // console.log('list of queues requested');
});

router.get('/chatHistory/:queue', function (req, res) {
  var ugKthid = req.session.user.ugKthid;
  var queueName = req.params.queue;
  // admin/teacher-validation
  if (!(validate(ugKthid, "teacher", queueName) || validate(ugKthid, "assistant", queueName))) {
    // console.log("validation for lock failed");
    //res.end();
    return;
  }

  res.json(queueSystem.findQueue(queueName).chatMessages);
  // console.log('list of queues requested');
});

// returns the queue-list
router.get('/queue/:queue', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var queue = queueSystem.findQueue(req.params.queue);
  // console.log('queue ' + req.params.queue + ' requested');

  //console.log(queue);
  res.status(200);
  res.end(JSON.stringify(queue));
});

// returns the admin-list
// needs to be restricted
router.get('/adminList', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(queueSystem.getAdminList()));
});

router.get('/serverMessage', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var ret = {};
  ret.serverMessage = queueSystem.getGlobalMOTD();
  res.end(JSON.stringify(ret));
});

function teacherForQueues(ugKthid) {
  var teacherList = [];
  queueSystem.forQueue(function (queue) {
    queue.forTeacher(function (teacher) {
      if (teacher.ugKthid === ugKthid) {
        teacherList.push(queue.name);
      }
    });
  });
  return teacherList;
}

function assistantForQueues(ugKthid) {
  var assistantList = [];
  queueSystem.forQueue(function (queue) {
    queue.forAssistant(function (assistant) {
      if (assistant.ugKthid === ugKthid) {
        assistantList.push(queue.name);
      }
    });
  });
  return assistantList;
}

function getHostname(ip, callback) {
  try {
    if (ip.indexOf("::ffff:") > -1) {
      ip = ip.substring(7);
    }

    dns.reverse(ip, function (err, hostnames) {
      if (err || !hostnames || !hostnames[0]) {
        callback("");
      } else{
        callback(hostnames[0]);
      }
    });
  } catch (err) {
    callback("");
  }
}


function getLocation (ip, callback) {
  getHostname(ip, function (hostname) {
    var pattern = /(\.kth\.se)/g;
    var result = hostname.match(pattern);
    var location = "";
    if (result) {
      var possibleLocation = hostname.split(".")[0].replace("-", " ").toLowerCase();
      // console.log("local location-variable = " + location);
      // Test if they are at a recognized school computer
      // Recognized computers are:
      // E-house floor 4 : Blue, Red, Orange, Yellow, Green, Brown
      // E-house floor 5 : Grey, Karmosin, White, Magenta, Violett, Turkos
      // D-house floor 5 : Spel, Sport, Musik, Konst, Mat
      // Kista : ka 650, ka d4
      pattern = /(blue|red|orange|yellow|green|brown|grey|karmosin|white|magenta|violett|turkos|spel|sport|musik|konst|mat|ka\s650|ka\sd4)/g;
      result = possibleLocation.match(pattern);
      if (result) {
        location = possibleLocation;
        // console.log("local location-variable = " + location);
        if (result == "mat") { // Do not add a third equal sign. (Result does not appear to be a string)
          location = location.replace("mat", "mat ");
        }
        else if (result == "ka 650") { // Do not add a third equal sign. (Result does not appear to be a string)
          location = location.replace("ka 650", "Ka-209");
        }
        else if (result == "ka d4") { // Do not add a third equal sign. (Result does not appear to be a string)
          location = location.replace("ka d4", "Ka-309");
        }
      }
    }
    callback(location);
  });
}

// TODO: add a list of admin
router.get('/userData', function (req, res) {
  // console.log("user data: ");
  if (req.session.user === undefined) {
    // console.log("not logged in yet");
    res.json();
  } else {
    // console.log("userData - logged in: " + JSON.stringify(req.session.user));

    var ip = req.connection.remoteAddress;
    getLocation(ip, function (location) {
      req.session.user.location = location;
      var ugKthid = req.session.user.ugKthid;
      var realname = req.session.user.realname;
      var username = req.session.user.username;
      var teacherList = teacherForQueues(ugKthid);
      var assistantList = assistantForQueues(ugKthid);
      var admin = validate(ugKthid, "super");

      res.json({
        ugKthid: ugKthid,
        realname: realname,
        username: username,
        admin: admin,
        teacher: teacherList,
        assistant: assistantList,
        location: location
      });
    });
  }
});


module.exports = router;
