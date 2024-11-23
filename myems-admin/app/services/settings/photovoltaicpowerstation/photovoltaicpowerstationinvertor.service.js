'use strict';
app.factory('PhotovoltaicPowerStationInvertorService', function($http) {
    return {
        getAllPhotovoltaicPowerStationInvertors: function(headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstationinvertors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/invertors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertor, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+id+'/invertors',{data:photovoltaicpowerstationinvertor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertor, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+photovoltaicpowerstationinvertor.id,{data:photovoltaicpowerstationinvertor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePhotovoltaicPowerStationInvertor: function(id, photovoltaicpowerstationinvertoryID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+id+'/invertors/'+photovoltaicpowerstationinvertoryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
