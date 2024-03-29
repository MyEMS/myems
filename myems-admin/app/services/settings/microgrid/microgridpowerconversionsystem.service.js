'use strict';
app.factory('MicrogridPowerconversionsystemService', function($http) {
    return {
        getAllMicrogridPowerconversionsystems: function(headers, callback) {
            $http.get(getAPI()+'microgridpowerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridPowerconversionsystemsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/powerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystem, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/powerconversionsystems',{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystem, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/powerconversionsystems/'+microgridpowerconversionsystem.id,{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystemyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/powerconversionsystems/'+microgridpowerconversionsystemyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
