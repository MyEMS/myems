'use strict';

// Meter Point service - REST API wrapper
app.factory('MeterPointService', function($http) {
    return {
        // POST create pair
        addPair: function(meterID, pointID, headers, callback) {
            $http.post(getAPI() + 'meters/' + meterID + '/points', {data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(meterID,pointID, headers, callback) {
            $http.delete(getAPI() + 'meters/' + meterID + '/points/' + pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by meter id by ID
        getPointsByMeterID: function(id, headers, callback) {
            $http.get(getAPI() + 'meters/' + id + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
