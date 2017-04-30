const mongoose = require('mongoose');
const Work = mongoose.model("Work");
const Manager = mongoose.model("Manager");
const OrderDispatch = mongoose.model("OrderDispatch");
const Devolution = mongoose.model("Devolution");
const moment = require('moment');

exports.findAll = function (req, res) {
  Work
    .find()
    .then(works => {
      if (!works) return res.status(404).send({
        message: "No se encontraron obras"
      });
      return res.status(200).send({
        works
      });
    })
    .catch(error => res.status(500).send(error));
};

exports.findById = function (req, res) {
  var orderParams = 'orderNumber orderDate';
  var devolutionParams = 'devolutionNumber devolutionDate devolutionObservation';
  getWorkOrdersAndDevolutions(req.params.id, orderParams, devolutionParams, (error, data) => {
    if (error) return res.status(500).send(error);
    return res.status(200).send(data);
  });
};


exports.findByDateRange = function (req, res) {
  var start = moment.unix(req.params.from).toDate();
  var end = moment.unix(req.params.to).toDate();
  var promisesList = [];

  promisesList.push(
    OrderDispatch.find({
      orderDate: {
        $gte: new Date(start.toISOString()),
        $lt: new Date(end.toISOString())
      }
    })
    .populate('orderWorkId')
    .populate('orderDetail.orderDetailProductId')
    .select('orderWorkId orderDetail')
  );

  promisesList.push(
    Devolution.find({
      devolutionDate: {
        $gte: new Date(start.toISOString()),
        $lt: new Date(end.toISOString())
      }
    })
    .populate('devolutionWorkId')
    .populate('devolutionDetail.devolutionDetailProductId')
    .select('devolutionWorkId devolutionDetail')
  );

  Promise.all(promisesList)
    .then(details => {
      return res.status(200).send({
        orders: details[0],
        devolutions: details[1]
      });
    })
    .catch(error => res.status(500).send(error));
};

exports.getProductsByWork = function (req, res) {
  getWorkOrdersAndDevolutions(req.params.id, 'orderDetail', 'devolutionDetail', (error, data) => {
    if (error) return res.status(500).send(error);
    return res.status(200).send(data);
  });
};

function getWorkOrdersAndDevolutions(workId, ordersParams, devolutionsParams, callback) {
  var workData = null;
  var ordersData = null;
  Work
    .findById(workId)
    .populate('workManagerId')
    .then(work => {
      if (!work) return res.status(404).send({
        message: "No se encontro la obra"
      });
      workData = work;
      return OrderDispatch.find({
          'orderWorkId': work._id
        })
        .select(ordersParams);
    })
    .then(orders => {
      ordersData = orders;
      return Devolution.find({
          'devolutionWorkId': workData._id
        })
        .select(devolutionsParams);
    })
    .then(devolutions => {
      return callback(null, {
        work: workData,
        orders: ordersData,
        devolutions
      });
    })
    .catch(error => {
      return callback(error);
    });

}


exports.syncWorks = function (req, res) {
  debugger;
  const works = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!works || works.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de proveedores"
    });
  }

  works.forEach((work, index) => {

    promisesList.push(new Promise((resolve, reject) => {
      getManagerByLocalId(work.manager.id)
        .then(manager => {
          return Work.findOneAndUpdate({
            'workLocalId': work.id
          }, {
            $set: {
              workName: work.name,
              workAddress: work.address,
              workManagerId: manager._id
            }
          }, {
            returnOriginal: false
          });
        }).then(workUpdated => {

          if (workUpdated) {
            syncSuccessList.push(workUpdated.workLocalId);
            resolve(workUpdated.workLocalId);
          } else {
            return createWork(work);
          }
        }).then((workCreated) => {
          if (!workCreated) return;
          syncSuccessList.push(workCreated.workLocalId);
          resolve(workCreated.workLocalId);
        })
        .catch(error => {
          if (!error) return;
          syncErrorList.push(work.id);
          reject(work.id);
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

function createWork(work) {
  return getManagerByLocalId(work.manager.id)
    .then(manager => {
      var workBody = {
        workName: work.name,
        workAddress: work.address,
        workManagerId: manager._id,
        workLocalId: work.id
      };
      var newWork = new Work(workBody);

      return newWork.save();
    });

}

function getManagerByLocalId(managerId) {
  return Manager.findOne({
      'managerLocalId': managerId
    })
    .then(manager => {
      return manager;
    })
    .catch(error => {
      throw error;
    });
}