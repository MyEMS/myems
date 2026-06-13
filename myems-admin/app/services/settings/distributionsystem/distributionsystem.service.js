'use strict';

// Distribution System service - REST API wrapper
app.factory('DistributionSystemService', function($http) {
    return {
        // GET all distribution systems
        getAllDistributionSystems:function(headers, callback){
            $http.get(getAPI()+'distributionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search distribution systems by query
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
        // POST create distribution system
        addDistributionSystem: function(distributionsystem, headers, callback) {
            $http.post(getAPI()+'distributionsystems',{data:distributionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update distribution system
        editDistributionSystem: function(distributionsystem, headers, callback) {
            $http.put(getAPI()+'distributionsystems/'+distributionsystem.id,{data:distributionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE distribution system
        deleteDistributionSystem: function(distributionsystem, headers, callback) {
            $http.delete(getAPI()+'distributionsystems/'+distributionsystem.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export distribution system
        exportDistributionSystem: function(distributionsystem, headers, callback) {
            $http.get(getAPI()+'distributionsystems/'+distributionsystem.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import distribution system
        importDistributionSystem: function(importdata, headers, callback) {
            $http.post(getAPI()+'distributionsystems/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone distribution system
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
