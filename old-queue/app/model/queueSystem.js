/* jslint node: true */
"use strict";

/**
 * A module that contains the main system object!
 * @module queueSystem
 */

var schedule = require('node-schedule');
var request = require('request');
var http = require('http');

var Queue = require("./queue.js");
var User = require("./user.js");
var Admin = require("./admin.js");
var Statistic = require("./statistic.js");
var GlobalMOTD = require("./globalMOTD.js");

var queueList = [];
var adminList = [];
var globalMOTD;

/**
 * Creates a queue with the given name.
 * @param {String} name - The name of the queue.
 */
exports.addQueue = function (name) {
  var newQueue = new Queue({
    name: name
  });
  queueList.push(newQueue);
  newQueue.save();

  // console.log(name + ' is getting created as ' + JSON.stringify(newQueue));
  return newQueue;
};

/**
 * Removes the queue object with the matching name.
 * @param {String} name - The name of the queue.
 */
exports.removeQueue = function(name){
  for (var i = queueList.length - 1; i >= 0; i--) {
    var queue = queueList[i];
    if (queue.name === name) {
      queueList.splice(i, 1);
      queue.remove();
      break;
    }
  }
};

/**
 * Return the queue object with the matching name.
 * @param {String} name - The name of the queue.
 */
exports.findQueue = function(name) {
  for (var i = 0; i < queueList.length; i++) {
    if (queueList[i].name === name) {
      return queueList[i];
    }
  }
};

/**
 * Wrapper for the array For each for the queueList array.
 * @param {function} fn - The function to be called for every element in the list.
 */
exports.forQueue = function (fn) {
  queueList.forEach(fn);
};

/**
 * Adds a superadmin to the system.
 * @param {String} name - The name of the user.
 * @param {String} realname - The real name (cn) of the user.
 * @param {String} username - The username of the user.
 * @param {String} ugKthid - The unique unchanging id of the user.
 */
exports.addAdmin = function (realname, username, ugKthid, addedBy) {
  for (var i = 0; i < adminList.length; i++) {
    if(adminList[i].ugKthid === ugKthid){
    return false;
    }
  }
  var admin = new Admin({
    realname: realname,
    username: username,
    ugKthid: ugKthid,
    addedBy: addedBy
  });
  adminList.push(admin);
  admin.save();
  return true;
};

/**
 * Removes a super admin.
 * @param {String} username - The username of the user.
 */
exports.removeAdmin = function (ugKthid) {
  for (var i = adminList.length - 1; i >= 0; i--) {
    var admin = adminList[i];
    if (admin.ugKthid === ugKthid) {
      adminList.splice(i, 1);
      admin.remove();
      break;
    }
  }
};

/** Returns the adminList */
exports.getAdminList = function () {
  return adminList;
};

/**
 * Validates if a user has the access rights to do the action on the
 * access level required for the given course
 * @param {String} userName - The name of the user.
 * @param {String} type - The needed access level - "super", "teacher" or "assistant".
 * @param {String} queueName - The name of the queue.
 */
exports.validate = function(ugKthid, type, queueName) {
  if (type === "super") {
    return validateSuper(ugKthid);
  } else if (type === "teacher") {
    return validateTeacher(ugKthid, queueName);
  } else if (type === "assistant") {
    return validateAssistant(ugKthid, queueName) || validateTeacher(ugKthid,queueName);
  }

  // console.log("that privilege-type is not defined"); // temporary for error-solving
  return false;
};

/**
 * Validates if a user has the access rights to do super admin level actions.
 * @param {String} userName - The name of the user.
 */
function validateSuper(ugKthid) {
  var valid = false;
  for (var i = 0; i < adminList.length; i++) {
    if (adminList[i].ugKthid === ugKthid) {
      // console.log(ugKthid + ' is a valid super-admin'); // temporary for error-solving
      valid = true;
    }
  }
  return valid;
}

/**
 * Validates if a user has the access rights to do teacher level actions
 * on the given queue.
 * @param {String} userName - The name of the user.
 * @param {String} queueName - The name of the queue.
 */
function validateTeacher(ugKthid, queueName) {
  var valid = false;
  exports.findQueue(queueName).forTeacher(function(teacher) {
    if (teacher.ugKthid === ugKthid) {
      // console.log(ugKthid + ' is a valid teacher'); // temporary for error-solving
      valid = true;
     }
  });
  return valid;
}

/**
 * Validates if a user has the access rights to do teacher assistant level
 * actions on the given queue.
 * @param {String} userName - The name of the user.
 * @param {String} queueName - The name of the queue.
 */
function validateAssistant(ugKthid, queueName) {
  var valid = false;
  exports.findQueue(queueName).forAssistant(function(assistant) {
    if (assistant.ugKthid === ugKthid) {
      // console.log(ugKthid + ' is a valid assistant'); // temporary for error-solving
      valid = true;
    }
  });
  return valid;
}

/**
 * updates all the bookings with the data from the bookingsystem.
 */
exports.updateAllBookings = function () {
  for (var index = 0; index < queueList.length; index++) {
    queueList[index].purgeBookings();
  }
  exports.forQueue(function (queue) {
    // console.log("updateing: " + queue.name);
    if (queue.bookings.length === 0) {
      fetchBookings(queue.name,function (err, response, body) {
        if (!err && response.statusCode === 200) {
          // console.log(response);
          // console.log("course: " + queue.name + " Got response: ");
          // console.log(body);
          for (var j = 0; j < body.length; j++) {
            // console.log("creating bookings");
            var users = [];
            for (var i = 0; i < body[j].otherUsers.length; i++) {
              if(body[j].otherUsers[i] !== ""){
                users.push(body[j].otherUsers[i]);
              }
            }
            users.push(body[j].userID);
            queue.addBooking({
              users:users,
              time:(new Date(body[j].start)).getTime(),
              length:15,
              comment:body[j].comment
            });
          }
        }
        else{
          // console.log(err);
        }
      });
    }
  });
};


/**
 * fetches all the bookings from the bookingsystem for a queue/course
 */
function fetchBookings (queueName, callback) {
  var url = 'http://127.0.0.1:8088/API/todaysbookings/' + queueName; //TODO move out url to config file
  request({ url: url, json: true }, callback);
}

exports.setGlobalMOTD = function (message) {
  globalMOTD.message = message;
  globalMOTD.save();
};

exports.getGlobalMOTD = function () {
  return globalMOTD.message;
};

/**
 * A function that spoofs data to make sure there is something to test the
 * system with. Should be commented out in production.
 */
function setup() {
  // list of queues to be used
  var tmpList = [
    "mvk",
    "progp",
    "mdi",
    "Dasak"
  ];

  globalMOTD = new GlobalMOTD({
    message: "Hello World!"
  });

  globalMOTD.save();

  var newAdmin = new Admin({
    realname: "Anton Bäckström",
    username: "antbac",
    ugKthid: "u18dlezv",
    addedBy: "root"
  });
  adminList.push(newAdmin);
  newAdmin.save();

  newAdmin = new Admin({
    realname: "robert welin-berger",
    username: "robertwb",
    ugKthid: "u101x961",
    addedBy: "root"
  });
  adminList.push(newAdmin);
  newAdmin.save();

  // creates database-objects from the list (of queues)
  for (var i = 0; i < tmpList.length; i++) {
    var queue = tmpList[i];
    var newQueue = new Queue({
      name: queue
    });
    queueList.push(newQueue);
    newQueue.save();

    //---------------------------------------------------------------------------------------
    /*TEST*/
    var randomTime = Date.now() - Math.random() * 3 * 1000000;
    //---------------------------------------------------------------------------------------
    // for every queue, create users
    var queues = Math.floor((Math.random() * 50) + 1);
    for (var j = 0; j < queues; j++) {
      var rndName = Math.random().toString(36).substring(7);
      var newUser = new User({
        username: "username-" + rndName,
        ugKthid: "ug-" + rndName,
        realname: "real-" + rndName,
        location: 'Green',
        comment: 'lab1',
        help: true,
        completion: false,
        startTime: randomTime
      });
      newQueue.addUser(newUser);
      newQueue.save();
      var newStatistic = new Statistic({
        username: newUser.username,
        queue: newQueue.username,
        help: newUser.help,
        leftQueue: true,
        queueLength: newQueue.queue.length,
        helpAmount: newQueue.queue.length,
        presentAmount: 0,
      });
      newStatistic.save();

      //---------------------------------------------------------------------------------------
      /*TEST*/
      randomTime += Math.random() * 5 * 10000;
      //---------------------------------------------------------------------------------------
    }

    // console.log(queue + " " + newQueue.queue.length); // temporary for error-solving
  }
}

/**
 * Loads all the data from the database at startup.
 * Make sure this runs at system start.
 */
function readIn() {
  // All the queues
  Queue.find(function(err, queues) {
    queues.forEach(function(queue) {
      queueList.push(queue);
      // to make sure everything loads
      // console.log('Queue: ' + queue.name + ' loaded!');
    });
    // exports.updateAllBookings()
  });

  // All the queues
  Admin.find(function(err, admins) {
    admins.forEach(function(admin) {
      adminList.push(admin);
      // to make sure everything loads
      // console.log('Admin: ' + admin.username + ' loaded!');
    });
  });

  // All the queues
  GlobalMOTD.find(function(err, globals) {
    globals.forEach(function(global) {
      // to make sure everything loads
      // console.log('Globals: ' + global + '!');
      globalMOTD = global;
    });
  });
}

// var newAdmin = new Admin({
//   realname: "Robert Welin-Berger",
//   username: "robertwb",
//   ugKthid: "u101x961",
//   addedBy: "root"
// });
// adminList.push(newAdmin);
// newAdmin.save();

// setup(); // Use for setting up the test system
readIn(); //use this
