'use strict';
app.factory('MicrogridWindturbineService', function($http) {
    return {
        getAllMicrogridWindturbines: function(headers, callback) {
            $http.get(getAPI()+'microgridwindturbines', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridWindturbinesByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/windturbines', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridWindturbine: function(microgridwindturbine, headers, callback) {
            $http.post(getAPI()+'/microgridwindturbines',{data:microgridwindturbine}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridWindturbine: function(microgridwindturbine, headers, callback) {
            $http.put(getAPI()+'/microgridwindturbines/'+microgridwindturbine.id,{data:microgridwindturbine}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridWindturbine: function(microgridwindturbineyID, headers, callback) {
            $http.delete(getAPI()+'/microgridwindturbines/'+microgridwindturbineyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
