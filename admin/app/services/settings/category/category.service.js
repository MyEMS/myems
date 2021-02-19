'use strict';
app.factory('CategoryService', function($http) {  
    return {  
        getAllCategories:function(callback){
            $http.get(getAPI()+'energycategories')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });
        },
        searchCategories: function(query, callback) {  
            $http.get(getAPI()+'energycategories', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        addCategory: function(category, callback) {  
            $http.post(getAPI()+'energycategories',{data:category})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        editCategory: function(category, callback) {  
            $http.put(getAPI()+'energycategories/'+category.id,{data:category})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        deleteCategory: function(category, callback) {  
            $http.delete(getAPI()+'energycategories/'+category.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getCategory: function(id, callback) {  
            $http.get(getAPI()+'energycategories/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  