/*
 * Licensed under the Apache License, Version 2.0
 * See accompanying LICENSE file.
 */

angular.module('dashboard')

  .config(['$stateProvider',
    function($stateProvider) {
      'use strict';

      $stateProvider
        .state('streamingapp.processor', {
          url: '/processor/:processorId',
          templateUrl: 'views/apps/streamingapp/processor.html',
          controller: 'StreamingAppProcessorCtrl'
        });
    }])

  .controller('StreamingAppProcessorCtrl', ['$scope', '$state', '$stateParams', '$propertyTableBuilder',
    function($scope, $state, $stateParams, $ptb) {
      'use strict';

      $scope.processor = $scope.activeProcessor ||
        $scope.dag.processors[$stateParams.processorId];
      if (!$scope.processor) {
        return $state.go('streamingapp.overview', {appId: $stateParams.appId});
      }

      $scope.processorInfoTable = [
        $ptb.text('Task Class').done(),
        $ptb.number('Parallelism').done(),
        $ptb.text('Inputs').done(),
        $ptb.text('Outputs').done(),
        $ptb.text('Life Time').done()
      ];

      function updateProcessorInfoTable(processor) {
        var connections = $scope.dag.calculateProcessorConnections(processor.id);
        angular.merge($scope.processorInfoTable, [
          {value: processor.taskClass},
          {value: processor.parallelism},
          {value: connections.inputs + ' processor(s)'},
          {value: connections.outputs + ' processor(s)'},
          {value: 'Birth=' + processor.life.birth + ', Death=' + processor.life.death}
        ]);

        $scope.tasks = {
          selected: [],
          available: function() {
            var array = [];
            for (var i = 0; i < processor.parallelism; ++i) {
              array.push('T' + i);
            }
            return array;
          }()
        };
      }

      updateProcessorInfoTable($scope.processor);

      var skewData = $scope.dag.getReceivedMessages($scope.processor.id).rate;
      var skewDataOption = {
        height: '110px',
        color: 'rgb(66,180,230)',
        valueFormatter: function(value) {
          return Number(value).toFixed(0) + ' msg/s';
        },
        data: _.map($scope.tasks.available, function(taskName, i) {
          return {x: taskName, y: skewData[i]};
        })
      };

      $scope.receiveSkewChart = {
        options: skewDataOption
      };
    }])
;