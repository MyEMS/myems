'use strict';
app.factory('MicrogridPhotovoltaicService', function($http) {
    return {
        getAllMicrogridPhotovoltaics: function(callback) {
            $http.get(getAPI()+'microgridphotovoltaics')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridPhotovoltaicsByMicrogridID: function(id, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/photovoltaics')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridPhotovoltaic: function(microgridphotovoltaic, headers, callback) {
            $http.post(getAPI()+'/microgridphotovoltaics',{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridPhotovoltaic: function(microgridphotovoltaic, headers, callback) {
            $http.put(getAPI()+'/microgridphotovoltaics/'+microgridphotovoltaic.id,{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridPhotovoltaic: function(microgridphotovoltaicyID, headers, callback) {
            $http.delete(getAPI()+'/microgridphotovoltaics/'+microgridphotovoltaicyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
