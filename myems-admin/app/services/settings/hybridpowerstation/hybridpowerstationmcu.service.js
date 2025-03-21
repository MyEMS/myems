'use strict';
app.factory('HybridPowerStationMCUService', function($http) {
    return {
        getAllHybridPowerStationMCUs: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationmcus', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationMCUsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/mcus', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationMCU: function(id, hybridpowerstationmcu, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/mcus',{data:hybridpowerstationmcu}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationMCU: function(id, hybridpowerstationmcu, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/mcus/'+hybridpowerstationmcu.id,{data:hybridpowerstationmcu}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationMCU: function(id, hybridpowerstationmcuyID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/mcus/'+hybridpowerstationmcuyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, gid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/mcus/' + gid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, gid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/mcus/' + gid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByMCUID: function(id, gid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/mcus/' + gid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
