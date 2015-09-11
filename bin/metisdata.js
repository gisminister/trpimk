var Promise = require('es6-promise').Promise;

module.exports.getAreas = getAreas;
module.exports.getQuestionaire = getQuestionaire;

function getAreas(config){
  return new Promise( function( resolve, reject ) {
    d3.json(config.areadata, function (err, res) {
      if (err) {
        reject("Oops! Klarte ikke laste kommuneliste.");
      }
      res = res.sort(function(a,b){
        if(a.areaid > b.areaid) return 1;
        if(a.areaid < b.areaid) return -1;
        return 0;
      });
      resolve(res)
    });
  });
}

function getQuestionaire(config){
  return new Promise( function( resolve, reject ) {
    d3.json(config.questiondata+config.area.questionnaire_id, function (err, res) {
      if (err) {
        reject("Oops! Klarte ikke laste spørsmålsdata.");
      }
      resolve(res)
    });
  });
}


