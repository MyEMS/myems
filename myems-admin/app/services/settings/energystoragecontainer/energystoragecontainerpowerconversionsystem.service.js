'use strict';
app.factory('EnergyStorageContainerPowerconversionsystemService', function($http) {
    return {
        getAllEnergyStorageContainerPowerconversionsystems: function(headers, callback) {
            $http.get(getAPI()+'energystoragecontainerpowerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/powerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainerPowerconversionsystem: function(id, energystoragecontainerpowerconversionsystem, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+id+'/powerconversionsystems',{data:energystoragecontainerpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainerPowerconversionsystem: function(id, energystoragecontainerpowerconversionsystem, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+id+'/powerconversionsystems/'+energystoragecontainerpowerconversionsystem.id,{data:energystoragecontainerpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStorageContainerPowerconversionsystem: function(id, energystoragecontainerpowerconversionsystemyID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+id+'/powerconversionsystems/'+energystoragecontainerpowerconversionsystemyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, pcsid, pid, headers, callback) {
            $http.post(getAPI() + 'energystoragecontainers/' + id + '/powerconversionsystems/' + pcsid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, pcsid, pid, headers, callback) {
            $http.delete(getAPI() + 'energystoragecontainers/' + id + '/powerconversionsystems/' + pcsid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByPCSID: function(id, pcsid, headers, callback) {
            $http.get(getAPI() + 'energystoragecontainers/' + id + '/powerconversionsystems/' + pcsid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
