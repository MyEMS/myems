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

        addKnowledgeFile: function (knowledgefile, callback) {
            $http.post(getAPI() + 'knowledgefiles', { data: knowledgefile })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        restoreKnowledgeFile: function (knowledgefile, callback) {
            $http.get(getAPI() + 'knowledgefiles/' + knowledgefile.id + '/restore')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteKnowledgeFile: function (knowledgefile, callback) {
            $http.delete(getAPI() + 'knowledgefiles/' + knowledgefile.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
