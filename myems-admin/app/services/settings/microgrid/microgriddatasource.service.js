'use strict';

// Microgrid Data Source service - REST API wrapper
app.factory('MicrogridDataSourceService', function($http) {
    return {
        // POST create pair
        addPair: function(microgridID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(microgridID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data sources by microgrid id by ID
        getDataSourcesByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data source points by microgrid id by ID
        getDataSourcePointsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/datasourcepoints', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});