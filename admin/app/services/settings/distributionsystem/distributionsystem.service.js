'use strict';
app.factory('DistributionSystemService', function($http) {
    return {
        getAllDistributionSystems:function(callback){
            $http.get(getAPI()+'distributionsystems')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchDistributionSystems: function(query, callback) {
            $http.get(getAPI()+'distributionsystems', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addDistributionSystem: function(distributionsystem, callback) {
            $http.post(getAPI()+'distributionsystems',{data:distributionsystem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editDistributionSystem: function(distributionsystem, callback) {
            $http.put(getAPI()+'distributionsystems/'+distributionsystem.id,{data:distributionsystem})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteDistributionSystem: function(distributionsystem, callback) {
            $http.delete(getAPI()+'distributionsystems/'+distributionsystem.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getDistributionSystem: function(id, callback) {
            $http.get(getAPI()+'distributionsystems/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
