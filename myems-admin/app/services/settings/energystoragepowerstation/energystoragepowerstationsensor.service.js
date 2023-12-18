'use strict';
app.factory('EnergyStoragePowerStationSensorService', function($http) {
    return {
        addPair: function(energystoragepowerstationID,sensorID, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations/'+energystoragepowerstationID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(energystoragepowerstationID,sensorID, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+energystoragepowerstationID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByEnergyStoragePowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
