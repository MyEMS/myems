'use strict';
app.factory('PhotovoltaicPowerStationGridService', function($http) {
    return {
        getAllPhotovoltaicPowerStationGrids: function(headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstationgrids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/grids', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgrid, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+id+'/grids',{data:photovoltaicpowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgrid, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+photovoltaicpowerstationgrid.id,{data:photovoltaicpowerstationgrid}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePhotovoltaicPowerStationGrid: function(id, photovoltaicpowerstationgridyID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+id+'/grids/'+photovoltaicpowerstationgridyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
