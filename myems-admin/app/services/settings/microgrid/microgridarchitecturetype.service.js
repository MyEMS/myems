'use strict';
app.factory('MicrogridArchitectureTypeService', function($http) {
    return {
        getAllMicrogridArchitectureTypes:function(headers, callback){
            $http.get(getAPI()+'microgridarchitecturetypes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogridArchitectureTypes: function(query, headers, callback) {
            $http.get(getAPI()+'microgridarchitecturetypes', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridArchitectureType: function(microgrid_architecture_type, headers, callback) {
            $http.post(getAPI()+'microgridarchitecturetypes',{data:microgrid_architecture_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridArchitectureType: function(microgrid_architecture_type, headers, callback) {
            $http.put(getAPI()+'microgridarchitecturetypes/'+microgrid_architecture_type.id,{data:microgrid_architecture_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridArchitectureType: function(microgrid_architecture_type, headers, callback) {
            $http.delete(getAPI()+'microgridarchitecturetypes/'+microgrid_architecture_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
