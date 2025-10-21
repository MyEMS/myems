'use strict';
app.factory('WindFarmService', function($http) {
    return {
        getAllWindFarms:function(headers, callback){
            $http.get(getAPI()+'windfarms', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchWindFarms: function(query, headers, callback) {
            $http.get(getAPI()+'windfarms', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addWindFarm: function(windfarm, headers, callback) {
            $http.post(getAPI()+'windfarms',{data:windfarm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editWindFarm: function(windfarm, headers, callback) {
            $http.put(getAPI()+'windfarms/'+windfarm.id,{data:windfarm}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteWindFarm: function(windfarm, headers, callback) {
            $http.delete(getAPI()+'windfarms/'+windfarm.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportWindFarm: function(windfarm, headers, callback) {
            $http.get(getAPI()+'windfarms/'+windfarm.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importWindFarm: function(importdata, headers, callback) {
            $http.post(getAPI()+'windfarms/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
