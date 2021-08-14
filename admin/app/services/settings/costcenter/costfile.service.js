'use strict';
app.factory('CostFileService', function($http) {  
    return {  
        getAllCostFiles:function(callback){
            $http.get(getAPI()+'costfiles')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        addCostFile: function(costfile, callback) {  
            $http.post(getAPI()+'costfiles',{data:costfile})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        restoreCostFile: function (costfile, callback) {
            $http.get(getAPI() + 'costfiles/' + costfile.id + '/restore')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCostFile: function(costfile, callback) {  
            $http.delete(getAPI()+'costfiles/'+costfile.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  