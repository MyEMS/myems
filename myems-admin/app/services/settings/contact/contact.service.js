'use strict';
app.factory('ContactService', function($http) {
    return {
        getAllContacts:function(headers, callback){
            $http.get(getAPI()+'contacts', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchContacts: function(query, headers, callback) {
            $http.get(getAPI()+'contacts', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addContact: function(contact, headers, callback) {
            $http.post(getAPI()+'contacts',{data:contact}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editContact: function(contact, headers, callback) {
            $http.put(getAPI()+'contacts/'+contact.id,{data:contact}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteContact: function(contact, headers, callback) {
            $http.delete(getAPI()+'contacts/'+contact.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
