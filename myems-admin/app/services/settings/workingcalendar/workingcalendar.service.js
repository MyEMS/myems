'use strict';
app.factory('WorkingCalendarService', function($http) {
    return {
        getAllWorkingCalendars:function(headers, callback){
            $http.get(getAPI()+'workingcalendars', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.post(getAPI()+'workingcalendars',{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.put(getAPI()+'workingcalendars/'+workingcalendar.id,{data:workingcalendar}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.delete(getAPI()+'workingcalendars/'+workingcalendar.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.get(getAPI()+'workingcalendars/'+workingcalendar.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importWorkingCalendar: function(importdata, headers, callback) {
            $http.post(getAPI()+'workingcalendars/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneWorkingCalendar: function(workingcalendar, headers, callback) {
            $http.post(getAPI()+'workingcalendars/'+workingcalendar.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
