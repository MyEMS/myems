'use strict';
app.factory('HybridPowerStationPCSService', function($http) {
    return {
        getAllHybridPowerStationPCSes: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationpcses', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationPCSesByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/pcses', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationPCS: function(id, hybridpowerstationpcs, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/pcses',{data:hybridpowerstationpcs}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationPCS: function(id, hybridpowerstationpcs, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/pcses/'+hybridpowerstationpcs.id,{data:hybridpowerstationpcs}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationPCS: function(id, hybridpowerstationpcsID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/pcses/'+hybridpowerstationpcsID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, pcsid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/pcses/' + pcsid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, pcsid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/pcses/' + pcsid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByPCSID: function(id, pcsid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/pcses/' + pcsid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
