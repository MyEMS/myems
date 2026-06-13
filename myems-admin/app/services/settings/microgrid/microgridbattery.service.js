'use strict';

// Microgrid Battery service - REST API wrapper
app.factory('MicrogridBatteryService', function($http) {
    return {
        // GET all microgrid batteries
        getAllMicrogridBatteries: function(headers, callback) {
            $http.get(getAPI()+'microgridbatteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid batteries by microgrid id by ID
        getMicrogridBatteriesByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/batteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid battery
        addMicrogridBattery: function(id, microgridbattery, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/batteries',{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid battery
        editMicrogridBattery: function(id, microgridbattery, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/batteries/'+microgridbattery.id,{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid battery
        deleteMicrogridBattery: function(id, microgridbatteryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/batteries/'+microgridbatteryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create battery pair
        addBatteryPair: function(id, bid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/batteries/'+bid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE battery pair
        deleteBatteryPair: function(id, bid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/batteries/'+bid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by battery id by ID
        getPointsByBatteryID: function(id, bid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/batteries/'+bid+'/points',
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
