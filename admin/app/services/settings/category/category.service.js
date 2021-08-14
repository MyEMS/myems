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
        searchCategories: function(query, callback) {  
            $http.get(getAPI()+'energycategories', { params: { q: query } }) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCategory: function(category, callback) {  
            $http.post(getAPI()+'energycategories',{data:category})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCategory: function(category, callback) {  
            $http.put(getAPI()+'energycategories/'+category.id,{data:category}) 
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCategory: function(category, callback) {  
            $http.delete(getAPI()+'energycategories/'+category.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCategory: function(id, callback) {  
            $http.get(getAPI()+'energycategories/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  