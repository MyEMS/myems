'use strict';
app.factory('MicrogridEVChargerService', function($http) {
    return {
        getAllMicrogridEVChargers: function(headers, callback) {
            $http.get(getAPI()+'microgridevchargers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getMicrogridEVChargersByMicrogridID: function(id, headers, callback) {
            $http.get(getAPI()+'microgrids/'+id+'/evchargers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addMicrogridEVCharger: function(id, microgridevcharger, headers, callback) {
            $http.post(getAPI()+'microgrids/'+id+'/evchargers',{data:microgridevcharger}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editMicrogridEVCharger: function(id, microgridevcharger, headers, callback) {
            $http.put(getAPI()+'microgrids/'+id+'/evchargers/'+microgridevcharger.id,{data:microgridevcharger}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteMicrogridEVCharger: function(id, microgridevchargeryID, headers, callback) {
            $http.delete(getAPI()+'microgrids/'+id+'/evchargers/'+microgridevchargeryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
