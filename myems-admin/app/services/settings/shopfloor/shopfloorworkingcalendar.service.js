'use strict';

// Shop Floor Working Calendar service - REST API wrapper
app.factory('ShopfloorWorkingCalendarService', function($http) {
    return {
        // POST create pair
        addPair: function(shopfloorID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(shopfloorID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET working calendars by shopfloor id by ID
        getWorkingCalendarsByShopfloorID: function(id, headers,  callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
