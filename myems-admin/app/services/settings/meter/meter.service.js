'use strict';
app.factory('MeterService', function($http) {
    return {
        getAllMeters:function(headers, callback){
            $http.get(getAPI()+'meters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeterSubmeters:function(meterid, headers, callback){
            $http.get(getAPI()+'meters/'+meterid+'/submeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMeters: function(query, callback) {
            $http.get(getAPI()+'meters', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMeter: function(meter, headers, callback) {
            $http.post(getAPI()+'meters',{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMeter: function(meter, headers, callback) {
            $http.put(getAPI()+'meters/'+meter.id,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMeter: function(meter, headers, callback) {
            $http.delete(getAPI()+'meters/'+meter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeter: function(id, headers, callback) {
            $http.get(getAPI()+'meters/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
