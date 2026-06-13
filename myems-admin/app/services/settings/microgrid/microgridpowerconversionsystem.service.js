'use strict';

// Microgrid Power Conversion System service - REST API wrapper
app.factory('MicrogridPowerconversionsystemService', function($http) {
    return {
        // GET all microgrid powerconversionsystems
        getAllMicrogridPowerconversionsystems: function(headers, callback) {
            $http.get(getAPI()+'microgridpowerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid powerconversionsystems by microgrid id by ID
        getMicrogridPowerconversionsystemsByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/powerconversionsystems', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid powerconversionsystem
        addMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystem, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/powerconversionsystems',{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid powerconversionsystem
        editMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystem, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/powerconversionsystems/'+microgridpowerconversionsystem.id,{data:microgridpowerconversionsystem}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid powerconversionsystem
        deleteMicrogridPowerconversionsystem: function(id, microgridpowerconversionsystemyID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/powerconversionsystems/'+microgridpowerconversionsystemyID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create power conversion system pair
        addPowerConversionSystemPair: function(id, pcid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/powerconversionsystems/'+pcid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE power conversion system pair
        deletePowerConversionSystemPair: function(id, pcid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/powerconversionsystems/'+pcid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by power conversion system id by ID
        getPointsByPowerConversionSystemID: function(id, pcid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/powerconversionsystems/'+pcid+'/points',
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