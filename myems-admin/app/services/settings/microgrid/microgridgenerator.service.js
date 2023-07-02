'use strict';
app.factory('MicrogridGeneratorService', function($http) {
    return {
        getAllMicrogridGenerators: function(headers, callback) {
            $http.get(getAPI()+'microgridgenerators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridGeneratorsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/generators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridGenerator: function(microgridgenerator, headers, callback) {
            $http.post(getAPI()+'/microgridgenerators',{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridGenerator: function(microgridgenerator, headers, callback) {
            $http.put(getAPI()+'/microgridgenerators/'+microgridgenerator.id,{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridGenerator: function(microgridgeneratoryID, headers, callback) {
            $http.delete(getAPI()+'/microgridgenerators/'+microgridgeneratoryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
