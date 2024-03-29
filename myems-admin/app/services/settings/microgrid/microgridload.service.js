'use strict';
app.factory('MicrogridLoadService', function($http) {
    return {
        getAllMicrogridLoads: function(headers, callback) {
            $http.get(getAPI()+'microgridloads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridLoadsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/loads', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridLoad: function(id, microgridload, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/loads',{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridLoad: function(id, microgridload, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/loads/'+microgridload.id,{data:microgridload}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridLoad: function(id, microgridloadyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/loads/'+microgridloadyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
