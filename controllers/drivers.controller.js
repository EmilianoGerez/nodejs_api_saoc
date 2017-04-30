const mongoose = require('mongoose');
const Driver = mongoose.model("Driver");
const _ = require('lodash');


exports.syncDrivers = function (req, res) {
  debugger;
  const drivers = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!drivers || drivers.length < 1) {
    return res.status(400).send({
      message: "Error al enviar conductores"
    });
  }

  drivers.forEach((driver, index) => {

    promisesList.push(new Promise((resolve, reject) => {

      Driver.findOneAndUpdate({
        'driverLocalId': driver.id
      }, {
        $set: {
          driverName: driver.name,
          driverPhone: driver.phone
        }
      }, {
        returnOriginal: false
      }).then(driverUpdated => {

          if (driverUpdated) {
            syncSuccessList.push(driverUpdated.driverLocalId);
            resolve(driverUpdated.driverLocalId);
          } else {
            return createDriver(driver);
          }
        }).then((driverCreated) => {
          if(!driverCreated) return;
          syncSuccessList.push(driverCreated.driverLocalId);
          resolve(driverCreated.driverLocalId);
        })
        .catch(error => {
          if(!error) return;
          syncErrorList.push(driver.id);
          reject(driver.id);
        });

    }));

  }, this);

  Promise.all(promisesList)
    .then(result => {
      return res.status(200).send({
        successSyncList: syncSuccessList,
        errorSyncList: syncErrorList
      });
    })
    .catch(error => {
      return res.status(400).send({
        successSyncList: syncSuccessList,
        errorSyncList: syncErrorList
      });
    });

};

function createDriver(driver) {
  var driverBody = {
    driverName: driver.name,
    driverPhone: driver.phone,
    driverLocalId: driver.id
  };
  var newDriver = new Driver(driverBody);

  return newDriver.save();
}