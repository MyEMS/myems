'use strict';

// Advanced Report service - REST API wrapper
app.factory('AdvancedReportService', function($http) {
    return {
        // GET all advanced report
        getAllAdvancedReport:function(headers, callback){
            $http.get(getAPI()+'advancedreports', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search advanced report by query
        searchAdvancedReport: function(query, headers, callback) {
            $http.get(getAPI()+'advancedreports', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create advanced report
        addAdvancedReport: function(advancedreport, headers, callback) {
            $http.post(getAPI()+'advancedreports', {data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update advanced report
        editAdvancedReport: function(advancedreport, headers, callback) {
            $http.put(getAPI()+'advancedreports/'+advancedreport.id,{data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // API: run advanced report
        runAdvancedReport: function(advancedreport, headers, callback) {
            $http.put(getAPI()+'advancedreports/'+advancedreport.id+'/run',{data:advancedreport}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE advanced report
        deleteAdvancedReport: function(advancedreport, headers, callback) {
            $http.delete(getAPI()+'advancedreports/'+advancedreport.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET advanced report by ID
        getAdvancedReport: function(id, headers, callback) {
            $http.get(getAPI()+'advancedreports/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export advanced report
        exportAdvancedReport: function(advancedreport, headers, callback) {
            $http.get(getAPI()+'advancedreports/'+advancedreport.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import advanced report
        importAdvancedReport: function(importdata, headers, callback) {
            $http.post(getAPI()+'advancedreports/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone advanced report
        cloneAdvancedReport: function(advancedreport, headers, callback) {
            $http.post(getAPI()+'advancedreports/'+advancedreport.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});