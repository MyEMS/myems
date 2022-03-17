'use strict';
app.factory('KnowledgeFileService', function ($http) {
    return {
        getAllKnowledgeFiles: function (callback) {
            $http.get(getAPI() + 'knowledgefiles')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        
        addKnowledgeFile: function (knowledgefile, headers, callback) {
            $http.post(getAPI() + 'knowledgefiles', {data: knowledgefile}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        restoreKnowledgeFile: function (knowledgefile, headers, callback) {
            $http.get(getAPI() + 'knowledgefiles/' + knowledgefile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

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
