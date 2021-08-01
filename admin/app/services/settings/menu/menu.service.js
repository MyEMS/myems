'use strict';
app.factory('MenuService', function($http) {
    return {
        getAllMenus:function(callback){
            $http.get(getAPI()+'menus')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getMenuChildren:function(menuid, callback){
            $http.get(getAPI()+'menus/'+menuid+'/children')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editMenu: function(menu, callback) {
            $http.put(getAPI()+'menus/'+menu.id,{data:menu})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
