"use strict";

// Energy Storage Container DC-DC service - REST API wrapper
app.factory("EnergyStorageContainerDCDCService", function ($http) {
  return {
        // GET all energy storage container dcd cs
    getAllEnergyStorageContainerDCDCs: function (headers, callback) {
      $http.get(getAPI() + "energystoragecontainerdcdcs", { headers }).then(
        function (response) {
          callback(response);
        },
        function (response) {
          callback(response);
        }
      );
    },
        // GET energy storage container dcd cs by energy storage container id by ID
    getEnergyStorageContainerDCDCsByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/dcdcs", { headers })
        .then(
          function (response) {
            callback(response);
          },
          function (response) {
            callback(response);
          }
        );
    },
        // POST create energy storage container dcdc
    addEnergyStorageContainerDCDC: function (
      id,
      energystoragecontainerdcdc,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() + "energystoragecontainers/" + id + "/dcdcs",
          { data: energystoragecontainerdcdc },
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
        // PUT update energy storage container dcdc
    editEnergyStorageContainerDCDC: function (
      id,
      energystoragecontainerdcdc,
      headers,
      callback
    ) {
      $http
        .put(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/dcdcs/" +
            energystoragecontainerdcdc.id,
          { data: energystoragecontainerdcdc },
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
        // DELETE energy storage container dcdc
    deleteEnergyStorageContainerDCDC: function (
      id,
      energystoragecontainerdcdcID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/dcdcs/" +
            energystoragecontainerdcdcID,
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
            "/dcdcs/" +
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
            "/dcdcs/" +
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
        // GET points by dcdcid by ID
    getPointsByDCDCID: function (id, fid, headers, callback) {
      $http
        .get(
          getAPI() +
            "energystoragecontainers/" +
            id +
            "/dcdcs/" +
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
