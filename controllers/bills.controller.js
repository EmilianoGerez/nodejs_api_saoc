const mongoose = require('mongoose');
const Bill = mongoose.model("Bill");
const _ = require('lodash');


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

      Bill.findOneAndUpdate({
        'billLocalId': bill.id
      }, {
        $set: {
          billNumber: bill.number,
          billDate: bill.date,
          billSupplierId: bill.supplier.id,
          billDetail: getBillDetail(bill.detail)
        }
      }, {
        returnOriginal: false
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.billLocalId);
          resolve(response.billLocalId);
        } else {
          createBill(bill)
            .then((response) => {
              syncSuccessList.push(response.billLocalId);
              resolve(response.billLocalId);
            })
            .catch(error => {
              syncErrorList.push(bill.id);
              reject(bill.id);
            });
        }

      }).catch(error => {
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
  var billBody = {
    billNumber: bill.number,
    billDate: bill.date,
    billSupplierId: bill.supplier.id,
    billDetail: getBillDetail(bill.detail),
    billLocalId: bill.id
  };
  var newBill = new Bill(billBody);

  return newBill.save();
}

function getBillDetail(detail) {
  return detail.map(e => {
    return {
      billDetailId: e.id,
      billDetailProductId: e.product.id,
      billDetailQuantity: e.quantity
    };
  });
}