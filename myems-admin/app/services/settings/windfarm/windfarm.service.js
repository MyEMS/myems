'use strict';

// Wind Farm service - REST API wrapper
app.factory('WindFarmService', function($http) {
    return {
        // GET all wind farms
        getAllWindFarms:function(headers, callback){
            $http.get(getAPI()+'windfarms', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search wind farms by query
        searchWindFarms: function(query, headers, callback) {
            $http.get(getAPI()+'windfarms', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create wind farm
        addWindFarm: function(windfarm, headers, callback) {
            $http.post(getAPI()+'windfarms',{data:windfarm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update wind farm
        editWindFarm: function(windfarm, headers, callback) {
            $http.put(getAPI()+'windfarms/'+windfarm.id,{data:windfarm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE wind farm
        deleteWindFarm: function(windfarm, headers, callback) {
            $http.delete(getAPI()+'windfarms/'+windfarm.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export wind farm
        exportWindFarm: function(windfarm, headers, callback) {
            $http.get(getAPI()+'windfarms/'+windfarm.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import wind farm
        importWindFarm: function(importdata, headers, callback) {
            $http.post(getAPI()+'windfarms/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone wind farm
        cloneWindFarm: function(windfarm, headers, callback) {
            $http.post(getAPI()+'windfarms/'+windfarm.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
