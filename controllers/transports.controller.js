const mongoose = require('mongoose');
const Transport = mongoose.model("Transport");
const _ = require('lodash');


exports.syncTransports = function (req, res) {
  const transports = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!transports || transports.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de proveedores"
    });
  }

  transports.forEach((transport, index) => {

    promisesList.push(new Promise((resolve, reject) => {

      Transport.findOneAndUpdate({
        'transportLocalId': transport.id
      }, {
        $set: {
          transportName: transport.name,
          transportPlate: transport.plate
        }
      }, {
        returnOriginal: false
      }).then(transportUpdated => {

          if (transportUpdated) {
            syncSuccessList.push(transportUpdated.transportLocalId);
            resolve(transportUpdated.transportLocalId);
          } else {
            return createTransport(transport);
          }
        }).then((transportCreated) => {
          if(!transportCreated) return;
          syncSuccessList.push(transportCreated.transportLocalId);
          resolve(transportCreated.transportLocalId);
        })
        .catch(error => {
          if(!error) return;
          syncErrorList.push(transport.id);
          reject(transport.id);
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

function createTransport(transport) {
  var transportBody = {
    transportName: transport.name,
    transportPlate: transport.plate,
    transportLocalId: transport.id
  };
  var newTransport = new Transport(transportBody);

  return newTransport.save();
}