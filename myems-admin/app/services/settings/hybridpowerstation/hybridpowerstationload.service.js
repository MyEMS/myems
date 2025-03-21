'use strict';
app.factory('HybridPowerStationLoadService', function($http) {
    return {
        getAllHybridPowerStationLoads: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationloads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationLoadsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/loads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationLoad: function(id, hybridpowerstationload, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/loads',{data:hybridpowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationLoad: function(id, hybridpowerstationload, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/loads/'+hybridpowerstationload.id,{data:hybridpowerstationload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationLoad: function(id, hybridpowerstationloadyID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/loads/'+hybridpowerstationloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, lid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/loads/' + lid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, lid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/loads/' + lid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByLoadID: function(id, lid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/loads/' + lid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
