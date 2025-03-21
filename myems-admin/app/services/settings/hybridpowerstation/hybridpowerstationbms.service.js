'use strict';
app.factory('HybridPowerStationBMSService', function($http) {
    return {
        getAllHybridPowerStationBMSes: function(headers, callback) {
            $http.get(getAPI()+'hybridpowerstationbmses', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationBMSesByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/bmses', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addHybridPowerStationBMS: function(id, hybridpowerstationbms, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+id+'/bmses',{data:hybridpowerstationbms}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editHybridPowerStationBMS: function(id, hybridpowerstationbms, headers, callback) {
            $http.put(getAPI()+'hybridpowerstations/'+id+'/bmses/'+hybridpowerstationbms.id,{data:hybridpowerstationbms}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteHybridPowerStationBMS: function(id, hybridpowerstationbmsID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+id+'/bmses/'+hybridpowerstationbmsID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, bid, pid, headers, callback) {
            $http.post(getAPI() + 'hybridpowerstations/' + id + '/bmses/' + bid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, bid, pid, headers, callback) {
            $http.delete(getAPI() + 'hybridpowerstations/' + id + '/bmses/' + bid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByBMSID: function(id, bid, headers, callback) {
            $http.get(getAPI() + 'hybridpowerstations/' + id + '/bmses/' + bid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
