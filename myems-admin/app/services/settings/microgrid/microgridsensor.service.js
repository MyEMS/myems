'use strict';
app.factory('MicrogridSensorService', function($http) {
    return {
        addPair: function(microgridID,sensorID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/sensors',{data:{'sensor_id':sensorID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(microgridID,sensorID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/sensors/'+sensorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSensorsByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/sensors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
