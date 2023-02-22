'use strict';
app.factory('SpaceWorkingCalendarService', function($http) {
    return {
        addPair: function(spaceID, workingcalendarID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/workingcalendars', {data: {"working_calendar_id": workingcalendarID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, workingcalendarID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/workingcalendars'+'/'+workingcalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getWorkingCalendarsBySpaceID: function(id,  callback) {
            $http.get(getAPI()+'spaces/'+id+'/workingcalendars')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
