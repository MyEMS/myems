'use strict';
app.factory('MicrogridWindturbineService', function($http) {
    return {
        getAllMicrogridWindturbines: function(callback) {
            $http.get(getAPI()+'microgridwindturbines')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridWindturbinesByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/windturbines')
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
