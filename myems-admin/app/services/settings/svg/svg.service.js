'use strict';
app.factory('SVGService', function($http) {
    return {
        getAllSVGs:function(headers, callback){
            $http.get(getAPI()+'svgs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getSVG: function(svg_id, headers, callback) {
            $http.get(getAPI()+'svgs/'+svg_id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
        addSVG: function(svg, headers, callback) {
            $http.post(getAPI()+'svgs',{data:svg}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editSVG: function(svg, headers, callback) {
            $http.put(getAPI()+'svgs/'+svg.id,{data:svg}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteSVG: function(svg, headers, callback) {
            $http.delete(getAPI()+'svgs/'+svg.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportSVG: function(svg, headers, callback) {
            $http.get(getAPI()+'svgs/'+svg.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importSVG: function(importdata, headers, callback) {
            $http.post(getAPI()+'svgs/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
