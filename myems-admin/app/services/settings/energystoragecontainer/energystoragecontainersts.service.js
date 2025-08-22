"use strict";
app.factory("EnergyStorageContainerSTSService", function ($http) {
  return {
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
