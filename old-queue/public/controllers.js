var queueControllers = angular.module('queueControllers', []);

queueControllers.controller('listController', ['$scope', 'HttpService', '$location', 'WebSocketService', 'UserService', 'TitleService',
  function($scope, http, $location, socket, user, title) {
    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners();
      socket.emit('stopListening', 'lobby');
    });
    socket.emit('listen', 'lobby');

    title.title = "Stay A While";
    $scope.queues = [];
    http.get('queueList', function(response) {
      $scope.queues = response;
      for (var index in $scope.queues) {
        http.get('queue/' + $scope.queues[index].name, apiGetQueue);
      }
    });

    function apiGetQueue(response) {
      var queue = getQueue(response.name);
      queue.position = -1;
      queue.queue = response.queue;
      for (var i in queue.queue) {
        if (queue.queue[i].ugKthid === user.getUgKthid()) {
          queue.position = parseInt(i, 10) + 1;
          break;
        }
      }
    }
    user.updateUserData();

    // Listen for a person joining a queue.
    socket.on('lobbyjoin', function(data) {
      console.log("A user joined (lobby) " + data.queueName);
      var queue = getQueue(data.queueName);
      queue.queue.push({
        ugKthid: data.ugKthid
      });
      queue.length++;
      if (data.ugKthid === user.getUgKthid()) {
        getQueue(data.queueName).position = getQueue(data.queueName).length;
      }
    });

    // Listen for a person leaving a queue.
    socket.on('lobbyleave', function(data) {
      console.log("A user left (lobby) " + data.queueName);
      var queue = getQueue(data.queueName);
      queue.length--;
      for (var i in queue.queue) {
        if (queue.queue[i].ugKthid === data.ugKthid) {
          queue.queue.splice(i, 1);
          if (parseInt(i, 10) + 1 === queue.position) {
            queue.position = -1;
          } else if (parseInt(i, 10) + 1 < queue.position) {
            queue.position--;
          }
          break;
        }
      }
    });

    // Listen for queue geting purged.
    socket.on('lobbypurge', function(queueName) {
      console.log(queueName + " was purged (lobby)");
      var queue = getQueue(queueName);
      queue.length = 0;
      queue.queue = [];
      queue.position = -1;
    });

    // Listen for a queue being locked.
    socket.on('lobbylock', function(queue) {
      console.log(queue + " was locked (lobby)");
      getQueue(queue).locked = true;
    });

    // Listen for a queue being unlocked.
    socket.on('lobbyunlock', function(queue) {
      console.log(queue + " was unlocked (lobby)");
      getQueue(queue).locked = false;
    });

    // Listen for a queue going to sleep.
    socket.on('lobbyhide', function(queue) {
      console.log(queue + " was sent to sleep (lobby)");
      getQueue(queue).hiding = true;
    });

    // Listen for a queue waking up.
    socket.on('lobbyshow', function(queue) {
      console.log(queue + " was awoken (lobby)");
      getQueue(queue).hiding = false;
    });

    function getQueue(queue) {
      for (var index in $scope.queues) {
        if ($scope.queues[index].name === queue) {
          return $scope.queues[index];
        }
      }
    }
      // This function should direct the user to the wanted page
    $scope.redirect = function(queue) {
      console.log("Trying to enter queue : " + queue.name);
      if (!queue.locked || $scope.accessLevel(queue.name) > 0) {
        console.log("Allowed to enter queue : " + queue.name);
        $location.hash("");
        $location.path('/queue/' + queue.name);
      }
    };

    $scope.accessLevel = function(queueName) {
      if (user.isAdmin()) {
        return 3;
      }
      return user.accessLevelFor(queueName);
    };

    $scope.noMatch = function(queueName) {
      if (!$scope.search) {
        return false;
      }
      return !(new RegExp($scope.search.toLowerCase()).test(queueName.toLowerCase()));
    };

  }
]);

queueControllers.controller('aboutController', ['$scope', 'TitleService', 'HttpService',
  function($scope, title, http) {
    title.title = "About | Stay A While";
    console.log('entered about.html');
    $scope.contributors = {StayAWhile:[], QWait:[]};
    http.get('../aboutData.json', function(data) {
      console.log("Aboutdata: ");
      console.log(data);
      $scope.contributors = data;
    });
  }
]);

queueControllers.controller('helpController', ['$scope', 'TitleService', 'UserService',
  function($scope, title, user) {
    title.title = "Help | Stay A While";
    console.log('entered help.html');
    $scope.accessLevel = user.accessLevel();
    console.log("$scope.accessLevel = " + $scope.accessLevel);
  }
]);

queueControllers.controller('loginController', ['$scope', '$location', 'HttpService', 'TitleService', 'WebSocketService', 'ModalService',
  function($scope, $location, http, title, socket, modals) {
    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners();
    });

    title.title = "Log in | Stay A While";

    $scope.done = function() {
      console.log("Reached done()");
      http.post('setUser', {realname: $scope.name}, function(response) {
        http.get('serverMessage', function(resp){
          if(resp.serverMessage){
            console.log("There is a serverMessage");
            modals.getModal({title: "Server message", message: resp.serverMessage, sender: ""});
          }
        });
        $location.path('list');
      });
      socket.emit('setUser', {
        realname: $scope.name,
        admin: $scope.type === 'admin'
      });
      console.log("I set the user with socket");
    };

  }
]);

queueControllers.controller('navigationController', ['$scope', '$location', 'UserService', 'HttpService', 'ModalService', 'WebSocketService',
  function($scope, $location, user, http, modals, socket) {
    $scope.location = $location.path();
    $scope.realname = user.getRealname();

    $scope.$watch(function() {
      return $location.path();
    }, function(newValue, oldValue) {
      $scope.location = newValue;
      console.log("Detected update to $location.path() (oldValue = " + oldValue + ", newValue = " + newValue + ")");
    });

    $scope.$watch(function() {
      return user.getRealname();
    }, function(newValue, oldValue) {
      $scope.realname = newValue;
      console.log("Detected update to user.getRealname() (oldValue = " + oldValue + ", newValue = " + newValue + ")");
    });

    // Listen for the server setting a new server-message
    socket.on('serverMessage', function(message) {
      modals.getModal({title: "Server message", message: message, sender: ""});
    });

    // Loggin out
    $scope.logOut = function() {

        user.clearData();
        $scope.realname = "";
        console.log("logged out");
        window.location = "logout";
    };

    $scope.externalLink = function(address){
      window.location = address;
    };

    // This function should direct the user to the wanted page
    $scope.redirect = function(address) {
      $location.hash("");
      $location.path('/' + address);
      $scope.location = $location.path();
      console.log("location = " + $scope.location);
    };

    $scope.accessLevel = function() {
      return user.accessLevel();
    };

    $(document).ready(function() {
      $(".navbar-nav li a").click(function(event) {
        $(".navbar-collapse").collapse('hide');
      });
    });
  }
]);


queueControllers.controller('TitleController', ['$scope', 'TitleService',
  function($scope, title) {
    console.log(title);
    $scope.title = title.title;

    $scope.$watch(function() {
      return title.title;
    }, function(newValue, oldValue) {
      $scope.title = newValue;
    });
  }
]);

queueControllers.controller('399Controller', ['$scope',
  function($scope) {
    window.location = "http://queue.csc.kth.se:43677/";
  }
]);
