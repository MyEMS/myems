'use strict';

// Photovoltaic Power Station Data Source service - REST API wrapper
app.factory('PhotovoltaicPowerStationDataSourceService', function($http) {
    return {
        // POST create pair
        addPair: function(photovoltaicPowerStationID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+photovoltaicPowerStationID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(photovoltaicPowerStationID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicPowerStationID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data sources by photovoltaic power station id by ID
        getDataSourcesByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data source points by photovoltaic power station id by ID
        getDataSourcePointsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/datasourcepoints', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
