'use strict';
app.factory('HybridPowerStationGeneratorService', function($http) {
    return {
        getAllHybridPowerStationGenerators: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationgenerators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationGeneratorsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/generators', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationGenerator: function(id, hybridpowerstationgenerator, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/generators',{data:hybridpowerstationgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationGenerator: function(id, hybridpowerstationgenerator, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/generators/'+hybridpowerstationgenerator.id,{data:hybridpowerstationgenerator}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationGenerator: function(id, hybridpowerstationgeneratorID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/generators/'+hybridpowerstationgeneratorID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, fid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/generators/' + fid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, fid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/generators/' + fid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByGeneratorID: function(id, fid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/generators/' + fid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
