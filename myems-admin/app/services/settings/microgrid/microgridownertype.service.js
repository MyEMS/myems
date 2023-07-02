'use strict';
app.factory('MicrogridOwnerTypeService', function($http) {
    return {
        getAllMicrogridOwnerTypes:function(headers, callback){
            $http.get(getAPI()+'microgridownertypes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchMicrogridOwnerTypes: function(query, headers, callback) {
            $http.get(getAPI()+'microgridownertypes', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridOwnerType: function(microgrid_owner_type, headers, callback) {
            $http.post(getAPI()+'microgridownertypes',{data:microgrid_owner_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridOwnerType: function(microgrid_owner_type, headers, callback) {
            $http.put(getAPI()+'microgridownertypes/'+microgrid_owner_type.id,{data:microgrid_owner_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridOwnerType: function(microgrid_owner_type, headers, callback) {
            $http.delete(getAPI()+'microgridownertypes/'+microgrid_owner_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
