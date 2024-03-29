'use strict';
app.factory('MicrogridPhotovoltaicService', function($http) {
    return {
        getAllMicrogridPhotovoltaics: function(headers, callback) {
            $http.get(getAPI()+'microgridphotovoltaics', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridPhotovoltaicsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/photovoltaics', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridPhotovoltaic: function(id, microgridphotovoltaic, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/photovoltaics',{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridPhotovoltaic: function(id, microgridphotovoltaic, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/photovoltaics/'+microgridphotovoltaic.id,{data:microgridphotovoltaic}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridPhotovoltaic: function(id, microgridphotovoltaicyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/photovoltaics/'+microgridphotovoltaicyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
