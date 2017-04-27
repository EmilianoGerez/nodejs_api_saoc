const mongoose = require('mongoose');
const Product = mongoose.model("Product");
const _ = require('lodash');


exports.syncProducts = function (req, res) {
  debugger;
  const products = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!products || products.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de proveedores"
    });
  }

  products.forEach((product, index) => {

    promisesList.push(new Promise((resolve, reject) => {

      Product.findOneAndUpdate({
        'productLocalId': product.id
      }, {
        $set: {
          productName: product.name,
          productStock: product.stock,
          productType: product.type,
          productUnit: product.unit
        }
      }, {
        returnOriginal: false
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.productLocalId);
          resolve(response.productLocalId);
        } else {
          createProduct(product)
            .then((response) => {
              syncSuccessList.push(response.productLocalId);
              resolve(response.productLocalId);
            })
            .catch(error => {
              syncErrorList.push(product.id);
              reject(product.id);
            });
        }

      }).catch(error => {
        syncErrorList.push(product.id);
        reject(product.id);
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

function createProduct(product) {
  var productBody = {
    productName: product.name,
    productStock: product.stock,
    productType: product.type,
    productUnit: product.unit,
    productLocalId: product.id
  };
  var newProduct = new Product(productBody);

  return newProduct.save();
}