'use strict';
app.factory('ShopfloorWorkingCalendarService', function($http) {
    return {
        addPair: function(shopfloorID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getWorkingCalendarsByShopfloorID: function(id,  callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/workingcalendars')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
