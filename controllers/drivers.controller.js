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
      message: "Error en el envio de proveedores"
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
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.driverLocalId);
          resolve(response.driverLocalId);
        } else {
          createDriver(driver)
            .then((response) => {
              syncSuccessList.push(response.driverLocalId);
              resolve(response.driverLocalId);
            })
            .catch(error => {
              syncErrorList.push(driver.id);
              reject(driver.id);
            });
        }

      }).catch(error => {
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