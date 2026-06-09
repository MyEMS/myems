'use strict';

// Cost File service - REST API wrapper
app.factory('CostFileService', function($http) {
    return {
        // GET all cost files
        getAllCostFiles:function(headers, callback){
            $http.get(getAPI()+'costfiles', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create cost file
        addCostFile: function(costfile, headers, callback) {
            $http.post(getAPI()+'costfiles', {data:costfile}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // API: restore cost file
        restoreCostFile: function (costfile, headers, callback) {
            $http.get(getAPI() + 'costfiles/' + costfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE cost file
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