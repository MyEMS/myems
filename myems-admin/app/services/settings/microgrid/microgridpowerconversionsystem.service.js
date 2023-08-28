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
        addMicrogridPowerconversionsystem: function(microgridpowerconversionsystem, headers, callback) {
            $http.post(getAPI()+'/microgridpowerconversionsystems',{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridPowerconversionsystem: function(microgridpowerconversionsystem, headers, callback) {
            $http.put(getAPI()+'/microgridpowerconversionsystems/'+microgridpowerconversionsystem.id,{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridPowerconversionsystem: function(microgridpowerconversionsystemyID, headers, callback) {
            $http.delete(getAPI()+'/microgridpowerconversionsystems/'+microgridpowerconversionsystemyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
