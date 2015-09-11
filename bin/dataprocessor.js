module.exports.processData = processData;

function processData(data){
  var questions = data.questionsData.questions;
  var nodesObj = data.questionsData.parties;
  var nodesKeys = Object.keys(nodesObj);
  var nodesList = nodesKeys.map(function(key){
    var node = nodesObj[key];
    node.featurelist = new Array(questions.length+1).join('0').split('').map(parseFloat);
    return node;
  });

  //Populate each partys featurelist
  for (var q = 0; q<questions.length; q++){
    var question = questions[q];
    for (var a = 0; a<question.alternatives.length; a++){
      var answer = question.alternatives[a];
      answer.parties.forEach(function (party) {
        nodesObj[party].featurelist[q] = a+1;
      });
    }
  }

  //Calculate link strength between all parties
  var linksList = [];
  for (var p1 = 0; p1<nodesList.length; p1++) {
    var feats1 = nodesList[p1].featurelist;
    for (var p2 = p1+1; p2<nodesList.length; p2++) {
      var feats2 = nodesList[p2].featurelist;
      var sim = computeSim(feats1, feats2);
      var link = {source: p1, target: p2, value: sim};
      linksList.push(link);
    }
  }
  return {nodes: nodesList, links: linksList};
}

function computeSim(t1,t2){
  var n = t1.length,
      sim = 0;
  for (var i=0;i<n;i++){
    if(t1[i]>0 && t1[i]==t2[i]){
      sim += 1;
    }
  }
  return sim/n;
}
