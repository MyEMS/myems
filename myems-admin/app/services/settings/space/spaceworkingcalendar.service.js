'use strict';

// Space Working Calendar service - REST API wrapper
app.factory('SpaceWorkingCalendarService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET working calendars by space id by ID
        getWorkingCalendarsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
