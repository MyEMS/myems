'use strict';
app.factory('PhotovoltaicPowerStationService', function($http) {
    return {
        getAllPhotovoltaicPowerStations:function(headers, callback){
            $http.get(getAPI()+'photovoltaicpowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchPhotovoltaicPowerStations: function(query, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations',{data:photovoltaicpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id,{data:photovoltaicpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importPhotovoltaicPowerStation: function(importdata, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        clonePhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
