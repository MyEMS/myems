'use strict';
app.factory('MicrogridGridService', function($http) {
    return {
        getAllMicrogridGrids: function(headers, callback) {
            $http.get(getAPI()+'microgridgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridGridsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/grids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridGrid: function(id, microgridgrid, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/grids',{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridGrid: function(id, microgridgrid, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/grids/'+microgridgrid.id,{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridGrid: function(id, microgridgridyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/grids/'+microgridgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
