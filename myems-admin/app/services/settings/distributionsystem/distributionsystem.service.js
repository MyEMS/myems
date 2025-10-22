'use strict';
app.factory('DistributionSystemService', function($http) {
    return {
        getAllDistributionSystems:function(headers, callback){
            $http.get(getAPI()+'distributionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchDistributionSystems: function(query, headers, callback) {
            $http.get(getAPI()+'distributionsystems', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addDistributionSystem: function(distributionsystem, headers, callback) {
            $http.post(getAPI()+'distributionsystems',{data:distributionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editDistributionSystem: function(distributionsystem, headers, callback) {
            $http.put(getAPI()+'distributionsystems/'+distributionsystem.id,{data:distributionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteDistributionSystem: function(distributionsystem, headers, callback) {
            $http.delete(getAPI()+'distributionsystems/'+distributionsystem.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportDistributionSystem: function(distributionsystem, headers, callback) {
            $http.get(getAPI()+'distributionsystems/'+distributionsystem.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importDistributionSystem: function(importdata, headers, callback) {
            $http.post(getAPI()+'distributionsystems/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneDistributionSystem: function(distributionsystem, headers, callback) {
            $http.post(getAPI()+'distributionsystems/'+distributionsystem.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
