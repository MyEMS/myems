'use strict';
app.factory('WorkingCalendarNonWorkingDayService', function($http) {
    return {
        addNonWorkingDay: function(workingCalendarID, nonWorkingDay, headers, callback) {
            $http.post(getAPI()+'workingcalendars/'+workingCalendarID+'/nonworkingdays', {data:nonWorkingDay}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteNonWorkingDay: function(workingCalendarID, headers, callback) {
            $http.delete(getAPI()+'nonworkingdays/'+workingCalendarID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        editNonWorkingDay: function(workingCalendarID, nonWorkingDay, headers, callback) {
            $http.put(getAPI()+'nonworkingdays/'+workingCalendarID, {data:nonWorkingDay}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        getNonWorkingDaysByWorkingCalendarID: function(id, callback) {
            $http.get(getAPI()+'workingcalendars/'+id+'/nonworkingdays')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
