"use strict";

// Energy Storage Container STS service - REST API wrapper
app.factory("EnergyStorageContainerSTSService", function ($http) {
  return {
        // GET all energy storage container st ses
    getAllEnergyStorageContainerSTSes: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainerstses", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container st ses by energy storage container id by ID
    getEnergyStorageContainerSTSesByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/stses", { headers })
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST create energy storage container sts
    addEnergyStorageContainerSTS: function (
      id,
      energystoragecontainersts,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/stses",
          { data: energystoragecontainersts },
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
        // PUT update energy storage container sts
    editEnergyStorageContainerSTS: function (
      id,
      energystoragecontainersts,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/stses/" +
            energystoragecontainersts.id,
          { data: energystoragecontainersts },
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
        // DELETE energy storage container sts
    deleteEnergyStorageContainerSTS: function (
      id,
      energystoragecontainerstsID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/stses/" +
            energystoragecontainerstsID,
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
    addPair: function (id, fid, pid, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/stses/" +
            fid +
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
    deletePair: function (id, fid, pid, headers, callback) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/stses/" +
            fid +
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
        // GET points by stsid by ID
    getPointsBySTSID: function (id, fid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/stses/" +
            fid +
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
