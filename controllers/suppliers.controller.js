const mongoose = require('mongoose');
const Supplier = mongoose.model("Supplier");
const Bill = mongoose.model("Bill");
const _ = require('lodash');

exports.findAll = function (req, res) {
  Supplier
    .find()
    .then(suppliers => {
      if (!suppliers) return res.status(404).send({message: "No se encontraron proveedores"});
      return res.status(200).send({
        suppliers
      });
    })
    .catch(error => res.status(500).send(error));
}

exports.findSupplierAndBills = function (req, res) {
  var supplierData = null;
  Supplier
    .findById(req.params.id)
    .then(supplier => {
      if (!supplier) return res.status(404).send({message: "No se encontro el proveedor"});
      supplierData = supplier;
      return Bill.find({
        'billSupplierId': supplier._id
      });
    })
    .then(bills => {
      if (!bills) return res.status(404).send(supplierData);
      var billsMapped = bills.map(e => {
        return {
          _id: e._id,
          billNumber: e.billNumber,
          billDate: e.billDate,
          billLocalId: e.billLocalId
        };
      });
      return res.status(200).send({
        supplier: supplierData,
        bills: billsMapped
      });
    })
    .catch(error => res.status(500).send(error));
}


exports.syncSuppliers = function (req, res) {
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
        }).then(supplierUpdated => {

          if (supplierUpdated) {
            syncSuccessList.push(supplierUpdated.supplierLocalId);
            resolve(supplierUpdated.supplierLocalId);
          } else {
            return createSupplier(supplier);
          }
        }).then((supplierCreated) => {
          if (!supplierCreated) return;
          syncSuccessList.push(supplierCreated.supplierLocalId);
          resolve(supplierCreated.supplierLocalId);
        })
        .catch(error => {
          if (!error) return;
          syncErrorList.push(supplier.id);
          reject(supplier.id);
        });

    }));

  }, this);

  Promise.all(promisesList)
    .then(supplierCreated => {
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