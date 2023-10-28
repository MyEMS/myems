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
            $http.get(getAPI()+'windfarms', { params: { q: query } }, {headers})
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
    };
});
