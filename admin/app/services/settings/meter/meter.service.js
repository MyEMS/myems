'use strict';
app.factory('MeterService', function($http) {
    return {
        getAllMeters:function(callback){
            $http.get(getAPI()+'meters')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeterSubmeters:function(meterid, callback){
            $http.get(getAPI()+'meters/'+meterid+'/submeters')
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
        addMeter: function(meter, callback) {
            $http.post(getAPI()+'meters',{data:meter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMeter: function(meter, callback) {
            $http.put(getAPI()+'meters/'+meter.id,{data:meter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMeter: function(meter, callback) {
            $http.delete(getAPI()+'meters/'+meter.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMeter: function(id, callback) {
            $http.get(getAPI()+'meters/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
