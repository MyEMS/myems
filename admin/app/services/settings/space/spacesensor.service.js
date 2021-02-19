'use strict';
app.factory('SpaceSensorService', function($http) {
    return {
        addPair: function(spaceID,sensorID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/sensors',{data:{'sensor_id':sensorID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID,sensorID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/sensors/'+sensorID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getSensorsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/sensors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
