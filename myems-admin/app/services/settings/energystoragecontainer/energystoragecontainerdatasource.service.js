"use strict";

// Energy Storage Container Data Source service - REST API wrapper
app.factory("EnergyStorageContainerDataSourceService", function ($http) {
  return {
        // POST create pair
    addPair: function (
      energystoragecontainerID,
      dataSourceID,
      headers,
      callback
    ) {
      $http
        .post(
          getAPI() +
            "energystoragecontainers/" +
            energystoragecontainerID +
            "/datasources",
          { data: { data_source_id: dataSourceID } },
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
    deletePair: function (
      energystoragecontainerID,
      dataSourceID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragecontainers/" +
            energystoragecontainerID +
            "/datasources/" +
            dataSourceID,
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
        // GET data sources by energy storage container id by ID
    getDataSourcesByEnergyStorageContainerID: function (id, headers, callback) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/datasources", {
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
        // GET data source points by energy storage container id by ID
    getDataSourcePointsByEnergyStorageContainerID: function (
      id,
      headers,
      callback
    ) {
      $http
        .get(getAPI() + "energystoragecontainers/" + id + "/datasourcepoints", {
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
  };
});
