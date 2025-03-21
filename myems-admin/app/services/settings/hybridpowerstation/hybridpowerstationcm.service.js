'use strict';
app.factory('HybridPowerStationCMService', function($http) {
    return {
        getAllHybridPowerStationCMs: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationcms', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationCMsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/cms', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationCM: function(id, hybridpowerstationcm, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/cms',{data:hybridpowerstationcm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationCM: function(id, hybridpowerstationcm, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/cms/'+hybridpowerstationcm.id,{data:hybridpowerstationcm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationCM: function(id, hybridpowerstationcmID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/cms/'+hybridpowerstationcmID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, fid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/cms/' + fid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, fid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/cms/' + fid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByDCDCID: function(id, fid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/cms/' + fid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
