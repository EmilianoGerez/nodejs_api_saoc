const mongoose = require('mongoose');
const Devolution = mongoose.model("Devolution");
const Work = mongoose.model("Work");
const Product = mongoose.model("Product");
const Manager = mongoose.model("Manager");
const moment = require('moment');


exports.findDevolutionById = function (req, res) {
  var devolutionData = null;
  Devolution
    .findById(req.params.id)
    .populate("devolutionWorkId")
    .populate("devolutionDetail.devolutionDetailProductId")
    .exec()
    .then(devolution => {
      devolutionData = devolution;
      if (!devolution) return res.status(404).send({
        message: "No se econtro la factura"
      });
      return Manager.findById(devolution.devolutionWorkId.workManagerId);

    })
    .then(manager => {
      return res.status(200).send({
        manager,
        devolution: devolutionData
      });
    })
    .catch(error => res.status(500).send(error));
}

exports.findByDateRange = function (req, res) {
  var start = moment.unix(req.params.from).toDate();
  var end = moment.unix(req.params.to).toDate();

  Devolution
    .find({
      devolutionDate: {
        $gte: new Date(start.toISOString()),
        $lt: new Date(end.toISOString())
      }
    }, 'devolutionDetail')
    .populate('devolutionDetail.devolutionDetailProductId')
    .then(devolutions => {
      if (devolutions.length < 1) return res.status(404).send({
        message: "No se econtraron facturas"
      });
      return res.status(200).send({
        devolutions
      })
    })
    .catch(error => res.status(500).send(error));
};

exports.syncDevolutions = function (req, res) {
  const devolutions = req.body;
  var syncSuccessList = [];
  var syncErrorList = [];
  var promisesList = [];

  if (!devolutions || devolutions.length < 1) {
    return res.status(400).send({
      message: "Error en el envio de devoluciones"
    });
  }

  devolutions.forEach((devolution, index) => {

    promisesList.push(new Promise((resolve, reject) => {
      getWorkAndDetails(devolution.work.id, devolution.detail)
        .then(workAndDetails => {
          return Devolution.findOneAndUpdate({
            'devolutionLocalId': devolution.id
          }, {
            $set: {
              devolutionNumber: devolution.number,
              devolutionDate: moment(devolution.date),
              devolutionObservation: devolution.observation,
              devolutionWorkId: workAndDetails.work._id,
              devolutionDetail: workAndDetails.details
            }
          }, {
            returnOriginal: false
          });
        }).then(devolutionUpdated => {

          if (devolutionUpdated) {
            syncSuccessList.push(devolutionUpdated.devolutionLocalId);
            resolve(devolutionUpdated.devolutionLocalId);
          } else {
            return createDevolution(devolution);
          }
        }).then((devolutionCreated) => {
          if (!devolutionCreated) return;
          syncSuccessList.push(devolutionCreated.devolutionLocalId);
          resolve(devolutionCreated.devolutionLocalId);
        })
        .catch(error => {
          if (!error) return;
          syncErrorList.push(devolution.id);
          reject(devolution.id);
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

function createDevolution(devolution) {
  return getWorkAndDetails(devolution.work.id, devolution.detail)
    .then(workAndDetails => {
      var devolutionBody = {
        devolutionNumber: devolution.number,
        devolutionDate: moment(devolution.date),
        devolutionObservation: devolution.observation,
        devolutionWorkId: workAndDetails.work._id,
        devolutionDetail: workAndDetails.details,
        devolutionLocalId: devolution.id
      };
      var newDevolution = new Devolution(devolutionBody);

      return newDevolution.save();
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

function getWorkAndDetails(workId, details) {
  var productPromiseList = [];
  var detailMappedList = [];

  productPromiseList.push(getWorkByLocalId(workId));

  details.forEach(detail => {
    productPromiseList.push(
      Product.findOne({
        'productLocalId': detail.product.id
      })
      .then(product => {
        if (!product) throw "Producto no encontrado";
        return detailMappedList.push({
          devolutionDetailId: detail.id,
          devolutionDetailProductId: product._id,
          devolutionDetailQuantity: detail.quantity
        });
      }).catch(error => {
        throw error;
      })
    );
  });

  return Promise.all(productPromiseList)
    .then(requiredData => {
      var work = requiredData.splice(0, 1)[0];
      return {
        work: work,
        details: detailMappedList
      };
    })
    .catch(error => {
      throw error;
    });
}