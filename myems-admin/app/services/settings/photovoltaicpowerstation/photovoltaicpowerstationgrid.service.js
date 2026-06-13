'use strict';

// Photovoltaic Power Station Grid service - REST API wrapper
app.factory('PhotovoltaicPowerStationGridService', function($http) {
    return {
        // GET all photovoltaic power station grids
        getAllPhotovoltaicPowerStationGrids: function(headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstationgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET photovoltaic power station grids by photovoltaic power station id by ID
        getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/grids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create photovoltaic power station grid
        addPhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgrid, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+id+'/grids',{data:photovoltaicpowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update photovoltaic power station grid
        editPhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgrid, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+photovoltaicpowerstationgrid.id,{data:photovoltaicpowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE photovoltaic power station grid
        deletePhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgridyID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+photovoltaicpowerstationgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create pair
        addPair: function(id, gid, pid, headers, callback) {
            $http.post(
                getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+gid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE pair
        deletePair: function(id, gid, pid, headers, callback) {
            $http.delete(
                getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+gid+'/points/'+pid,
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
                getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+gid+'/points',
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
