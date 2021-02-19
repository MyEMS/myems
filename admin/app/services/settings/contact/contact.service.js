'use strict';
app.factory('ContactService', function($http) {
    return {
        getAllContacts:function(callback){
            $http.get(getAPI()+'contacts')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchContacts: function(query, callback) {
            $http.get(getAPI()+'contacts', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addContact: function(contact, callback) {
            $http.post(getAPI()+'contacts',{data:contact})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editContact: function(contact, callback) {
            $http.put(getAPI()+'contacts/'+contact.id,{data:contact})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteContact: function(contact, callback) {
            $http.delete(getAPI()+'contacts/'+contact.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getContact: function(id, callback) {
            $http.get(getAPI()+'contacts/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
