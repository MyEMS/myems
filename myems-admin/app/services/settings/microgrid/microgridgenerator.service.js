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
        addMicrogridGenerator: function(id, microgridgenerator, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/generators',{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridGenerator: function(id, microgridgenerator, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/generators/'+microgridgenerator.id,{data:microgridgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridGenerator: function(id, microgridgeneratoryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/generators/'+microgridgeneratoryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
