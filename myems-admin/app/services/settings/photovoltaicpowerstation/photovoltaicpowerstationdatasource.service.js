'use strict';
app.factory('PhotovoltaicPowerStationDataSourceService', function($http) {
    return {
        addPair: function(photovoltaicPowerStationID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+photovoltaicPowerStationID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(photovoltaicPowerStationID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicPowerStationID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
