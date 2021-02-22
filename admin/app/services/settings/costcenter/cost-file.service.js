'use strict';
app.factory('CostFileService', function($http) {  
    return {  
        getAllCostFiles:function(callback){
            $http.get(getAPI()+'offlinecostfiles')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        
        addCostFile: function(costfile, callback) {  
            $http.post(getAPI()+'offlinecostfiles',{data:costfile})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        
        deleteCostFile: function(costfile, callback) {  
            $http.delete(getAPI()+'offlinecostfiles/'+costfile.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  