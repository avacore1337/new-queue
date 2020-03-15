(function() {

  angular.module('queue')

  .factory('UserService', function($http) {

    var admin = false;

    var teacher = [];

    var assistant = [];

    var username = "";

    var realname = "";

    var ugKthid = "";

    var location = "";

    var loggedIn = false;

    function updateUserData() {
      $http.get('/API/userData').success(function(response) {
        username = response.username;
        ugKthid = response.ugKthid;
        realname = response.realname;
        admin = response.admin;
        teacher = response.teacher;
        assistant = response.assistant;
        location = response.location;
        loggedIn = false;
        if(username){
          loggedIn = true;
        }
      });
    }

    updateUserData();

    function isAssistant(queueName) {
      return $.inArray(queueName, assistant) !== -1;
    }

    function isTeacher(queueName) {
      return $.inArray(queueName, teacher) !== -1;
    }

    return {
      updateUserData: updateUserData,

      getName: function() {
        return username;
      },
      getRealname: function() {
        return realname;
      },
      getUgKthid: function() {
        return ugKthid;
      },

      isAdmin: function() {
        return admin;
      },

      isTeacher: isTeacher,

      isAssistant: isAssistant,

      getLocation: function() {
        return location;
      },

      accessLevel: function() {
        var ret = 0;
        if (!username) {
          return -1;
        }
        if (assistant.length > 0) {
          ret = 1;
        }
        if (teacher.length > 0) {
          ret = 2;
        }
        if (admin) {
          ret = 3;
        }
        return ret;
      },

      accessLevelFor: function(queueName) {
        var ret = 0;
        if (!username) {
          return -1;
        }
        if (isAssistant(queueName)) {
          ret = 1;
        }
        if (isTeacher(queueName)) {
          ret = 2;
        }
        return ret;
      },

      isLoggedIn: function() {
        return loggedIn;
      },

      clearData: function() {
        var admin = false;

        var teacher = [];

        var assistant = [];

        var username = "";

        var location = "";

        var loggedIn = false;
      }
    };
  })

  .factory('WebSocketService', function($rootScope) {

    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.removeAllListeners(eventName);
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      },
      // removeAllListeners: function(eventName, callback) { // Does not seem to work
      removeAllListeners: function(eventName, callback) { // Does not seem to work
        socket.removeAllListeners(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      }
    };
  })

  .factory('TitleService', function() {

    return {
      title: "Stay A While"
    };
  })

  .factory('HttpService', function($http) {
    return {
      post: function(path, data, callback){
        $http.post('/API/' + path, data, {withCredentials: true}).success(callback);
      },
      get: function(path, callback){
        $http.get('/API/' + path).success(callback);
      }
    };
  })

  .factory('UserListService', ['HttpService', 'WebSocketService', '$modal',
    function(http, socket, $modal) {

    var userList = [];

    // Listen for the person joining a queue event.
    socket.on('join', function (data) {
      console.log("joined: " +data );
      userList.push({name:data.name, location:data.location, comment:data.comment, time:data.time/1000});
    });

    // Listen for the person leaving a queue event.
    socket.on('leave', function (data) {
      for(var index in userList) {
        if(userList[index].name === data.name) {
          userList.splice(i, 1);
          break;
        }
      }
    });

    // Listen for the person updateing a queue event.
    socket.on('purge', function () {
      userList = [];
    });

    // Listen for a user chageing their information
    socket.on('update', function (data) {
      for(var index in userList) {
        if(userList[i].name === data.name) {
          userList[i].comment = data.comment;
          userList[i].location = data.location;
          break;
        }
      }
    });

    // Listen for a user getting flagged
    socket.on('flag', function (data) {
      for(var index in userList) {
        if(userList[i].name === data.name) {
          $scope.users[i].messages.push(data.message);
          break;
        }
      }
    });

    // Listen for a person getting help.
    socket.on('help', function (data) {
      for(var index in userList) {
        if(userList[i].name === data.name) {
          $scope.users[i].gettingHelp = true;
          break;
        }
      }
    });

    // Listen for a badLocation warning
    socket.on('badLocation', function (data) {
      var modalInstance = $modal.open({
        templateUrl: 'receiveMessage.html',
        controller: function ($scope, $modalInstance, title, message, sender) {
          $scope.title = title;
          $scope.message = message;
          $scope.sender = sender;
        },
        resolve: {
          title: function () {
            return "Unclear location";
          },
          message: function () {
            return "The teaching assistant in '" + data.queueName + "' could not locate you. The teaching assistant won't try to find you again until you have updated your information.";
          },
          sender: function () {
            return "- " + data.sender;
          }
        }
      });
    });

    return {
      updateUsers: function(queueName) {
        http.get('queue/' + queueName, function(response) {
          userList = response.queue;
        });
      },
      getUsers: function () {
        return userList;
      }
    };
  }])

  .factory('ModalService', ['$modal', '$timeout',
    function($modal, $timeout) {

      return {
        setModal: function (args) {
            var modalInstance = $modal.open({
            templateUrl: 'modals/setModal.html',
            controller: function ($scope, $modalInstance, title, placeholder, setButton, removeButton) {
              $scope.title = title;
              $scope.placeholder = placeholder;
              $scope.setButton = setButton;
              $scope.removeButton = removeButton;
              $scope.set = function () {
                $modalInstance.close({set: true, message: $scope.message});
              };
              $scope.remove = function () {
                $modalInstance.close({set: false, message: ""});
              };
            },
            resolve: {
              title: function () {
                return args.title;
              },
              placeholder: function () {
                return args.placeholder;
              },
              setButton: function () {
                return args.setButton;
              },
              removeButton: function () {
                return args.removeButton;
              }
            }
          });

          modalInstance.result.then(function (output) {
            if(output.set){
              args.setButton.callback(output.message);
            }else{
              args.removeButton.callback(output.message);
            }
          }, function () {});
        },
        submitModal: function (args) {
            var modalInstance = $modal.open({
            templateUrl: 'modals/submitModal.html',
            controller: function ($scope, $modalInstance, title, placeholder, buttonText) {
              $scope.title = title;
              $scope.placeholder = placeholder;
              $scope.buttonText = buttonText;
              $scope.submit = function () {
                $modalInstance.close($scope.message);
              };
            },
            resolve: {
              title: function () {
                return args.title;
              },
              placeholder: function () {
                return args.placeholder;
              },
              buttonText: function () {
                return args.buttonText;
              }
            }
          });

          modalInstance.result.then(function (message) {
            args.callback(message);
          }, function () {});
        },
        getModal: function (args) {
          var modalInstance = $modal.open({
            templateUrl: 'modals/getModal.html',
            controller: function ($scope, $modalInstance, title, message, sender) {
              $scope.title = title;
              $scope.message = message;
              $scope.sender = sender;
            },
            resolve: {
              title: function () {
                return args.title;
              },
              message: function () {
                return args.message;
              },
              sender: function () {
                return args.sender;
              }
            }
          });
        },
        twoChoice: function (args) {
          var modalInstance = $modal.open({
            templateUrl: 'modals/twoChoice.html',
            controller: function ($scope, $modalInstance, title, buttonOne, buttonTwo) {
              $scope.title = title;
              $scope.buttonOne = buttonOne;
              $scope.buttonTwo = buttonTwo;
              $scope.funcOne = function () {
                $modalInstance.close(true);
              };
              $scope.funcTwo = function () {
                $modalInstance.close(false);
              };
            },
            resolve: {
              title: function () {
                return args.title;
              },
              buttonOne: function () {
                return args.buttonOne;
              },
              buttonTwo: function () {
                return args.buttonTwo;
              }
            }
          });

          modalInstance.result.then(function (firstButton) {
            if(firstButton){
              args.buttonOne.callback();
            }else{
              args.buttonTwo.callback();
            }
          }, function () {});
        },
        listModal: function (args) {
          var modalInstance = $modal.open({
            templateUrl: 'modals/listModal.html',
            controller: function ($scope, $modalInstance, title, messages) {
              $scope.title = title;
              $scope.messages = messages;
            },
            resolve: {
              title: function () {
                return args.title;
              },
              messages: function () {
                return args.messages;
              }
            }
          });
        },
        confirmModal: function (args) {
            var modalInstance = $modal.open({
            templateUrl: 'modals/confirmModal.html',
            controller: function ($scope, $modalInstance, title, text, confirmButton, declineButton) {
              $scope.title = title;
              $scope.text = text;
              $scope.confirmButton = confirmButton;
              $scope.declineButton = declineButton;
              $scope.confirm = function () {
                $modalInstance.close(true);
              };
              $scope.decline = function () {
                $modalInstance.close(false);
              };
            },
            resolve: {
              title: function () {
                return args.title;
              },
              text: function () {
                return args.text;
              },
              confirmButton: function () {
                return args.confirmButton;
              },
              declineButton: function () {
                return args.declineButton;
              }
            }
          });

          modalInstance.result.then(function (confirmation) {
            if(confirmation){
              args.confirmButton.callback();
            }else{
              args.declineButton.callback();
            }
          }, function () {});
        },
        scheduleModal: function (args) {
            var modalInstance = $modal.open({
            templateUrl: 'modals/scheduleModal.html',
            controller: function ($scope, $modalInstance, title) {
              $scope.title = title;

              // Length of the lab
              $scope.length = new Date();
              $scope.length.setHours(2);
              $scope.length.setMinutes(0);
              $scope.length.setSeconds(0);

              // When the lab starts
              $scope.from = new Date();
              $scope.from.setHours(0);
              $scope.from.setMinutes(0);
              $scope.from.setSeconds(0);

              // The steps the timepickers will use
              $scope.hstep = 1;
              $scope.mstep = 1;

              $scope.open = function() {
                $timeout(function() {
                  $scope.opened = true;
                });
              };

              $scope.remove = function () {
                $modalInstance.close({confirmation: false, schedule:{}});
              };
              $scope.add = function () {
                var temp = new Date($scope.from);
                temp.setHours($scope.from.getHours() + $scope.length.getHours());
                temp.setMinutes($scope.from.getMinutes() + $scope.length.getMinutes());
                temp.setSeconds(0);
                console.log("from = " + $scope.from);
                console.log("to = " + temp);
                console.log("length = " + $scope.length.getHours() + ":" + $scope.length.getMinutes());
                $modalInstance.close({confirmation: true, schedule:[{start: $scope.from, end: temp}]});
              };
            },
            resolve: {
              title: function () {
                return args.title;
              }
            }
          });

          modalInstance.result.then(function (output) {
            if(output.confirmation){
              args.add(output.schedule);
            }else{
              args.remove();
            }
          }, function () {});
        }
      };
    }
  ]);

})();
