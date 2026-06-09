'use strict';

// IoT SIM Card service - REST API wrapper
app.factory('IoTSIMCardService', function($http) {
    return {
        // GET all io tsim cards
        getAllIoTSIMCards:function(headers, callback){
            $http.get(getAPI()+'iotsimcards', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search io tsim cards by query
        searchIoTSIMCards: function(query, headers, callback) {
            $http.get(getAPI()+'iotsimcards', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create io tsim card
        addIoTSIMCard: function(iotsimcard, headers, callback) {
            $http.post(getAPI()+'iotsimcards',{data:iotsimcard}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update io tsim card
        editIoTSIMCard: function(iotsimcard, headers, callback) {
            $http.put(getAPI()+'iotsimcards/'+iotsimcard.id,{data:iotsimcard}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE io tsim card
        deleteIoTSIMCard: function(iotsimcard, headers, callback) {
            $http.delete(getAPI()+'iotsimcards/'+iotsimcard.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});