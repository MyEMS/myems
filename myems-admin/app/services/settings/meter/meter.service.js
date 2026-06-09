'use strict';

// Meter service - REST API wrapper
app.factory('MeterService', function($http) {
    return {
        // GET all meters
        getAllMeters:function(headers, callback){
            $http.get(getAPI()+'meters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meter submeters by ID
        getMeterSubmeters:function(meterid, headers, callback){
            $http.get(getAPI()+'meters/'+meterid+'/submeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search meters by query
        searchMeters: function(query, headers, callback) {
            $http.get(getAPI()+'meters', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create meter
        addMeter: function(meter, headers, callback) {
            $http.post(getAPI()+'meters',{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update meter
        editMeter: function(meter, headers, callback) {
            $http.put(getAPI()+'meters/'+meter.id,{data:meter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE meter
        deleteMeter: function(meter, headers, callback) {
            $http.delete(getAPI()+'meters/'+meter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET meter by ID
        getMeter: function(id, headers, callback) {
            $http.get(getAPI()+'meters/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export meter
        exportMeter: function(meter, headers, callback) {
            $http.get(getAPI()+'meters/'+meter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import meter
        importMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'meters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone meter
        cloneMeter: function(meter, headers, callback) {
            $http.post(getAPI()+'meters/'+meter.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
