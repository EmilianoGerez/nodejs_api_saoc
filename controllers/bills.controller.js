const mongoose = require('mongoose');
const Bill = mongoose.model("Bill");
const Supplier = mongoose.model("Supplier");
const Product = mongoose.model("Product");
const moment = require('moment');


exports.findBillById = function (req, res) {
  Bill
    .findById(req.params.id)
    .populate("billSupplierId")
    .populate("billDetail.billDetailProductId")
    .exec()
    .then(bill => {
      if (!bill) return res.status(404).send({
        message: "No se econtro la factura"
      });
      return res.status(200).send(bill);
    })
    .catch(error => res.status(500).send(error));
}

exports.findByDateRange = function (req, res) {
  var start = moment.unix(req.params.from).toDate();
  var end = moment.unix(req.params.to).toDate();

  Bill
    .find({
      billDate: {
        $gte: new Date(start.toISOString()),
        $lt: new Date(end.toISOString())
      }
    }, 'billDetail')
    .populate('billDetail.billDetailProductId')
    .then(bills => {
      if (bills.length < 1) return res.status(404).send({
        message: "No se econtraron facturas"
      });
      return res.status(200).send({
       bills
      })
    })
    .catch(error => res.status(500).send(error));
};

exports.syncBills = function (req, res) {
  debugger;
  const bills = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!bills || bills.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de facturas"
    });
  }

  bills.forEach((bill, index) => {

    promisesList.push(new Promise((resolve, reject) => {
      getSupplierAndDetails(bill.supplier.id, bill.detail)
        .then(supplierAndDetails => {
          return Bill.findOneAndUpdate({
            'billLocalId': bill.id
          }, {
            $set: {
              billNumber: bill.number,
              billDate: moment(bill.date),
              billSupplierId: supplierAndDetails.supplier._id,
              billDetail: supplierAndDetails.details
            }
          }, {
            returnOriginal: false
          });
        }).then(billUpdated => {

          if (billUpdated) {
            syncSuccessList.push(billUpdated.billLocalId);
            resolve(billUpdated.billLocalId);
          } else {
            return createBill(bill);
          }
        }).then((billCreated) => {
          if (!billCreated) return;
          syncSuccessList.push(billCreated.billLocalId);
          resolve(billCreated.billLocalId);
        })
        .catch(error => {
          if (!error) return;
          syncErrorList.push(bill.id);
          reject(bill.id);
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

function createBill(bill) {
  return getSupplierAndDetails(bill.supplier.id, bill.detail)
    .then(supplierAndDetails => {
      var billBody = {
        billNumber: bill.number,
        billDate: moment(bill.date),
        billSupplierId: supplierAndDetails.supplier._id,
        billDetail: supplierAndDetails.details,
        billLocalId: bill.id
      };
      var newBill = new Bill(billBody);

      return newBill.save();
    });
}

function getSupplierByLocalId(supplierId) {
  return Supplier.findOne({
      'supplierLocalId': supplierId
    })
    .then(supplier => {
      return supplier;
    })
    .catch(error => {
      throw error;
    });
}

function getSupplierAndDetails(supplierId, details) {
  var productPromiseList = [];
  var detailMappedList = [];

  productPromiseList.push(getSupplierByLocalId(supplierId));

  details.forEach(detail => {
    productPromiseList.push(
      Product.findOne({
        'productLocalId': detail.product.id
      })
      .then(product => {
        if (!product) throw "Producto no encontrado";
        return detailMappedList.push({
          billDetailId: detail.id,
          billDetailProductId: product._id,
          billDetailQuantity: detail.quantity
        });
      }).catch(error => {
        throw error;
      })
    );
  });

  return Promise.all(productPromiseList)
    .then(requiredData => {
      var supplier = requiredData.splice(0, 1)[0];
      return {
        supplier: supplier,
        details: detailMappedList
      };
    })
    .catch(error => {
      throw error;
    });
}