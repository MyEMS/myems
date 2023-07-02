'use strict';
app.factory('MicrogridHeatpumpService', function($http) {
    return {
        getAllMicrogridHeatpumps: function(headers, callback) {
            $http.get(getAPI()+'microgridheatpumps', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridHeatpumpsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/heatpumps', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridHeatpump: function(microgridheatpump, headers, callback) {
            $http.post(getAPI()+'/microgridheatpumps',{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridHeatpump: function(microgridheatpump, headers, callback) {
            $http.put(getAPI()+'/microgridheatpumps/'+microgridheatpump.id,{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridHeatpump: function(microgridheatpumpyID, headers, callback) {
            $http.delete(getAPI()+'/microgridheatpumps/'+microgridheatpumpyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
