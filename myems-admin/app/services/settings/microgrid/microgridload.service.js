'use strict';
app.factory('MicrogridLoadService', function($http) {
    return {
        getAllMicrogridLoads: function(callback) {
            $http.get(getAPI()+'microgridloads')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridLoadsByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/loads')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridLoad: function(microgridload, headers, callback) {
            $http.post(getAPI()+'/microgridloads',{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridLoad: function(microgridload, headers, callback) {
            $http.put(getAPI()+'/microgridloads/'+microgridload.id,{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridLoad: function(microgridloadyID, headers, callback) {
            $http.delete(getAPI()+'/microgridloads/'+microgridloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
