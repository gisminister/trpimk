var d3 = require("d3");
var getAreas = require('./bin/metisdata').getAreas;
var Viz = require("./bin/trpimkviz.js");

(function() {
  //Get main container
  var container = d3.select(document.scripts[document.scripts.length - 1].parentNode);
  if (!container){
    return;
  }
  container.classed('trpimk', true);


  var config = {
    container: container,
    linkThreshold: container.attr('data-linkThreshold'),
    areaid: container.attr('data-areaid'),
    areadata: '/vis/velgerhjelpen/areas',
    questiondata: '/vis/velgerhjelpen/questions?questionnaire_id=',
    statsdata: '/vis/velgerhjelpen/areastats?questionnaire_id='
  };
  if (location.origin.indexOf("localhost")>0) {
    config.areadata = '../data/areas';
    config.questiondata = '../data/questions_';
  }

  config.width = parseInt(container.style("width"));
  config.height = Math.min(550,(window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight)/2);


  //Get all areas for this publication
  getAreas(config)
      .then(function(areas){
        config.areas = areas;
        config.area = getArea(config, areas);
        Viz.renderGraph(config);
      })
      .catch(function(reason) {
        displayError(config.container, reason);
      });

})();



function getArea(config, areas){
  var area = false;
  if (config.areaid) {
    area = areas.filter(function(row){return row.areaid==config.areaid;});
    if (area.length==1){
      return area[0];
    }
  }
  return areas[0];
}

function displayError(container, errHtml){
  //Replace any html in container with errHtml
  container.html(errHtml);
}