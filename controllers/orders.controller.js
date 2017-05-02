const mongoose = require('mongoose');
const OrderDispatch = mongoose.model("OrderDispatch");
const Transport = mongoose.model("Transport");
const Driver = mongoose.model("Driver");
const Work = mongoose.model("Work");
const Product = mongoose.model("Product");
const Manager = mongoose.model("Manager");
const moment = require('moment');


exports.findOrderDispatchById = function (req, res) {
  var orderData = null;
  OrderDispatch
    .findById(req.params.id)
    .populate("orderTransportId")
    .populate("orderDriverId")
    .populate("orderWorkId")
    .populate("orderDetail.orderDetailProductId")
    .exec()
    .then(order => {
      orderData = order;
      if (!order) return res.status(404).send({
        message: "No se econtro el remito"
      });
      return Manager.findById(order.orderWorkId.workManagerId);
    })
    .then(manager => {
      return res.status(200).send({
        manager,
        order: orderData
      });
    })
    .catch(error => res.status(500).send(error));
}

exports.findByDateRange = function (req, res) {
  var start = moment.unix(req.params.from).toDate();
  var end = moment.unix(req.params.to).toDate();

  OrderDispatch
    .find({
      orderDate: {
        $gte: new Date(start.toISOString()),
        $lt: new Date(end.toISOString())
      }
    }, 'orderDetail')
    .populate('orderDetail.orderDetailProductId')
    .then(orders => {
      if (orders.length < 1) return res.status(404).send({
        message: "No se econtraron remitos"
      });
      return res.status(200).send({
        orders
      })
    })
    .catch(error => res.status(500).send(error));
};

exports.syncOrderDispatchs = function (req, res) {
  const orders = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!orders || orders.length < 1) {
    return res.status(400).send({
      message: "Error en el envio del remito"
    });
  }

  orders.forEach((order, index) => {

    promisesList.push(new Promise((resolve, reject) => {
      getModelsAndDetails(order.transport.id, order.driver.id, order.work.id, order.detail)
        .then(modelsAndDetails => {
          return OrderDispatch.findOneAndUpdate({
            'orderLocalId': order.id
          }, {
            $set: {
              orderNumber: order.number,
              orderDate: moment(order.date),
              orderTransportId: modelsAndDetails.transport._id,
              orderDriverId: modelsAndDetails.driver._id,
              orderWorkId: modelsAndDetails.work._id,
              orderDetail: modelsAndDetails.details
            }
          }, {
            returnOriginal: false
          });
        }).then(orderUpdated => {

          if (orderUpdated) {
            syncSuccessList.push(orderUpdated.orderLocalId);
            resolve(orderUpdated.orderLocalId);
          } else {
            return createOrderDispatch(order);
          }
        }).then((orderCreated) => {
          if (!orderCreated) return;
          syncSuccessList.push(orderCreated.orderLocalId);
          resolve(orderCreated.orderLocalId);
        })
        .catch(error => {
          if (!error) return;
          syncErrorList.push(order.id);
          reject(order.id);
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

function createOrderDispatch(order) {
  return getModelsAndDetails(order.transport.id, order.driver.id, order.work.id, order.detail)
    .then(modelsAndDetails => {
      var orderBody = {
        orderNumber: order.number,
        orderDate: moment(order.date),
        orderTransportId: modelsAndDetails.transport._id,
        orderDriverId: modelsAndDetails.driver._id,
        orderWorkId: modelsAndDetails.work._id,
        orderDetail: modelsAndDetails.details,
        orderLocalId: order.id
      };
      var newOrderDispatch = new OrderDispatch(orderBody);

      return newOrderDispatch.save();
    });
}

function getTransportByLocalId(transportId) {
  return Transport.findOne({
      'transportLocalId': transportId
    })
    .then(transport => {
      return transport;
    })
    .catch(error => {
      throw error;
    });
}

function getDriverByLocalId(driverId) {
  return Driver.findOne({
      'driverLocalId': driverId
    })
    .then(driver => {
      return driver;
    })
    .catch(error => {
      throw error;
    });
}

function getWorkByLocalId(workId) {
  return Work.findOne({
      'workLocalId': workId
    })
    .then(work => {
      return work;
    })
    .catch(error => {
      throw error;
    });
}

function getModelsAndDetails(transportId, driverId, workId, details) {
  var productPromiseList = [];
  var detailMappedList = [];

  productPromiseList.push(getTransportByLocalId(transportId));
  productPromiseList.push(getDriverByLocalId(driverId));
  productPromiseList.push(getWorkByLocalId(workId));

  details.forEach(detail => {
    productPromiseList.push(
      Product.findOne({
        'productLocalId': detail.product.id
      })
      .then(product => {
        if (!product) throw "Producto no encontrado";
        return detailMappedList.push({
          orderDetailId: detail.id,
          orderDetailProductId: product._id,
          orderDetailQuantity: detail.quantity
        });
      }).catch(error => {
        throw error;
      })
    );
  });

  return Promise.all(productPromiseList)
    .then(requiredData => {
      var transport = requiredData.splice(0, 1)[0];
      var driver = requiredData.splice(0, 1)[0];
      var work = requiredData.splice(0, 1)[0];
      return {
        transport,
        driver,
        work,
        details: detailMappedList
      };
    })
    .catch(error => {
      throw error;
    });
}