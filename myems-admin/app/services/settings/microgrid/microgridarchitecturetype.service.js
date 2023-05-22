'use strict';
app.factory('MicrogridArchitectureTypeService', function($http) {
    return {
        getAllMicrogridArchitectureTypes:function(callback){
            $http.get(getAPI()+'microgridarchitecturetypes')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogridArchitectureTypes: function(query, callback) {
            $http.get(getAPI()+'microgridarchitecturetypes', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridArchitectureType: function(store_type, headers, callback) {
            $http.post(getAPI()+'microgridarchitecturetypes',{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridArchitectureType: function(store_type, headers, callback) {
            $http.put(getAPI()+'microgridarchitecturetypes/'+store_type.id,{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridArchitectureType: function(store_type, headers, callback) {
            $http.delete(getAPI()+'microgridarchitecturetypes/'+store_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
