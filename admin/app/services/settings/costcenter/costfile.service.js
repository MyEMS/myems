'use strict';
app.factory('CostFileService', function($http) {  
    return {  
        getAllCostFiles:function(callback){
            $http.get(getAPI()+'costfiles')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        
        addCostFile: function(costfile, callback) {  
            $http.post(getAPI()+'costfiles',{data:costfile})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        restoreCostFile: function (costfile, callback) {
            $http.get(getAPI() + 'costfiles/' + costfile.id + '/restore')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },
        deleteCostFile: function(costfile, callback) {  
            $http.delete(getAPI()+'costfiles/'+costfile.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  