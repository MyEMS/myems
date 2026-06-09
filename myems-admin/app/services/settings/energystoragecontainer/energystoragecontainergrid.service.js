"use strict";

// Energy Storage Container Grid service - REST API wrapper
app.factory("EnergyStorageContainerGridService", function ($http) {
  return {
        // GET all energy storage container grids
    getAllEnergyStorageContainerGrids: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainergrids", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container grids by energy storage container id by ID
    getEnergyStorageContainerGridsByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/grids", { headers })
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST create energy storage container grid
    addEnergyStorageContainerGrid: function (
      id,
      energystoragecontainergrid,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/grids",
          { data: energystoragecontainergrid },
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
        // PUT update energy storage container grid
    editEnergyStorageContainerGrid: function (
      id,
      energystoragecontainergrid,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/grids/" +
            energystoragecontainergrid.id,
          { data: energystoragecontainergrid },
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
        // DELETE energy storage container grid
    deleteEnergyStorageContainerGrid: function (
      id,
      energystoragecontainergridyID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/grids/" +
            energystoragecontainergridyID,
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
        // POST create pair
    addPair: function (id, gid, pid, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/grids/" +
            gid +
            "/points",
          { data: { point_id: pid } },
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
        // DELETE pair
    deletePair: function (id, gid, pid, headers, callback) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/grids/" +
            gid +
            "/points/" +
            pid,
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
        // GET points by grid id by ID
    getPointsByGridID: function (id, gid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/grids/" +
            gid +
            "/points",
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
  };
});
