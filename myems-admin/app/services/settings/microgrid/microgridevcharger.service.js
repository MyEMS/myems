'use strict';

// Microgrid EV Charger service - REST API wrapper
app.factory('MicrogridEVChargerService', function($http) {
    return {
        // GET all microgrid ev chargers
        getAllMicrogridEVChargers: function(headers, callback) {
            $http.get(getAPI()+'microgridevchargers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET microgrid ev chargers by microgrid id by ID
        getMicrogridEVChargersByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/evchargers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create microgrid ev charger
        addMicrogridEVCharger: function(id, microgridevcharger, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/evchargers',{data:microgridevcharger}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update microgrid ev charger
        editMicrogridEVCharger: function(id, microgridevcharger, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/evchargers/'+microgridevcharger.id,{data:microgridevcharger}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE microgrid ev charger
        deleteMicrogridEVCharger: function(id, microgridevchargeryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/evchargers/'+microgridevchargeryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create ev charger pair
        addEVChargerPair: function(id, eid, pid, headers, callback) {
            $http.post(
                getAPI()+'microgrids/'+id+'/evchargers/'+eid+'/points',
                {data: {point_id: pid}},
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE ev charger pair
        deleteEVChargerPair: function(id, eid, pid, headers, callback) {
            $http.delete(
                getAPI()+'microgrids/'+id+'/evchargers/'+eid+'/points/'+pid,
                {headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by ev charger id by ID
        getPointsByEVChargerID: function(id, eid, headers, callback) {
            $http.get(
                getAPI()+'microgrids/'+id+'/evchargers/'+eid+'/points',
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
