'use strict';

// Photovoltaic Power Station service - REST API wrapper
app.factory('PhotovoltaicPowerStationService', function($http) {
    return {
        // GET all photovoltaic power stations
        getAllPhotovoltaicPowerStations:function(headers, callback){
            $http.get(getAPI()+'photovoltaicpowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search photovoltaic power stations by query
        searchPhotovoltaicPowerStations: function(query, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create photovoltaic power station
        addPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations',{data:photovoltaicpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update photovoltaic power station
        editPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.put(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id,{data:photovoltaicpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE photovoltaic power station
        deletePhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export photovoltaic power station
        exportPhotovoltaicPowerStation: function(photovoltaicpowerstation, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstation.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import photovoltaic power station
        importPhotovoltaicPowerStation: function(importdata, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone photovoltaic power station
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
