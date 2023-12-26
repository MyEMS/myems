'use strict';
app.factory('EnergyStorageContainerSensorService', function($http) {
    return {
        addPair: function(energystoragecontainerID,sensorID, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(energystoragecontainerID,sensorID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+energystoragecontainerID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
