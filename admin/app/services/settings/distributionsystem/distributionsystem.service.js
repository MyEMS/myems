'use strict';
app.factory('DistributionSystemService', function($http) {
    return {
        getAllDistributionSystems:function(callback){
            $http.get(getAPI()+'distributionsystems')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchDistributionSystems: function(query, callback) {
            $http.get(getAPI()+'distributionsystems', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addDistributionSystem: function(distributionsystem, callback) {
            $http.post(getAPI()+'distributionsystems',{data:distributionsystem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editDistributionSystem: function(distributionsystem, callback) {
            $http.put(getAPI()+'distributionsystems/'+distributionsystem.id,{data:distributionsystem})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteDistributionSystem: function(distributionsystem, callback) {
            $http.delete(getAPI()+'distributionsystems/'+distributionsystem.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDistributionSystem: function(id, callback) {
            $http.get(getAPI()+'distributionsystems/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
