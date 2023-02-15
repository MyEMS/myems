'use strict';
app.factory('CategoryService', function($http) {  
    return {  
        getAllCategories:function(callback){
            $http.get(getAPI()+'energycategories')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchCategories: function(query, headers, callback) {
            $http.get(getAPI()+'energycategories', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCategory: function(category, headers, callback) {
            $http.post(getAPI()+'energycategories',{data:category}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCategory: function(category, headers, callback) {
            $http.put(getAPI()+'energycategories/'+category.id,{data:category}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCategory: function(category, headers, callback) {
            $http.delete(getAPI()+'energycategories/'+category.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCategory: function(id, headers, callback) {
            $http.get(getAPI()+'energycategories/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  