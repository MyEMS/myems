"use strict";
app.factory("EnergyStoragePowerStationUserService", function ($http) {
  return {
    addPair: function (energystoragepowerstationID, userID, headers, callback) {
      $http
        .post(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstationID +
            "/users",
          { data: { user_id: userID } },
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

    deletePair: function (
      energystoragepowerstationID,
      userID,
      headers,
      callback
    ) {
      $http
        .delete(
          getAPI() +
            "energystoragepowerstations/" +
            energystoragepowerstationID +
            "/users/" +
            userID,
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
    getUsersByEnergyStoragePowerStationID: function (id, headers, callback) {
      $http
        .get(getAPI() + "energystoragepowerstations/" + id + "/users", {
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
