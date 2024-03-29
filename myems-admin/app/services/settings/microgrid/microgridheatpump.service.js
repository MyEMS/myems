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
        addMicrogridHeatpump: function(id, microgridheatpump, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/heatpumps',{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridHeatpump: function(id, microgridheatpump, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/heatpumps/'+microgridheatpump.id,{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridHeatpump: function(id, microgridheatpumpyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/heatpumps/'+microgridheatpumpyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
