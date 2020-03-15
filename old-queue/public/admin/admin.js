(function(){
  var app = angular.module("admin.admin", [
    'ui.bootstrap',
    'ngRoute'
    ])

  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/administration', {
        templateUrl: 'admin/administration.html',
        controller: 'adminController'
      });
    }])


  .controller('adminController', ['$scope', '$location', 'HttpService', '$modal', 'WebSocketService', 'UserService', 'TitleService', 'ModalService',
    function ($scope, $location, http, $modal, socket, user, title, modals) {
      $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        socket.emit('stopListening', 'admin');
      });
      socket.emit('listen', 'admin');

      title.title = "Admin | Stay A While";
      console.log("Entered admin.html");
      $scope.realname = user.getName();
      $scope.selectedQueue = undefined;
      $scope.dropdown = undefined;
      $scope.admins = [];
      http.get('adminList', function(response){
        $scope.admins = response;
      });

      $scope.serverMessage = "";
      http.get('serverMessage', function(resp){
        $scope.serverMessage = resp.serverMessage;
      });

      $scope.queues = [];
      http.get('queueList', function(response){
        for (var i in response) {
          if(user.isAdmin() || user.isTeacher(response[i].name)){
            http.get('queue/' + response[i].name, function(resp){
              $scope.queues.push(resp);
            });
          }
        }
      });

    // Listen for an assistant being added to a queue.
    socket.on('addAssistant', function (data) {
      console.log("adding assistant (from backend) queueName = " + data.queueName + ", realname = " + data.realname + ", username = " + data.username);
      var queue = getQueue(data.queueName);
      if(queue){
        getQueue(data.queueName).assistant.push({realname:data.realname, username:data.username, ugKthid:data.ugKthid, addedBy: data.addedBy});
      }
    });

    // Listen for a teacher being added to a queue.
    socket.on('removeAssistant', function (data) {
      console.log("Backend wants to remove the assistant " + data.ugKthid + " from the queue " + data.queueName);
      for (var i = $scope.queues.length - 1; i >= 0; i--) {
        if($scope.queues[i].name === data.queueName){
          for (var j = $scope.queues[i].assistant.length - 1; j >= 0; j--) {
            if($scope.queues[i].assistant[j].ugKthid === data.ugKthid){
              $scope.queues[i].assistant.splice(j, 1);
              break;
            }
          }
          break;
        }
      }
    });

    // Listen for an teacher being added to a queue.
    socket.on('addAdmin', function (admin) {
      $scope.admins.push(admin);
      console.log("adding admin (from backend) name = " + admin.realname + ", username = " + admin.username + ", addedBy = " + admin.addedBy);
    });

    // Listen for an teacher being added to a queue.
    socket.on('removeAdmin', function (ugKthid) {
      console.log("Backend wants to remove the admin " + ugKthid);
      for (var i = $scope.admins.length - 1; i >= 0; i--) {
        if($scope.admins[i].ugKthid === ugKthid){
          $scope.admins.splice(i, 1);
          break;
        }
      }
    });

    // Listen for an teacher being added to a queue.
    socket.on('addTeacher', function (data) {
      console.log("adding teacher (from backend) queueName = " + data.queueName + ", realname = " + data.realname + ", username = " + data.username);
      var queue = getQueue(data.queueName);
      if(queue){
        getQueue(data.queueName).teacher.push({realname:data.realname, username:data.username, ugKthid:data.ugKthid, addedBy: data.addedBy});
      }
    });

    // Listen for an teacher being added to a queue.
    socket.on('removeTeacher', function (data) {
      console.log("Backend wants to remove the teacher " + data.ugKthid + " from the queue " + data.queueName);
      for (var i = $scope.queues.length - 1; i >= 0; i--) {
        if($scope.queues[i].name === data.queueName){
          for (var j = $scope.queues[i].teacher.length - 1; j >= 0; j--) {
            if($scope.queues[i].teacher[j].ugKthid === data.ugKthid){
              $scope.queues[i].teacher.splice(j, 1);
              break;
            }
          }
          break;
        }
      }
    });

    // Listen for a queue being hided.
    socket.on('hide', function (queue) {
      console.log("I will go to sleep (because backend)");
      for (var i = $scope.queues.length - 1; i >= 0; i--) {
        if(queue === $scope.queues[i].name){
          $scope.queues[i].hiding = true;
        }
      }
    });

    // Listen for a queue being showd.
    socket.on('show', function (queue) {
      console.log("I will wake up (because backend)");
      for (var i = $scope.queues.length - 1; i >= 0; i--) {
        if(queue === $scope.queues[i].name){
          $scope.queues[i].hiding = false;
        }
      }
    });

    // Listen for a queue being added.
    socket.on('addQueue', function (queue) {
      console.log("Backend wants to add the queue " + queue.name);
      $scope.queues.push(queue);
    });

    // Listen for the person leaving a queue event.
    socket.on('removeQueue', function (queue) {
      console.log("Backend wants to remove queue " + queue);
      for (var i = $scope.queues.length - 1; i >= 0; i--) {
        if(queue === $scope.queues[i].name){
          $scope.queues.splice(i, 1);
        }
      }
    });

    // Listen for the person leaving a queue event.
    socket.on('newServerMessage', function (message) {
      console.log("Backend wants to change the server-message to " + message);
      $scope.serverMessage = message;
    });

    function getQueue (queue) {
      for(var index in $scope.queues){
        if($scope.queues[index].name === queue){
          return $scope.queues[index];
        }
      }
    }

    $scope.addQueue = function(){
      if($scope.newQueue){
        socket.emit('addQueue', {
          queueName:$scope.newQueue
        });
        $scope.newQueue = "";
      }
    };

    $scope.removeQueue = function(){
      console.log("Called removeQueue");
      modals.confirmModal({
        title: "Delete queue",
        text: "Are you sure that you wish to remove " + $scope.selectedQueue.name + " permanently?",
        confirmButton: {text: "Yes, I never want to see it again.", callback: function () {
          socket.emit('removeQueue', {
            queueName:$scope.selectedQueue.name
          });
          console.log("Trying to delete queue " + $scope.selectedQueue.name);
          document.getElementById('dropdown').innerHTML = "Select Queue";
          $scope.selectedQueue = undefined;
        }},
        declineButton: {text: "No, I made a mistake.", callback: function () {}}
      });
    };

    $scope.hideQueue = function(){
      console.log("Called hideQueue");
      modals.confirmModal({
        title: "Hide queue",
        text: "Are you sure that you wish to hide " + $scope.selectedQueue.name + "? This means that only teachers and admins can enter and see the queue.",
        confirmButton: {text: "Yes, and conceal it well.", callback: function () {
          socket.emit('hide', {
            queueName: $scope.selectedQueue.name
          });
          console.log("Trying to hide queue " + $scope.selectedQueue.name);
        }},
        declineButton: {text: "No, keep it visible.", callback: function () {}}
      });
    };

  $scope.showQueue = function(){
    console.log("Called showQueue");
    modals.confirmModal({
      title: "Show queue",
      text: "Are you sure that you wish to show " + $scope.selectedQueue.name + "? This means that anyone can see and enter the queue.",
      confirmButton: {text: "Yes, show yourself!", callback: function () {
        socket.emit('show', {
          queue:$scope.selectedQueue.name
        });
        console.log("Trying to show queue " + $scope.selectedQueue.name);
      }},
      declineButton: {text: "No, keep it from prying eyes.", callback: function () {}}
    });
  };

  $scope.addAdmin = function(){
    if($scope.newAdmin){
      socket.emit('addAdmin', {
        username: $scope.newAdmin
      });
      console.log("Adding admin " + $scope.newAdmin);
      $scope.newAdmin = '';
    }
  };

  $scope.removeAdmin = function(ugKthid){
    socket.emit('removeAdmin', {
      ugKthid:ugKthid
    });
    console.log("Removing admin " + ugKthid);
  };

  $scope.addTeacher = function(){
    console.log("Trying to add a new teacher by the name '" + $scope.newTeacher + "'");
    if($scope.newTeacher){
      socket.emit('addTeacher', {
        username: $scope.newTeacher,
        queueName: $scope.selectedQueue.name
      });
      console.log("Adding teacher " + $scope.newTeacher + " in the queue " + $scope.selectedQueue.name);
      $scope.newTeacher = '';
    }
  };

  $scope.removeTeacher = function(ugKthid){
    socket.emit('removeTeacher', {
      ugKthid:ugKthid,
      queueName:$scope.selectedQueue.name
    });
    console.log("Removing teacher " + ugKthid + " in the queue " + $scope.selectedQueue.name);
  };

  $scope.addAssistant = function(){
    if($scope.newAssistant){
      socket.emit('addAssistant', {
        username: $scope.newAssistant,
        queueName: $scope.selectedQueue.name
      });
      console.log("Adding assistant " + $scope.newAssistant  + " in the queue " + $scope.selectedQueue.name);
      $scope.newAssistant = '';
    }
  };

  $scope.removeAssistant = function(ugKthid){
    socket.emit('removeAssistant', {
      ugKthid: ugKthid,
      queueName: $scope.selectedQueue.name
    });
    console.log("Removing assistant " + ugKthid  + " in the queue " + $scope.selectedQueue.name);
  };

  $scope.setServerMessage = function(){
    console.log("Called setServerMessage");
    modals.setModal({
      title: "Enter a message to show users upon loggin in",
      placeholder: $scope.serverMessage ? "Current server-message: " + $scope.serverMessage : "",
      setButton: {
        text: "Set message",
        callback: function (message) {
          if(message){
            socket.emit('addServerMessage', {
              message: message
            });
          }
        }
      },
      removeButton: {
        text: "Remove message",
        callback: function (message) {
          socket.emit('addServerMessage', {
            message: ""
          });
        }
      }
    });
  };

  $scope.selectQueue = function(queue){
    $scope.selectedQueue = queue;
    document.getElementById('dropdown').innerHTML = queue.name;
    console.log("selected queue = " + $scope.selectedQueue.name);
  };

  $scope.accessLevel = function() {
    return user.accessLevel();
  };


  }])
.directive('adminOptions', function () {
  return {
    restrict: 'E',
    templateUrl: 'admin/adminOptions.html'
  };
})
.directive('teacherOptions', function () {
  return {
    restrict: 'E',
    templateUrl: 'admin/teacherOptions.html'
  };
});
})();
