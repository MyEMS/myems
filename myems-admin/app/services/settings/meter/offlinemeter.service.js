'use strict';
app.factory('OfflineMeterService', function($http) {  
    return {  
        getAllOfflineMeters:function(callback){
            $http.get(getAPI()+'offlinemeters')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },  
        searchOfflineMeters: function(query, callback) {  
            $http.get(getAPI()+'offlinemeters', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addOfflineMeter: function(offlinemeter, headers, callback) {
            $http.post(getAPI()+'offlinemeters',{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editOfflineMeter: function(offlinemeter, headers, callback) {
            $http.put(getAPI()+'offlinemeters/'+offlinemeter.id,{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        deleteOfflineMeter: function(offlinemeter, headers, callback) {
            $http.delete(getAPI()+'offlinemeters/'+offlinemeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getOfflineMeter: function(id, callback) {  
            $http.get(getAPI()+'offlinemeters/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  