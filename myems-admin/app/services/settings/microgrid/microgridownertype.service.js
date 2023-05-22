'use strict';
app.factory('MicrogridOwnerTypeService', function($http) {
    return {
        getAllMicrogridOwnerTypes:function(callback){
            $http.get(getAPI()+'microgridownertypes')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogridOwnerTypes: function(query, callback) {
            $http.get(getAPI()+'microgridownertypes', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridOwnerType: function(store_type, headers, callback) {
            $http.post(getAPI()+'microgridownertypes',{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridOwnerType: function(store_type, headers, callback) {
            $http.put(getAPI()+'microgridownertypes/'+store_type.id,{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridOwnerType: function(store_type, headers, callback) {
            $http.delete(getAPI()+'microgridownertypes/'+store_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
