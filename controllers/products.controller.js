const mongoose = require('mongoose');
const Product = mongoose.model("Product");

exports.findAll = function (req, res) {
  Product
    .find()
    .then(products => {
      if (!products) return res.status(404).send({message: "No se encontraron productos"});
      return res.status(200).send({
        products
      });
    })
    .catch(error => res.status(500).send(error));
}


exports.syncProducts = function (req, res) {
  debugger;
  const products = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!products || products.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de productos"
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
      }).then(productUpdated => {

          if (productUpdated) {
            syncSuccessList.push(productUpdated.productLocalId);
            resolve(productUpdated.productLocalId);
          } else {
            return createProduct(product);
          }
        }).then((productCreated) => {
          if(!productCreated) return;
          syncSuccessList.push(productCreated.productLocalId);
          resolve(productCreated.productLocalId);
        })
        .catch(error => {
          if(!error) return;
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