'use strict';

// Category service - REST API wrapper
app.factory('CategoryService', function($http) {
    return {
        // GET all categories
        getAllCategories:function(headers, callback){
            $http.get(getAPI()+'energycategories', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search categories by query
        searchCategories: function(query, headers, callback) {
            $http.get(getAPI()+'energycategories', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create category
        addCategory: function(category, headers, callback) {
            $http.post(getAPI()+'energycategories',{data:category}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update category
        editCategory: function(category, headers, callback) {
            $http.put(getAPI()+'energycategories/'+category.id,{data:category}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE category
        deleteCategory: function(category, headers, callback) {
            $http.delete(getAPI()+'energycategories/'+category.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});