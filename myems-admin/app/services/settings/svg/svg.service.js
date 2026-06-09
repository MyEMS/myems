'use strict';

// SVG service - REST API wrapper
app.factory('SVGService', function($http) {
    return {
        // GET all sv gs
        getAllSVGs:function(headers, callback){
            $http.get(getAPI()+'svgs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET svg by ID
        getSVG: function(svg_id, headers, callback) {
            $http.get(getAPI()+'svgs/'+svg_id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search sv gs by query
        searchSVGs: function(query, headers, callback) {
            $http.get(getAPI()+'svgs', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create svg
        addSVG: function(svg, headers, callback) {
            $http.post(getAPI()+'svgs',{data:svg}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update svg
        editSVG: function(svg, headers, callback) {
            $http.put(getAPI()+'svgs/'+svg.id,{data:svg}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE svg
        deleteSVG: function(svg, headers, callback) {
            $http.delete(getAPI()+'svgs/'+svg.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export svg
        exportSVG: function(svg, headers, callback) {
            $http.get(getAPI()+'svgs/'+svg.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import svg
        importSVG: function(importdata, headers, callback) {
            $http.post(getAPI()+'svgs/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone svg
        cloneSVG: function(svg, headers, callback) {
            $http.post(getAPI()+'svgs/'+svg.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
