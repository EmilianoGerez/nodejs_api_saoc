const mongoose = require('mongoose');
const Work = mongoose.model("Work");
const _ = require('lodash');


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

      Work.findOneAndUpdate({
        'workLocalId': work.id
      }, {
        $set: {
          workName: work.name,
          workAddress: work.address,
          workManagerId: work.manager.id
        }
      }, {
        returnOriginal: false
      }).then(response => {

        if (response) {
          syncSuccessList.push(response.workLocalId);
          resolve(response.workLocalId);
        } else {
          createWork(work)
            .then((response) => {
              syncSuccessList.push(response.workLocalId);
              resolve(response.workLocalId);
            })
            .catch(error => {
              syncErrorList.push(work.id);
              reject(work.id);
            });
        }

      }).catch(error => {
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
  var workBody = {
    workName: work.name,
    workAddress: work.address,
    workManagerId: work.manager.id,
    workLocalId: work.id
  };
  var newWork = new Work(workBody);

  return newWork.save();
}