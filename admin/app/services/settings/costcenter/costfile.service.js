'use strict';
app.factory('CostFileService', function($http) {
    return {
        getAllCostFiles:function(headers, callback){
            $http.get(getAPI()+'costfiles', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCostFile: function(costfile, headers, callback) {
            $http.post(getAPI()+'costfiles', {data:costfile}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        restoreCostFile: function (costfile, headers, callback) {
            $http.get(getAPI() + 'costfiles/' + costfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCostFile: function(costfile, headers, callback) {
            $http.delete(getAPI()+'costfiles/' + costfile.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});