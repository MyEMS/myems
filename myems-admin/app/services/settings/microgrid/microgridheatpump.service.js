'use strict';

// Microgrid Heat Pump service - REST API wrapper
app.factory('MicrogridHeatpumpService', function($http) {
    return {
        // GET all microgrid heatpumps
        getAllMicrogridHeatpumps: function(headers, callback) {
            $http.get(getAPI()+'microgridheatpumps', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid heatpumps by microgrid id by ID
        getMicrogridHeatpumpsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/heatpumps', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid heatpump
        addMicrogridHeatpump: function(id, microgridheatpump, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/heatpumps',{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid heatpump
        editMicrogridHeatpump: function(id, microgridheatpump, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/heatpumps/'+microgridheatpump.id,{data:microgridheatpump}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE microgrid heatpump
        deleteMicrogridHeatpump: function(id, microgridheatpumpyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/heatpumps/'+microgridheatpumpyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create heat pump pair
        addHeatPumpPair: function(id, hid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/heatpumps/'+hid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE heat pump pair
        deleteHeatPumpPair: function(id, hid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/heatpumps/'+hid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by heat pump id by ID
        getPointsByHeatPumpID: function(id, hid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/heatpumps/'+hid+'/points',
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
