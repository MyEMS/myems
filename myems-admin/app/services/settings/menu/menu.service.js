'use strict';

// Menu service - REST API wrapper
app.factory('MenuService', function($http) {
    return {
        // GET all menus
        getAllMenus:function(headers, callback){
            $http.get(getAPI()+'menus', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET menu children by ID
        getMenuChildren:function(menuid, headers, callback){
            $http.get(getAPI()+'menus/'+menuid+'/children', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update menu
        editMenu: function(menu, headers, callback) {
            $http.put(getAPI()+'menus/'+menu.id, {data:menu}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
