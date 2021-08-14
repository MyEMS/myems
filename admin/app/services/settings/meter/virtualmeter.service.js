'use strict';
app.factory('VirtualMeterService', function($http) {
    return {
        getAllVirtualMeters:function(callback){
            $http.get(getAPI()+'virtualmeters')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchVirtualMeters: function(query, callback) {
            $http.get(getAPI()+'virtualmeters', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addVirtualMeter: function(virtualmeter, callback) {
            $http.post(getAPI()+'virtualmeters',{data:virtualmeter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editVirtualMeter: function(virtualmeter, callback) {
            $http.put(getAPI()+'virtualmeters/'+virtualmeter.id,{data:virtualmeter})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteVirtualMeter: function(virtualmeter, callback) {
            $http.delete(getAPI()+'virtualmeters/'+virtualmeter.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
