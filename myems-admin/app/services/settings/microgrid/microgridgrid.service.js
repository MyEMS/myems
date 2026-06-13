'use strict';

// Microgrid Grid service - REST API wrapper
app.factory('MicrogridGridService', function($http) {
    return {
        // GET all microgrid grids
        getAllMicrogridGrids: function(headers, callback) {
            $http.get(getAPI()+'microgridgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid grids by microgrid id by ID
        getMicrogridGridsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/grids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid grid
        addMicrogridGrid: function(id, microgridgrid, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/grids',{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid grid
        editMicrogridGrid: function(id, microgridgrid, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/grids/'+microgridgrid.id,{data:microgridgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid grid
        deleteMicrogridGrid: function(id, microgridgridyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/grids/'+microgridgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create grid pair
        addGridPair: function(id, gid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/grids/'+gid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE grid pair
        deleteGridPair: function(id, gid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/grids/'+gid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by grid id by ID
        getPointsByGridID: function(id, gid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/grids/'+gid+'/points',
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
