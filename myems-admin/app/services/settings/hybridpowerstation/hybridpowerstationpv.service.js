'use strict';
app.factory('HybridPowerStationPVService', function($http) {
    return {
        getAllHybridPowerStationPVs: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationpvs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationPVsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/pvs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationPV: function(id, hybridpowerstationpv, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/pvs',{data:hybridpowerstationpv}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationPV: function(id, hybridpowerstationpv, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/pvs/'+hybridpowerstationpv.id,{data:hybridpowerstationpv}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteHybridPowerStationPV: function(id, hybridpowerstationpvID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/pvs/'+hybridpowerstationpvID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, hid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/pvs/' + hid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, hid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/pvs/' + hid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByPVID: function(id, hid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/pvs/' + hid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
