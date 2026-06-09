"use strict";

// Energy Storage Power Station User service - REST API wrapper
app.factory("EnergyStoragePowerStationUserService", function ($http) {
  return {
        // POST create pair
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

        // DELETE pair
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
        // GET users by energy storage power station id by ID
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
