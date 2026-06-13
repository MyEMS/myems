'use strict';

// Knowledge File service - REST API wrapper
app.factory('KnowledgeFileService', function ($http) {
    return {
        // GET all knowledge files
        getAllKnowledgeFiles: function (headers, callback) {
            $http.get(getAPI() + 'knowledgefiles', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        // POST create knowledge file
        addKnowledgeFile: function (knowledgefile, headers, callback) {
            $http.post(getAPI() + 'knowledgefiles', {data: knowledgefile}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // API: restore knowledge file
        restoreKnowledgeFile: function (knowledgefile, headers, callback) {
            $http.get(getAPI() + 'knowledgefiles/' + knowledgefile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE knowledge file
        deleteKnowledgeFile: function (knowledgefile, headers, callback) {
            $http.delete(getAPI() + 'knowledgefiles/' + knowledgefile.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
