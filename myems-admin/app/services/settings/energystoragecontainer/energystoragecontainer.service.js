"use strict";

// Energy Storage Container service - REST API wrapper
app.factory("EnergyStorageContainerService", function ($http) {
  return {
        // GET all energy storage containers
    getAllEnergyStorageContainers: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainers", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // Search energy storage containers by query
    searchEnergyStorageContainers: function(query, headers, callback) {
        $http.get(getAPI()+'energystoragecontainers', { params: { q: query },headers: headers })
        .then(function (response) {
            callback(response);
        }, function (response) {
            callback(response);
        });
    },
        // POST create energy storage container
    addEnergyStorageContainer: function (
      energystoragecontainer,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers",
          { data: energystoragecontainer },
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // PUT update energy storage container
    editEnergyStorageContainer: function (
      energystoragecontainer,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() + "energystoragecontainers/" + energystoragecontainer.id,
          { data: energystoragecontainer },
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // DELETE energy storage container
    deleteEnergyStorageContainer: function (
      energystoragecontainer,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() + "energystoragecontainers/" + energystoragecontainer.id,
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // GET export energy storage container
    exportEnergyStorageContainer: function (
      energystoragecontainer, 
      headers, 
      callback
    ) {
      $http
        .get(
          getAPI() + "energystoragecontainers/" + energystoragecontainer.id + "/export",
          { headers }
        )
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST import energy storage container
    importEnergyStorageContainer: function(
      importdata, 
      headers, 
      callback
    ) {
      $http
        .post(getAPI() + "energystoragecontainers/import", JSON.parse(importdata), 
        { headers }
      )
       .then(
         function (response) {
          callback(response);
         }, 
         function (response) {
          callback(response);
      });
   },
        // POST clone energy storage container
   cloneEnergyStorageContainer: function(energystoragecontainer, headers, callback) {
            $http.post(getAPI()+'energystoragecontainers/'+energystoragecontainer.id+'/clone', 
              {data:null}, 
              { headers}
            )
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
  };
});
