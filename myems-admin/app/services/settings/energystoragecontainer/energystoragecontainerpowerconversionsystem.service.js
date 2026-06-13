"use strict";

// Energy Storage Container Power Conversion System service - REST API wrapper
app.factory(
  "EnergyStorageContainerPowerconversionsystemService",
  function ($http) {
    return {
        // GET all energy storage container powerconversionsystems
      getAllEnergyStorageContainerPowerconversionsystems: function (
        headers,
        callback
      ) {
        $http
          .get(getAPI() + "energystoragecontainerpowerconversionsystems", {
            headers,
          })
          .then(
            function (response) {
              callback(response);
            },
            function (response) {
              callback(response);
            }
          );
      },
      getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID:
        function (id, headers, callback) {
          $http
            .get(
              getAPI() +
                "energystoragecontainers/" +
                id +
                "/powerconversionsystems",
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
        // POST create energy storage container powerconversionsystem
      addEnergyStorageContainerPowerconversionsystem: function (
        id,
        energystoragecontainerpowerconversionsystem,
        headers,
        callback
      ) {
        $http
          .post(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems",
            { data: energystoragecontainerpowerconversionsystem },
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
        // PUT update energy storage container powerconversionsystem
      editEnergyStorageContainerPowerconversionsystem: function (
        id,
        energystoragecontainerpowerconversionsystem,
        headers,
        callback
      ) {
        $http
          .put(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems/" +
              energystoragecontainerpowerconversionsystem.id,
            { data: energystoragecontainerpowerconversionsystem },
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
        // DELETE energy storage container powerconversionsystem
      deleteEnergyStorageContainerPowerconversionsystem: function (
        id,
        energystoragecontainerpowerconversionsystemyID,
        headers,
        callback
      ) {
        $http
          .delete(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems/" +
              energystoragecontainerpowerconversionsystemyID,
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
      addPair: function (id, pcsid, pid, headers, callback) {
        $http
          .post(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems/" +
              pcsid +
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
      deletePair: function (id, pcsid, pid, headers, callback) {
        $http
          .delete(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems/" +
              pcsid +
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
        // GET points by pcsid by ID
      getPointsByPCSID: function (id, pcsid, headers, callback) {
        $http
          .get(
            getAPI() +
              "energystoragecontainers/" +
              id +
              "/powerconversionsystems/" +
              pcsid +
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
  }
);
