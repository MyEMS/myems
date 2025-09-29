'use strict';
app.factory('MicrogridDataSourceService', function($http) {
    return {
        addPair: function(microgridID, dataSourceID, headers, callback) {
            $http.post(getAPI()+'microgrids/'+microgridID+'/datasources',{data:{'data_source_id':dataSourceID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(microgridID, dataSourceID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+microgridID+'/datasources/'+dataSourceID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSourcesByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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