'use strict';
app.factory('ContactService', function($http) {
    return {
        getAllContacts:function(callback){
            $http.get(getAPI()+'contacts')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchContacts: function(query, callback) {
            $http.get(getAPI()+'contacts', { params: { q: query } })
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
        },
        getContact: function(id, callback) {
            $http.get(getAPI()+'contacts/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
