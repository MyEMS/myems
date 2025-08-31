'use strict';
app.factory('MicrogridBatteryService', function($http) {
    return {
        getAllMicrogridBatteries: function(headers, callback) {
            $http.get(getAPI()+'microgridbatteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridBatteriesByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/batteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridBattery: function(id, microgridbattery, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/batteries',{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridBattery: function(id, microgridbattery, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/batteries/'+microgridbattery.id,{data:microgridbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridBattery: function(id, microgridbatteryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/batteries/'+microgridbatteryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
