'use strict';
app.factory('KnowledgeFileService', function ($http) {
    return {
        getAllKnowledgeFiles: function (callback) {
            $http.get(getAPI() + 'knowledgefiles')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },

        addKnowledgeFile: function (knowledgefile, callback) {
            $http.post(getAPI() + 'knowledgefiles', { data: knowledgefile })
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },

        restoreKnowledgeFile: function (knowledgefile, callback) {
            $http.get(getAPI() + 'knowledgefiles/' + knowledgefile.id + '/restore')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        },

        deleteKnowledgeFile: function (knowledgefile, callback) {
            $http.delete(getAPI() + 'knowledgefiles/' + knowledgefile.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e, status) {
                    callback(e, status);
                });
        }
    };
});
