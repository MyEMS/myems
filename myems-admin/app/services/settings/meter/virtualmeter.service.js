'use strict';
app.factory('VirtualMeterService', function($http) {
    return {
        getAllVirtualMeters:function(headers, callback){
            $http.get(getAPI()+'virtualmeters', {headers})
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
        addVirtualMeter: function(virtualmeter, headers, callback) {
            $http.post(getAPI()+'virtualmeters',{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editVirtualMeter: function(virtualmeter, headers, callback) {
            $http.put(getAPI()+'virtualmeters/'+virtualmeter.id,{data:virtualmeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteVirtualMeter: function(virtualmeter, headers, callback) {
            $http.delete(getAPI()+'virtualmeters/'+virtualmeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
