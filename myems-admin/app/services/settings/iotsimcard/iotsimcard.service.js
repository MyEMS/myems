'use strict';
app.factory('IoTSIMCardService', function($http) {
    return {
        getAllIoTSIMCards:function(headers, callback){
            $http.get(getAPI()+'iotsimcards', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchIoTSIMCards: function(query, headers, callback) {
            $http.get(getAPI()+'iotsimcards', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addIoTSIMCard: function(iotsimcard, headers, callback) {
            $http.post(getAPI()+'iotsimcards',{data:iotsimcard}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editIoTSIMCard: function(iotsimcard, headers, callback) {
            $http.put(getAPI()+'iotsimcards/'+iotsimcard.id,{data:iotsimcard}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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