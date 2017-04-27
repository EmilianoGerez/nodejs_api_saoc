const mongoose = require('mongoose');
const Manager = mongoose.model("Manager");
const _ = require('lodash');


exports.syncManagers = function (req, res) {
  debugger;
  const managers = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!managers || managers.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de proveedores"
    });
  }

  managers.forEach((manager, index) => {

    promisesList.push(new Promise((resolve, reject) => {

      Manager.findOneAndUpdate({
        'managerLocalId': manager.id
      }, {
        $set: {
          managerName: manager.name,
          managerPhone: manager.phone
        }
      }, {
        returnOriginal: false
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.managerLocalId);
          resolve(response.managerLocalId);
        } else {
          createManager(manager)
            .then((response) => {
              syncSuccessList.push(response.managerLocalId);
              resolve(response.managerLocalId);
            })
            .catch(error => {
              syncErrorList.push(manager.id);
              reject(manager.id);
            });
        }

      }).catch(error => {
        syncErrorList.push(manager.id);
        reject(manager.id);
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

function createManager(manager) {
  var managerBody = {
    managerName: manager.name,
    managerPhone: manager.phone,
    managerLocalId: manager.id
  };
  var newManager = new Manager(managerBody);

  return newManager.save();
}