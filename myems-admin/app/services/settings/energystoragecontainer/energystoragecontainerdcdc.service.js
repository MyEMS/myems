'use strict';
app.factory('EnergyStorageContainerDCDCService', function($http) {
    return {
        getAllEnergyStorageContainerDCDCs: function(headers, callback) {
            $http.get(getAPI()+'energystoragecontainerdcdcs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStorageContainerDCDCsByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/dcdcs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainerDCDC: function(id, energystoragecontainerdcdc, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+id+'/dcdcs',{data:energystoragecontainerdcdc}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainerDCDC: function(id, energystoragecontainerdcdc, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+id+'/dcdcs/'+energystoragecontainerdcdc.id,{data:energystoragecontainerdcdc}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStorageContainerDCDC: function(id, energystoragecontainerdcdcID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+id+'/dcdcs/'+energystoragecontainerdcdcID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addPair: function(id, fid, pid, headers, callback) {
            $http.post(getAPI() + 'energystoragecontainers/' + id + '/dcdcs/' + fid + '/points', {data:{'point_id':pid}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deletePair: function(id, fid, pid, headers, callback) {
            $http.delete(getAPI() + 'energystoragecontainers/' + id + '/dcdcs/' + fid + '/points/' + pid, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByDCDCID: function(id, fid, headers, callback) {
            $http.get(getAPI() + 'energystoragecontainers/' + id + '/dcdcs/' + fid + '/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
