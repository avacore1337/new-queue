(function(){
  var app = angular.module("statistics.statistics", [
    'ui.bootstrap',
    'ngRoute'
    ])

  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/statistics', {
        templateUrl: 'statistics/statistics.html',
        controller: 'statisticsController'
      });
    }])


  .controller('statisticsController', ['$scope', 'HttpService', 'WebSocketService', 'TitleService', 'UserService',
  function($scope, http, socket, title, user) {
    $scope.chartObject = {
      "type": "LineChart",
      "displayed": false,
      "data": {
        "cols": [
          {
            "id": "datetime-id",
            "label": "Datetime",
            "type": "datetime",
            "p": {}
          },
          {
            "id": "total-id",
            "label": "Total",
            "type": "number",
            "p": {}
          },
          {
            "id": "help-id",
            "label": "Help",
            "type": "number",
            "p": {}
          },
          {
            "id": "present-id",
            "label": "Present",
            "type": "number",
            "p": {}
          },
          {
            "id": "",
            "role": "tooltip",
            "type": "string",
            "p": {
              "role": "tooltip",
              "html": true
            }
          }
        ],
        "rows": [
          // {
          //   "c": [
          //     {"v": new Date(1453727779700)},
          //     {"v": 5},
          //     {"v": 3},
          //     {"v": 2}
          //   ]
          // },
          // {
          //   "c": [
          //     {"v": new Date(1453727781424)},
          //     {"v": 8},
          //     {"v": 5},
          //     {"v": 3}
          //   ]
          // },
          // {
          //   "c": [
          //     {"v": new Date(1453727783020)},
          //     {"v": 3},
          //     {"v": 2},
          //     {"v": 1}
          //   ]
          // },
          // {
          //   "c": [
          //     {"v": new Date(1453727784402)},
          //     {"v": 2},
          //     {"v": 2},
          //     {"v": 0}
          //   ]
          // },
          // {
          //   "c": [
          //     {"v": new Date(1453727784888)},
          //     {"v": 3},
          //     {"v": 3},
          //     {"v": 0}
          //   ]
          // },
          // {
          //   "c": [
          //     {"v": new Date(1453727786983)},
          //     {"v": 4},
          //     {"v": 3},
          //     {"v": 1}
          //   ]
          // }
        ]
      },
      "options": {
        "title": "Queue Length",
        "isStacked": "true",
        "fill": 20,
        "displayExactValues": true,
        "vAxis": {
          "title": "Students",
          "gridlines": {
            "count": 5
          }
        },
        "hAxis": {
          "title": "Date"
        },
        "tooltip": {
          "isHtml": true
        }
      },
      "formatters": {},
      "view": {
        "columns": [
          0,
          1,
          2,
          3,
        ]
      }
    };

    $scope.$on('$destroy', function (event) {
      socket.removeAllListeners();
    });

    title.title = "Statistics | Stay A While";
    $scope.name = user.getName();

    socket.on('JSONStatistics', function(data) {
      $scope.chartObject.data.rows = [];
      for (i = 0; i < data.length; i++) {
        $scope.chartObject.data.rows.push({
          "c": [
            {"v": new Date(data[i].time)},
            {"v": data[i].queueLength},
            {"v": data[i].helpAmount},
            {"v": data[i].presentAmount}
          ]
        });
      }
      // console.log("The server gave me some raw statistics =)");
      // console.log(data);
      $scope.rawJSON = JSON.stringify(data);
      $scope.showJSONField = true;
    });

    socket.on('statistics', function(data) {
      // averageQueueTime
      // formatQueueTime(data.averageQueueTime);
      $scope.showData = true;
      $scope.peopleHelped = data.peopleHelped;
      $scope.peoplePresented = data.peoplePresented;
      $scope.leftInQueue = data.leftInQueue;
    });

    $scope.showJSONField = false;
    $scope.showData = false;
    $scope.rawJSON = [];

    // Listen for new statistics.
    function formatQueueTime(milliseconds) {
      var seconds = (milliseconds / 1000) % 60;
      var minutes = (milliseconds / (1000 * 60)) % 60;
      var hours = (milliseconds / (1000 * 60 * 60)) % 24;
      if (hours > 1) {
        $scope.averageQueueTime = Math.floor(hours) + "h " + Math.floor(minutes) + "m " + Math.floor(seconds) + "s";
      } else if (minutes > 1) {
        $scope.averageQueueTime = Math.floor(minutes) + "m " + Math.floor(seconds) + "s";
      } else if (seconds > 1) {
        $scope.averageQueueTime = Math.floor(seconds) + "s";
      } else {
        $scope.averageQueueTime = "0s";
      }
    }

    // Queue selection
    $scope.queues = [];
    http.get('queueList', function(response) {
      //var temp = response.sort(function(a, b) {return a.name.localeCompare(b.name);});
      for (var i in response) {
        if(user.isAdmin() || user.isTeacher(response[i].name)){
          http.get('queue/' + response[i].name, function(resp){
            $scope.queues.push(resp.name);
          });
        }
      }
    });

    $scope.selectedQueue = undefined;
    $scope.selectQueue = function(queue) {
      console.log("Selected queue : " + queue);
      $scope.selectedQueue = queue;
      document.getElementById('dropdown').innerHTML = queue;
      console.log("selected queue = " + $scope.selectedQueue);
    };

    // Date
    $scope.today = function() {
      $scope.dtFrom = new Date();
      $scope.dtTo = new Date();
      $scope.today = new Date();
    };
    $scope.today();

    $scope.open = function($event, opened) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope[opened] = true;
    };

    // Time
    $scope.toTime = new Date();
    $scope.toTime.setMinutes(0);
    $scope.toTime.setSeconds(0);
    $scope.fromTime = new Date();
    $scope.fromTime.setHours($scope.toTime.getHours()-2);
    $scope.fromTime.setMinutes(0);
    $scope.fromTime.setSeconds(0);

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.$watch(function() {
      return $scope.toTime;
    }, function(newValue, oldValue) {
      if(newValue < $scope.fromTime){
        $scope.toTime = $scope.fromTime;
      }
      console.log("Detected update to $scope.toTime (oldValue = " + oldValue + ", newValue = " + newValue + ")");
    });

    $scope.$watch(function() {
      return $scope.fromTime;
    }, function(newValue, oldValue) {
      if(newValue > $scope.toTime){
        $scope.fromTime = $scope.toTime;
      }
      console.log("Detected update to $scope.fromTime (oldValue = " + oldValue + ", newValue = " + newValue + ")");
    });

    // Statistics
    $scope.getStatistics = function() {
      socket.emit('getStatistics', {
        queueName: $scope.selectedQueue,
        start: $scope.fromTime.getTime(),
        end: $scope.toTime.getTime(),
        user: $scope.name
      });
      console.log("Requested statistics");
    };

    $scope.getJSONStatistics = function() {
      socket.emit('getJSONStatistics', {
        queueName: $scope.selectedQueue,
        start: $scope.fromTime.getTime(),
        end: $scope.toTime.getTime(),
        user: $scope.name
      });
      console.log("Requested statistics");
    };

    $scope.accessLevel = function() {
      return user.accessLevel();
    };

  }
]);
})();
