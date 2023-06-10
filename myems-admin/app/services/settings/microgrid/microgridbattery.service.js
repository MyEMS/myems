'use strict';
app.factory('MicrogridBatteryService', function($http) {
    return {
        getAllMicrogridBatteries: function(callback) {
            $http.get(getAPI()+'microgridbatteries')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridBatteriesByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/batteries')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridBattery: function(microgridbattery, headers, callback) {
            $http.post(getAPI()+'/microgridbatteries',{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridBattery: function(microgridbattery, headers, callback) {
            $http.put(getAPI()+'/microgridbatteries/'+microgridbattery.id,{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridBattery: function(microgridbatteryID, headers, callback) {
            $http.delete(getAPI()+'/microgridbatteries/'+microgridbatteryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
