'use strict';
app.factory('MicrogridService', function($http) {
    return {
        getAllMicrogrids:function(callback){
            $http.get(getAPI()+'microgrids')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogrids: function(query, callback) {
            $http.get(getAPI()+'microgrids', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogrid: function(microgrid, headers, callback) {
            $http.post(getAPI()+'microgrids',{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogrid: function(microgrid, headers, callback) {
            $http.put(getAPI()+'microgrids/'+microgrid.id,{data:microgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogrid: function(microgrid, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgrid.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
