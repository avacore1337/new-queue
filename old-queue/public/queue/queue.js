(function(){
  var app = angular.module("queue.queue", [
    'ui.bootstrap',
    'ngRoute',
    'queue.userDirective'
    ]);

  app.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/queue/:queue', {
        templateUrl: 'queue/queue.html',
        controller: 'queueController'
      });
    }])


  .controller('queueController', ['$scope', 'HttpService', '$routeParams', '$location', '$modal', 'WebSocketService', 'UserService', 'TitleService', 'ModalService', '$timeout',
    function ($scope, http, $routeParams, $location, $modal, socket, user, title, modals, $timeout) {
      var TIME_BOOKING = 1800000; // 30min in milliseconds

      $scope.loggedIn = user.isLoggedIn();

      $scope.queue = $routeParams.queue;
      $scope.info = "";

      $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        console.log("Leaving " + $scope.queue);
        socket.emit('stopListening', $scope.queue);
      });
      socket.emit('listen', $scope.queue);

      $scope.name = user.getName();
      $scope.ugKthid = user.getUgKthid();
      $scope.users = [];
      $scope.bookedUsers = [];
      $scope.enqueued = false;
      $scope.gettingHelp = false;
      $scope.help = true;
      $scope.ding = true;
      $scope.location = user.getLocation();
      $scope.fixedLocation = $scope.location !== "";
      $scope.completionText = "";
      $scope.accessLevel = user.accessLevelFor($scope.queue);
      title.title = "[" + $scope.users.length + "] " + $scope.queue + " | Stay A While";

      $scope.locked = false;
      http.get('queue/' + $scope.queue, function(response) {
        console.log(response);
        $scope.users = response.queue;
        title.title = "[" + $scope.users.length + "] " + $scope.queue + " | Stay A While";
        $scope.bookedUsers = response.bookings;
        $scope.info = response.info;
        // $scope.bookedUsers = [{time:Date.now(), comment:"MVK redovisning", users:["antbac", "pernyb", "rwb"], length:"15min", location:"Blue 01"}];
        console.log($scope.bookedUsers);
        $scope.locked = response.locked;
        matchToQueue();
        if(response.motd){
          $scope.MOTD = response.motd;
          modals.getModal({title: "Message of the day", message: response.motd, sender: ""});
        }
      });

      function matchToQueue () {
        for (var i = 0; i < $scope.users.length; i++) {
          $scope.users[i].color = $scope.colorLocation($scope.users[i].location);
          $scope.users[i].optionsActivated = false;
          if($scope.users[i].ugKthid === $scope.ugKthid){
            $scope.enqueued = true;
            $scope.gettingHelp = $scope.users[i].gettingHelp;
            title.title = "["  + (i+1) + "/" + $scope.users.length + "] " + $scope.queue + " | Stay A while";
            if(!$scope.fixedLocation){
              $scope.location = $scope.users[i].location;
            }
            $scope.comment = $scope.users[i].comment;
            $scope.help = $scope.users[i].help;
          }
        }
      }

      $scope.$watch(function() {
        return $scope.name;
      }, function(newValue, oldValue) {
        $scope.loggedIn = user.isLoggedIn();
      });

      $scope.$watch(function() {
        return $scope.location;
      }, function(newValue, oldValue) {
        if($scope.location && $scope.enqueued){
          socket.emit('update', {
            queueName: $scope.queue,
            user:{location: $scope.location, comment: $scope.comment, help: $scope.help}
          });
        }
      });

      $scope.$watch(function() {
        return $scope.comment;
      }, function(newValue, oldValue) {
        if($scope.location && $scope.enqueued){
          socket.emit('update', {
            queueName: $scope.queue,
            user:{location: $scope.location, comment: $scope.comment, help: $scope.help}
          });
        }
      });

      // Listen for the person joining a queue event.
      socket.on('join', function (data) {
        data.color = $scope.colorLocation(data.location);
        $scope.users.push(data);
        if(data.ugKthid === $scope.ugKthid){
          $scope.enqueued = true;
          title.title = "["  + $scope.users.length + "/" + $scope.users.length + "] " + $scope.queue + " | Stay A while";
        }else{
          title.title = "["  + $scope.users.length + "] " + $scope.queue + " | Stay A while";
        }
        if($scope.users.length === 1 && user.accessLevelFor($scope.queue) > 0 && !document.hasFocus() && $scope.ding){
          var audio = new Audio('../sounds/DingLing.mp3');
          audio.play();
        }
      });

      // Listen for the person leaving a queue event.
      socket.on('leave', function (data) {
        console.log("Backend wants the following to leave the queue: " + JSON.stringify(data));
        if(data.ugKthid === $scope.ugKthid){
          if(!$scope.help){
            $scope.completionText = "";
          }
          $scope.enqueued = false;
          $scope.comment = '';
          $scope.help = true;
          $scope.gettingHelp = false;
        }
        for(var i = $scope.users.length - 1; i >= 0; i--) {
          if($scope.users[i].ugKthid === data.ugKthid) {
            $scope.users.splice(i, 1);
            break;
          }
        }
        if($scope.enqueued){
          for(var j = $scope.users.length - 1; j >= 0; j--) {
            if($scope.users[j].ugKthid === $scope.ugKthid) {
              title.title = "["  + (j+1) + "/" + $scope.users.length + "] " + $scope.queue + " | Stay A while";
              break;
            }
          }
        }else{
          title.title = "["  + $scope.users.length + "] " + $scope.queue + " | Stay A while";
        }
      });

      // Listen for the person updateing a queue event.
      socket.on('purge', function () {
        $scope.users = [];
        $scope.enqueued = false;
        $scope.comment = '';
        $scope.help = true;
        $scope.gettingHelp = false;
        title.title = "[0] " + $scope.queue + " | Stay A while";
      });

      // Listen for a user changeing their information
      socket.on('update', function (user) {
        console.log("updating user : " + user);
        for(var index in $scope.users) {
          if($scope.users[index].ugKthid === user.ugKthid) {
            $scope.users[index] = user;
            $scope.users[index].color = $scope.colorLocation($scope.users[index].location);
            break;
          }
        }
      });

      // Listen for a message.
      socket.on('msg', function (data) {
        console.log("Received message : " + data);
        modals.getModal({title: "Message", message: data.message, sender: "- " + data.sender});
      });

      // Listen for a user getting flagged
      socket.on('flag', function (data) {
        console.log("Flaggin " + data.ugKthid);
        for(var i = $scope.users.length - 1; i >= 0; i--) {
          if($scope.users[i].ugKthid === data.ugKthid) {
            if($scope.users[i].messages === undefined){
              $scope.users[i].messages = [data.message];
            }else{
              $scope.users[i].messages.push(data.message);
            }
            console.log("Pushed the message : " + data.message);
            break;
          }
        }
      });

      // Listen for a user getting their flags removed
      socket.on('removeFlags', function (data) {
        console.log("Removing flags for user " + data.ugKthid);
        for(var i = $scope.users.length - 1; i >= 0; i--) {
          if($scope.users[i].ugKthid === data.ugKthid) {
            $scope.users[i].messages = [];
            break;
          }
        }
      });

      // Listen for a person getting help.
      socket.on('help', function (data) {
        if(data.ugKthid === $scope.ugKthid){
          $scope.gettingHelp = true;
        }
        for(var i = 0; i < $scope.users.length; i++){
          if($scope.users[i].ugKthid === data.ugKthid){
            $scope.users[i].gettingHelp = true;
            if(data.helper){
              $scope.users[i].helper = data.helper;
            }
            break;
          }
        }
      });

      // Listen for a person no longer getting help.
      socket.on('stopHelp', function (data) {
        if(data.ugKthid === $scope.ugKthid){
          $scope.gettingHelp = false;
        }
        for(var i = 0; i < $scope.users.length; i++){
          if($scope.users[i].ugKthid === data.ugKthid){
            $scope.users[i].gettingHelp = false;
            $scope.users[i].helper = data.helper;
            break;
          }
        }
      });

      // Listen for a message about receiving a completion-text
      socket.on('completion', function (data) {
        console.log("data.message = " + data.message);
        $scope.completionText = data.message;
      });

      // Listen for a new MOTD.
      socket.on('setMOTD', function (MOTD) {
        console.log("Backend wants to add the MOTD : " + JSON.stringify(MOTD));
        $scope.MOTD = MOTD.MOTD;
      });

      // Listen for new queue-info.
      socket.on('setInfo', function (Info) {
        console.log("Backend wants to change the queue-info to : " + JSON.stringify(Info));
        $scope.info = Info.info;
      });

      // Listen for locking the queue
      socket.on('lock', function (){
        $scope.locked = true;
      });

      // Listen for unlocking the queue
      socket.on('unlock', function (){
        $scope.locked = false;
      });

      // Listen for a badLocation warning
      socket.on('badLocation', function (data) {
        console.log(JSON.stringify(data));
        var message = "";
        if(data.type === "unknown"){
          message = "The teaching assistant in '" + data.queueName + "' could not locate you. The teaching assistant won't try to find you again until you have updated your information.";
        }else{
          message = "You are currently located in the wrong room for a teaching assistant in " + data.queueName + " to come to you.";
        }
        modals.getModal({
          title: "Unclear location",
          message: message,
          sender: "- " + data.sender
        });
      });

      $scope.addUser = function(){
        if(!$scope.locked){
          if($scope.location === ""){
            alert("You must enter a location.");
          }else{
            console.log("Current time = " + Date.now());
            socket.emit('join',
            {
              queueName: $scope.queue,
              user: {location: $scope.location, comment: $scope.comment, help: $scope.help}
            });
            console.log("Called addUser");
          }
        }
      };

      $scope.receivingHelp = function(){
        socket.emit('receivingHelp',
        {
          queueName: $scope.queue
        });
        console.log("Called receivingHelp");
      };

      // Leave the queue
      $scope.leave = function(){
        var wasBooked = false;
        socket.emit('leave', {
          queueName: $scope.queue,
          help: $scope.help,
          booking: wasBooked
        });
        console.log("Called leave");
      };

      // This function should remove every person in the queue
      $scope.purge = function(){
        console.log("Called purge");
        modals.confirmModal({
          title: "Are you sure you want to remove everyone in the queue?",
          text: "",
          confirmButton: {
            text: "Yes, kick them all out.",
            callback: function () {
              console.log("Purging the queue");
              socket.emit('purge', {
                queueName:$scope.queue
              });
            }
          },
          declineButton: {
            text: "No, leave them alone.",
            callback: function () {}
          }
        });
      };

      // This function should lock the queue, preventing anyone from queueing
      $scope.lock = function(){
        console.log("Called lock");
        socket.emit('lock', {
          queueName:$scope.queue
        });
        console.log("Leaving lock");
      };

      // This function should unlock the queue, alowing people to join the queue
      $scope.unlock = function(){
        socket.emit('unlock', {
          queueName:$scope.queue
        });
        console.log("Called unlock");
      };

      // This function should unlock the queue, alowing people to join the queue
      $scope.dingOn = function(){
        $scope.ding = true;
        console.log("Called dingOn");
      };

      // This function should unlock the queue, alowing people to join the queue
      $scope.dingOff = function(){
        $scope.ding = false;
        console.log("Called dingOff");
      };
      // This function allows the user to schedule labs (times when the queue will be unlocked)
      $scope.schedule = function(){
        modals.scheduleModal({
          title: "Schedule labs",
          remove: function () {
            socket.emit('removeSchedules', {queueName: $scope.queue});
          },
          add: function (schedule) {
            socket.emit('addSchedule', {queueName: $scope.queue, schedule: schedule});
          }
        });
      };

      // Function to send a message to every user in the queue
      $scope.broadcast = function(){
        console.log("Called broadcast");
        modals.submitModal({
          title: "Enter a message to broadcast",
          placeholder: "",
          buttonText: "Broadcast",
          callback: function (message) {
            console.log("Sending message");
            if(message){
              console.log("Message is = " + message);
              socket.emit('broadcast', {
                queueName: $scope.queue,
                message: message
              });
            }
          }
        });
      };

      // Function to send a message to every TA handeling the queue
      $scope.broadcastTA = function(){
        console.log("Called broadcast");
        modals.submitModal({
          title: "Enter a message to broadcast to TAs",
          placeholder: "",
          buttonText: "Broadcast",
          callback: function (message) {
            console.log("Sending message");
            if(message){
              console.log("Sending message");
              console.log("$scope.queue = " + $scope.queue);
              socket.emit('broadcastFaculty', {
                queueName:$scope.queue,
                message:message
              });
            }
          }
        });
      };

      // Function to add am essage of the day
      $scope.setMOTD = function(){
        console.log("Called setMOTD");
        modals.setModal({
          title: "Enter a new message of the day",
          placeholder: $scope.MOTD ? "Current MOTD: " + $scope.MOTD : "",
          removeButton: {text: "Remove MOTD", callback: function () {
            socket.emit('setMOTD', {
              queueName: $scope.queue,
              MOTD: ""
            });
          }},
          setButton: {text: "Set MOTD", callback: function (message) {
            if(message){
              socket.emit('setMOTD', {
                queueName: $scope.queue,
                MOTD: message
              });
            }
          }}
        });
      };

      // Function to add am essage of the day
      $scope.setInfo = function(){
        console.log("Called setInfo");
        modals.setModal({
          title: "Enter new queue info",
          placeholder: "",
          removeButton: {text: "Remove info", callback: function () {
            socket.emit('setInfo', {
              queueName: $scope.queue,
              info: ""
            });
          }},
          setButton: {text: "Set info", callback: function (message) {
            if(message){
              socket.emit('setInfo', {
                queueName: $scope.queue,
                info: message
              });
            }
          }}
        });
      };

      // When an admin wants to see the admin options
      $scope.changeVisibility = function(ugKthid){
        console.log(ugKthid);
        if($scope.accessLevel > 0){
          if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            console.log("compare");
            for(var i = 0; i < $scope.users.length; i++){
              if($scope.users[i].ugKthid === ugKthid){
                $scope.users[i].optionsActivated = !$scope.users[i].optionsActivated;
                break;
              }
            }
          }else{
            console.log("compare2");
            if($scope.lastClick === ugKthid){
              if(Date.now() - $scope.clickTime <= 500){
                for(var j = 0; j < $scope.users.length; j++){
                  if($scope.users[j].ugKthid === ugKthid){
                    $scope.users[j].optionsActivated = !$scope.users[j].optionsActivated;
                    break;
                  }
                }
              }else{
                $scope.clickTime = Date.now();
              }
            }else{
              $scope.lastClick = ugKthid;
              $scope.clickTime = Date.now();
            }
          }
        }
      };

      // When an admin wants to see the admin options
      // (This method is to prevent hiding the row when on a phone)
      $scope.changeVisibilityDbl = function(ugKthid){
        for(var i = 0; i < $scope.users.length; i++){
          if($scope.users[i].ugKthid === ugKthid){
            $scope.users[i].optionsActivated = !$scope.users[i].optionsActivated;
            break;
          }
        }
      };

      // This function should direct the user to the wanted page
      $scope.redirect = function(address){
        $location.hash("");
        $location.path('/' + address);
      };

      $scope.externalLink = function(address){
        window.location = address;
      };

      // Return true if the booking is taking place approximately now
      $scope.soon = function(booking){
        return booking.time - Date.now() < TIME_BOOKING;
      };

      // Return true if any of the people in the group is in the queue
      $scope.attending = function(booking){
        var group = booking.users;
        for(var index in group){
          var name = group[index];
          if(present(name)){
            return true;
          }
        }
        return false;
      };

      // Return true if the person does not have a booking about now
      $scope.notHasBooking = function(user){
        return !$scope.hasBooking(user);
      };

      // Return true if the person has a booking about now
      $scope.hasBooking = function(user){
        var name = user.name;
        for(var index in $scope.bookedUsers){
          var booking = $scope.bookedUsers[index];
          for(var i in booking.users){
            var name1 = booking.users[i];
            if(name1 === name){
              if($scope.soon(booking)){
                return true;
              }
            }
          }
        }
        return false;
      };

      // Returns true if the given person is queueing at the moment, otherwise false
      function present (ugKthid) {
        for(var index in $scope.users){
          var ugKthid1 = $scope.users[index].ugKthid;
          if(ugKthid === ugKthid1){
            return true;
          }
        }
        return false;
      }

      // Returns true if the given person is queueing at the moment, otherwise false
      function getBooking (name) {
        for(var index in $scope.bookedUsers){
          var booking = $scope.bookedUsers[index];
          for(var i in booking.users){
            var name1 = booking.users[i];
            if(name1 === name){
              return booking;
            }
          }
        }
        return undefined;
      }

      // Returns an array of the groupmembers locations, empty if noone is queueing #bookingsystem!
      $scope.getLocations = function(group){
        console.log("Entered getLocations");
        var retList = [];
        for(var i in group){
          var name = group[i];
          for(var j in $scope.users){
            var name1 = $scope.users[j].name;
            if(name === name1){
              retList.push($scope.users[j].location);
              break;
            }
          }
        }
        return retList;
      };

      // This function checks if a person in the normal queue matches the search-string.
      $scope.match = function (user) {
        if(!$scope.search){
          return true;
        }
        var regEx = new RegExp($scope.search.toLowerCase());
        return regEx.test(user.location.toLowerCase()) || regEx.test(user.comment.toLowerCase());
      };

      // This function checks if a person in the booked queue matches the search-string.
      $scope.matchBooked = function (user) {
        if(!$scope.search){
          return true;
        }
        var regEx = new RegExp($scope.search.toLowerCase());
        return (regEx.test(user.name.toLowerCase()) || regEx.test(user.location.toLowerCase()) ||  regEx.test(user.comment.toLowerCase()) ||  regEx.test(user.time.toLowerCase()));
      };

      // Gives the color for the square besides a users location
    $scope.colorLocation = function (location) {
      location = location.toLowerCase();
      pattern = /(blue|blå|red|röd|orange|yellow|gul|green|grön|brown|brun|grey|gray|grå|karmosin|white|vit|magenta|violett|turkos|turquoise|game|play|spel|sport|music|musik|art|konst|food|mat)/g;

      var result = "";
      try {
        result = location.match(pattern)[0];
      }catch(err) {
        result = null;
      }
      switch(result) {
        case "blue":
          return "blue";
        case "blå":
          return "blue";
        case "red":
          return "red";
        case "röd":
          return "red";
        case "orange":
          return "#FF7F00";
        case "yellow":
          return "yellow";
        case "gul":
          return "yellow";
        case "green":
          return "green";
        case "grön":
          return "green";
        case "brown":
          return "brown";
        case "brun":
          return "brown";
        case "grey":
          return "grey";
        case "gray":
          return "grey";
        case "grå":
          return "grey";
        case "karmosin":
          return "#D91536";
        case "white":
          return "white";
        case "vit":
          return "white";
        case "magenta":
          return "magenta";
        case "violett":
          return "#AC00E6";
        case "turquoise":
          return "turquoise";
        case "turkos":
          return "turquoise";
        case "game":
          return "#E6ADAD";
        case "play":
          return "#E6ADAD";
        case "spel":
          return "#E6ADAD";
        case "sport":
          return "#ADADE6";
        case "music":
          return "#ADE7AD";
        case "musik":
          return "#ADE7AD";
        case "art":
          return "#E8E7AF";
        case "konst":
          return "#E8E7AF";
        case "food":
          return "#E8C9AF";
        case "mat":
          return "#E8C9AF";
        default:
          return "transparent";
      }
    };

    $scope.$on('$viewContentLoaded', function(event) {
      $timeout(function() {
        $scope.name = user.getName();
        $scope.ugKthid = user.getUgKthid();
        $scope.loggedIn = user.isLoggedIn();
        $scope.accessLevel = user.accessLevelFor($scope.queue);
        matchToQueue();
        if(user.getLocation()){
          $scope.location = user.getLocation();
          $scope.fixedLocation = true;
        }
      },1000);
    });

  }])
.directive('bookedUsers', function(){
  return {
    restrict: 'E',
    templateUrl: 'queue/bookedUsers.html'
  };
});
})();
