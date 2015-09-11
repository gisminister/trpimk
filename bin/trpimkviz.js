var getQuestionaire = require('../bin/metisdata').getQuestionaire;
var Dataprocessor = require('../bin/dataprocessor');

module.exports.renderGraph = renderGraph;

function renderGraph(config) {
  getQuestionaire(config)
      .then(function(questionnaire){
        config.graph = Dataprocessor.processData(questionnaire);
        render();
      });

  function render() {
    var width = config.width,
        height = config.height,
        maxDist = Math.min(width, height),
        circleRadius = Math.max(maxDist / 20, 16),
        linkThreshold = config.linkThreshold;

    if (!linkThreshold) {
      linkThreshold = 0.5;
    }
    var nodes = config.graph.nodes;
    var n = nodes.length,
        k = Math.sqrt(n / (width * height));

    var links = config.graph.links.sort(function(a,b){
      return b.value - a.value;
    });
    for (var nLinks = 0;nLinks<links.length;nLinks++){
      if(nLinks>(n-3) || [nLinks].value<linkThreshold){
        break;
      }
    }
    links = links.slice(0,nLinks);

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .size([width, height]);

    var title = config.container.selectAll("h2.trpimk-title")
        .data([config.area]);
    title.enter()
        .append('h2')
        .attr("class", "trpimk-title");
    title
        .text(function (d) {
          return "Hvilke partier er mest enige med hverandre i " + d.areaname + " kommune?";
        });
    title.exit().remove();

    var svg = config.container.selectAll('svg.trpimk')
        .data([config.graph]);

    svg.enter().append('svg')
        .attr('class', 'trpimk')
        .attr('width', width)
        .attr('height', height);
    svg.exit().remove();

    var navbar = config.container.selectAll("ul.trpimk-navbar")
        .data([config.areas]);
    navbar.enter().append('ul')
        .attr('class', 'trpimk-navbar');

    var navbaritems = navbar.selectAll("li")
        .data(function (d) {
          return d;
        });
    navbaritems.enter().append("li")
        .attr("class", "trpimk-navbaritems");

    navbaritems
        .text(function (d) {
          return d.areaname;
        })
        .on("click", function (d, i) {
          config.area = config.areas[i];
          renderGraph(config);
        });


    force
        .nodes(nodes)
        .links(links)
        .charge(-10 / k)
        .gravity(100 * k)
        .linkDistance(function (d) {
          return circleRadius - (circleRadius * ((d.value - linkThreshold) / (1 - linkThreshold)));
        })
        .start();

    svg.append("rect")
        .attr("class", "trpimk background")
        .attr("width", width)
        .attr("height", height)
        .on("click", function () {
          d3.selectAll(".link").classed("highlight", false);
          showGlobalInfo();
        });

    var link = svg.selectAll(".link")
        .data(links);
    link.enter().append("line")
        .attr("class", "link");
    link.style("stroke-width", function (d) {
      return 1 + (d.value - linkThreshold) / (1 - linkThreshold) * 5;
    });
    link.exit().remove();

    svg.selectAll(".node").remove();
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag)
        .on("click", function (d) {
          var link = d3.selectAll(".link");
          link.classed("highlight", function (o) {
            return o.source === d || o.target === d;
          });
          showPartyInfo(d);
        });

    var node_circle = node.append("circle")
        .attr("class", "node")
        .attr("r", function (d) {
          return d.radius ? d.radius : circleRadius;
        })
        .style("fill", function (d, i) {
          return color(i);
        })
        .call(force.drag);

    node_circle.append("title")
        .text(function (d) {
          return d.fullname;
        });

    node.append("text")
        .attr('class', 'trpimk')
        .attr("dx", 0)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.shortname;
        });

    force.on("tick", function () {
      link.attr("x1", function (d) {
        return d.source.x;
      })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

      node.attr("cx", function (d) {
        return d.x;
      })
          .attr("cy", function (d) {
            return d.y;
          });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });

    function showPartyInfo(d){
      var tmplinks = links
          .filter(function(o){
            return o.source === d || o.target === d;
          })
          .sort(function(a,b){
            if(a.value > b.value) return -1;
            if(a.value < b.value) return 1;
            return 0;
          })
          .map(function(o){
            var neighbour = (o.source === d) ? o.target.fullname : o.source.fullname;
            return {value: parseFloat(100*o.value).toFixed(1), neighbour: neighbour}
          });
      for (var i=0; i<tmplinks.length; i++){
        var str = d.fullname+" er enig med "+tmplinks[i].neighbour+" i "+tmplinks[i].value+" % av spørsmålene.";
        console.log(str);
      }
    }

    function showGlobalInfo(){
      console.log("Global info")
    }
  }

}
