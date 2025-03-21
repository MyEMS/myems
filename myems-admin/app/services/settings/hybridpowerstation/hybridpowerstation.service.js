'use strict';
app.factory('HybridPowerStationService', function($http) {
    return {
        getAllHybridPowerStations:function(headers, callback){
            $http.get(getAPI()+'hybridpowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchHybridPowerStations: function(query, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStation: function(hybridpowerstation, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations',{data:hybridpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStation: function(hybridpowerstation, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+hybridpowerstation.id,{data:hybridpowerstation}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStation: function(hybridpowerstation, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+hybridpowerstation.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportHybridPowerStation: function(hybridpowerstation, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+hybridpowerstation.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importHybridPowerStation: function(importdata, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneHybridPowerStation: function(hybridpowerstation, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+hybridpowerstation.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
