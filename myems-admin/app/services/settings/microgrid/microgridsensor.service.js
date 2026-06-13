'use strict';

// Microgrid Sensor service - REST API wrapper
app.factory('MicrogridSensorService', function($http) {
    return {
        // POST create pair
        addPair: function(microgridID,sensorID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(microgridID,sensorID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET sensors by microgrid id by ID
        getSensorsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/sensors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
