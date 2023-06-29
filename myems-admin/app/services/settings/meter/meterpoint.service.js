'use strict';
app.factory('MeterPointService', function($http) {
    return {
        addPair: function(meterID, pointID, headers, callback) {
            $http.post(getAPI() + 'meters/' + meterID + '/points', {data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(meterID,pointID, headers, callback) {
            $http.delete(getAPI() + 'meters/' + meterID + '/points/' + pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
