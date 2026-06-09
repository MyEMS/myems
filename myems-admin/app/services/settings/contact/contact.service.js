'use strict';

// Contact service - REST API wrapper
app.factory('ContactService', function($http) {
    return {
        // GET all contacts
        getAllContacts:function(headers, callback){
            $http.get(getAPI()+'contacts', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search contacts by query
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
        // POST create contact
        addContact: function(contact, headers, callback) {
            $http.post(getAPI()+'contacts',{data:contact}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update contact
        editContact: function(contact, headers, callback) {
            $http.put(getAPI()+'contacts/'+contact.id,{data:contact}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE contact
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
