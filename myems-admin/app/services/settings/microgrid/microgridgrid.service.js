'use strict';
app.factory('MicrogridGridService', function($http) {
    return {
        getAllMicrogridGrids: function(callback) {
            $http.get(getAPI()+'microgridgrids')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridGridsByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/grids')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridGrid: function(microgridgrid, headers, callback) {
            $http.post(getAPI()+'/microgridgrids',{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridGrid: function(microgridgrid, headers, callback) {
            $http.put(getAPI()+'/microgridgrids/'+microgridgrid.id,{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridGrid: function(microgridgridyID, headers, callback) {
            $http.delete(getAPI()+'/microgridgrids/'+microgridgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
