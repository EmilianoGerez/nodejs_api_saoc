const mongoose = require('mongoose');
const Supplier = mongoose.model("Supplier");
const _ = require('lodash');


exports.syncSuppliers = function (req, res) {
  debugger;
  const suppliers = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!suppliers || suppliers.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de proveedores"
    });
  }

  suppliers.forEach((supplier, index) => {

    promisesList.push(new Promise((resolve, reject) => {

      Supplier.findOneAndUpdate({
        'supplierLocalId': supplier.id
      }, {
        $set: {
          supplierName: supplier.name,
          supplierCuit: supplier.cuit,
          supplierPhone: supplier.phone,
          supplierAddress: supplier.address
        }
      }, {
        returnOriginal: false
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.supplierLocalId);
          resolve(response.supplierLocalId);
        } else {
          createSupplier(supplier)
            .then((response) => {
              syncSuccessList.push(response.supplierLocalId);
              resolve(response.supplierLocalId);
            })
            .catch(error => {
              syncErrorList.push(supplier.id);
              reject(supplier.id);
            });
        }

      }).catch(error => {
        syncErrorList.push(supplier.id);
        reject(supplier.id);
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

function createSupplier(supplier) {
  var supplierBody = {
    supplierName: supplier.name,
    supplierCuit: supplier.cuit,
    supplierPhone: supplier.phone,
    supplierAddress: supplier.address,
    supplierLocalId: supplier.id
  };
  var newSupplier = new Supplier(supplierBody);

  return newSupplier.save();
}