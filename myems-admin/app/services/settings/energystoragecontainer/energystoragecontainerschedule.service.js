'use strict';
app.factory('EnergyStorageContainerScheduleService', function($http) {
    return {
        getAllEnergyStorageContainerSchedules: function(headers, callback) {
            $http.get(getAPI()+'energystoragecontainerschedules', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStorageContainerSchedulesByEnergyStorageContainerID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragecontainers/'+id+'/schedules', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStorageContainerSchedule: function(id, energystoragecontainerschedule, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+id+'/schedules',{data:energystoragecontainerschedule}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStorageContainerSchedule: function(id, energystoragecontainerschedule, headers, callback) {
            $http.put(getAPI()+'energystoragecontainers/'+id+'/schedules/'+energystoragecontainerschedule.id,{data:energystoragecontainerschedule}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEnergyStorageContainerSchedule: function(id, energystoragecontainerscheduleyID, headers, callback) {
            $http.delete(getAPI()+'energystoragecontainers/'+id+'/schedules/'+energystoragecontainerscheduleyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
