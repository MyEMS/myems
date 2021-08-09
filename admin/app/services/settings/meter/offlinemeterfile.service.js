'use strict';
app.factory('OfflineMeterFileService', function($http) {  
    return {  
        getAllOfflineMeterFiles:function(callback){
            $http.get(getAPI()+'offlinemeterfiles')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        searchOfflineMeterFiles: function(query, callback) {  
            $http.get(getAPI()+'offlinemeterfiles', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        addOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.post(getAPI()+'offlinemeterfiles',{data:offlinemeterfile})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        editOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.put(getAPI()+'offlinemeterfiles/'+offlinemeterfile.id,{data:offlinemeterfile})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        restoreOfflineMeterFile: function (offlinemeterfile, callback) {
            $http.get(getAPI() + 'offlinemeterfiles/' + offlinemeterfile.id + '/restore')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        deleteOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.delete(getAPI()+'offlinemeterfiles/'+offlinemeterfile.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getOfflineMeterFile: function(id, callback) {  
            $http.get(getAPI()+'offlinemeterfiles/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  