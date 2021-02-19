'use strict';
app.factory('MeterPointService', function($http) {
    return {
        addPair: function(meterID,pointID,callback) {
            $http.post(getAPI()+'meters/'+meterID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(meterID,pointID, callback) {
            $http.delete(getAPI()+'meters/'+meterID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsByMeterID: function(id, callback) {
            $http.get(getAPI()+'meters/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
