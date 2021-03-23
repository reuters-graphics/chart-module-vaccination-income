'use strict';

var d3 = require('d3');
var AtlasMetadataClient = require('@reuters-graphics/graphics-atlas-client');
var d3Appendselect = require('d3-appendselect');
var merge = require('lodash/merge');
var d3Collection = require('d3-collection');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var AtlasMetadataClient__default = /*#__PURE__*/_interopDefaultLegacy(AtlasMetadataClient);
var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var client = new AtlasMetadataClient__default['default']();
d3.selection.prototype.appendSelect = d3Appendselect.appendSelect;
/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */

var IncomeVaccinations = /*#__PURE__*/function () {
  function IncomeVaccinations() {
    _classCallCheck(this, IncomeVaccinations);

    _defineProperty(this, "defaultData", []);

    _defineProperty(this, "defaultProps", {
      height: 700,
      margin: {
        top: 20,
        right: 20,
        bottom: 25,
        left: 20
      },
      maxRadius: 25,
      fill: 'grey',
      rMetric: 'peopleVaccinated',
      xMetric: 'peopleVaccinatedPerPopulation',
      yMetric: 'region',
      highlightColour: 'rgba(163, 190, 140, 1)',
      keyStroke: 'rgba(255,255,255,0.5)',
      // yMetric: 'IncomeGroup',
      padding: 1,
      colorScale: function colorScale(d) {
        return 'rgba(163, 190, 140, 0.5)';
      },
      colorStroke: 'none',
      highlightStroke: 'white',
      highlightStrokeWidth: '1',
      namePadding: 5,
      labelOffset: 20,
      namePaddingBottom: 15,
      textColor: 'hsla(0,0%,100%,0.75)',
      tooltipText: 'of population',
      tickText: 'of population',
      lineDasharrayGap: '20',
      keyDasharray: '5,8',
      keyFormat: d3.format('.1s'),
      keyText: 'No. of people given one dose',
      axisText: '% of people given at least one dose',
      backgroundBlue: '#2f353f'
    });
  }

  _createClass(IncomeVaccinations, [{
    key: "selection",
    value: function selection(selector) {
      if (!selector) return this._selection;
      this._selection = d3.select(selector);
      return this;
    }
  }, {
    key: "data",
    value: function data(newData) {
      if (!newData) return this._data || this.defaultData;
      this._data = newData;
      return this;
    }
  }, {
    key: "props",
    value: function props(newProps) {
      if (!newProps) return this._props || this.defaultProps;
      this._props = merge__default['default'](this._props || this.defaultProps, newProps);
      return this;
    }
    /**
     * Default data for your chart. Generally, it's NOT a good idea to import
     * a big dataset and assign it here b/c it'll make your component quite
     * large in terms of file size. At minimum, though, you should assign an
     * empty Array or Object, depending on what your chart expects.
     */

  }, {
    key: "draw",

    /**
     * Write all your code to draw your chart in this function!
     * Remember to use appendSelect!
     */
    value: function draw() {
      var data = this.data(); // Data passed to your chart

      var props = this.props(); // Props passed to your chart

      var useData = data;
      var margin = props.margin;
      var container = this.selection().node();

      var _container$getBoundin = container.getBoundingClientRect(),
          containerWidth = _container$getBoundin.width; // Respect the width of your container!


      var width = containerWidth - margin.left - margin.right;
      var height = props.height - margin.top - margin.bottom;
      var scaleX = d3.scaleLinear().domain([0, 0.7]).range([margin.left, width]);
      useData.forEach(function (d) {
        d.IncomeGroup = client.getCountry(d.countryISO).dataProfile.income.IncomeGroup;
        d.region = client.getCountry(d.countryISO).region.name;
        d.peopleVaccinatedPerPopulation = d.peopleVaccinated / d.population;
        d.peopleFullyVaccinatedPerPopulation = d.peopleFullyVaccinated / d.population;
        d.dosesPerPopulation = d.totalDoses / d.population;
      });
      useData = useData.filter(function (d) {
        return d[props.xMetric];
      });
      var radius = d3.scaleSqrt().range([1, props.maxRadius]).domain([0, d3.max(useData, function (d) {
        return d[props.rMetric];
      })]);
      var grouped = d3Collection.nest().key(function (d) {
        return d[props.yMetric];
      }).entries(useData);
      var scaleY = d3.scaleBand().domain(grouped.map(function (d) {
        return d.key;
      })).range([height, margin.top]);
      var axisGroup = this.selection().appendSelect('div.axis-group');
      var axisTextG = axisGroup.appendSelect('div.axis-text').text(props.axisText).style('color', props.keyStroke);
      var keyGroup = this.selection().appendSelect('div.key-group');
      keyGroup.appendSelect('div.key-text').style('color', props.keyStroke).style('margin-right', margin.right + 'px').text(props.keyText);
      var key = keyGroup.appendSelect('svg.key').attr('height', props.maxRadius * 2 + 10).attr('width', width + margin.left + margin.right).appendSelect('g.key-group');
      var maxR = d3.max(useData, function (d) {
        return d[props.rMetric];
      });
      var legendValues = [parseInt(maxR / 5), maxR];
      axisTextG.style('left', width < 600 ? '5px' : margin.left + 'px');
      var transition = this.selection().transition().duration(750).ease(d3.easeCubic);
      var plot = this.selection().appendSelect('svg.chart') // 👈 Use appendSelect instead of append for non-data-bound elements!
      .attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).appendSelect('g.plot').attr('transform', "translate(".concat(margin.left, ",").concat(margin.top, ")"));
      var axis = plot.appendSelect('g.axis.x').call(d3.axisTop(scaleX).tickFormat(function (d) {
        return d * 100;
      }).tickSize(-height));
      axis.selectAll('.tick').each(function (d, i) {
        var el = axis.selectAll('.tick').filter(function (e, j) {
          return e == d;
        });

        if (d * 100 % 20 != 0) {
          el.remove();
        }
      });
      var totalTicks = axis.selectAll('.tick').nodes().length;
      var finalTick = axis.selectAll('.tick').filter(function (d, i) {
        return i == totalTicks - 1;
      });
      finalTick.select('text').text(function (d) {
        return d * 100 + '%';
      });
      finalTick.appendSelect('text.more').text(props.tickText).attr('dy', '12px');
      var labels = plot.appendSelect('g.axis.y').selectAll('g.group-label').data(grouped.map(function (d) {
        return d.key;
      }), function (d) {
        return d;
      });
      labels.enter().append('g').attr('class', 'group-label').attr('transform', function (d) {
        return "translate(10, ".concat(scaleY(d), ")");
      });
      plot.selectAll('.group-label').appendSelect('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', props.labelOffset).style('fill', props.backgroundBlue).style('stroke', 'none');
      plot.selectAll('.group-label').appendSelect('text').attr('dy', props.labelOffset * 0.7).text(function (d) {
        return d;
      });
      var simulation = d3.forceSimulation(useData).force('y', d3.forceY(function (d) {
        return scaleY(d[props.yMetric]) + scaleY.bandwidth() / 2;
      })).force('x', d3.forceX(function (d) {
        return scaleX(d[props.xMetric]);
      })).force('collide', d3.forceCollide(function (d) {
        return radius(d[props.rMetric]) + props.padding;
      })).stop();

      for (var i = 0; i < 500; ++i) {
        simulation.tick();
      }

      plot.selectAll('*').interrupt();
      var circles = plot.appendSelect('g.nodes').selectAll('circle').data(useData, function (d, i) {
        return i;
      });
      var delaunay = d3.Delaunay.from(useData.map(function (d) {
        return [d.x, d.y];
      }));
      var voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);
      var cells = useData.map(function (d, i) {
        return [d, voronoi.cellPolygon(i)];
      });
      key.attr('transform', "translate(".concat(width + margin.left - radius(maxR) * 2, ",0)"));
      keyGroup.select('.key-text').style('max-width', radius(maxR) * 4 + 'px');
      var legendCircle = key.selectAll('.legend-circle').data(legendValues);
      legendCircle.enter().append('circle').attr('class', 'legend-circle').merge(legendCircle).attr('cy', function (d) {
        return radius(d) + 1;
      }).attr('cx', radius(legendValues[legendValues.length - 1]) + 1).attr('r', function (d) {
        return radius(d);
      }).style('stroke', props.keyStroke).style('fill', 'none');
      legendCircle.exit().remove();
      var legendLines = key.selectAll('.legend-line').data(legendValues);
      legendLines.enter().append('line').attr('class', 'legend-line').merge(legendLines).attr('x1', function (d) {
        return radius(maxR) + 1;
      }).attr('x2', function (d) {
        return -radius(maxR) + 1;
      }).attr('y1', function (d) {
        return radius(d) * 2 + 1;
      }).attr('y2', function (d) {
        return radius(d) * 2 + 1;
      }).style('stroke', props.keyStroke).style('stroke-dasharray', props.keyDasharray).style('fill', 'none');
      legendLines.exit().remove();
      var legendNumbers = key.selectAll('.legend-text').data(legendValues);
      legendNumbers.enter().append('text').attr('class', 'legend-text').merge(legendNumbers).attr('transform', function (d) {
        return "translate(".concat(-radius(maxR) * 1.75, ",").concat(radius(d) * 2 + 4.5, ")");
      }).text(function (d) {
        return props.keyFormat(d);
      }).style('fill', props.keyStroke);
      legendNumbers.exit().remove();
      circles.enter().append('circle').attr('cx', function (d) {
        return d.x;
      }).attr('cy', function (d) {
        return d.y;
      }).attr('r', function (d) {
        return radius(d[props.rMetric]);
      }).merge(circles).attr('class', function (d, i) {
        return "i-".concat(d.countryISO);
      }).attr('fill', function (d) {
        return props.colorScale(d[props.yMetric]);
      }).attr('stroke', function (d) {
        return props.colorStroke;
      }).transition(transition).attr('cx', function (d) {
        return d.x;
      }).attr('cy', function (d) {
        return d.y;
      });
      circles.exit().attr('r', 0).remove();
      var cellsG = plot.appendSelect('g.cell-group').selectAll('.cell').data(cells, function (d, i) {
        return i;
      });
      cellsG.enter().append('path').attr('class', 'cell').merge(cellsG).attr('d', function (d, i) {
        return voronoi.renderCell(i);
      }) // .attr('fill','none')
      // .attr('stroke','white')
      .style('opacity', 0).on('mouseover', function (d, i) {
        var el = d3.select(this);
        d3.select('.i-' + el.data()[0][0].countryISO).call(tipOn);
      }).on('mouseout', function (d, i) {
        var el = d3.select(this);
        d3.select('.i-' + el.data()[0][0].countryISO).call(tipOff);
      });
      cellsG.exit().remove();
      labels.merge(labels).transition(transition).style('opacity', 1).style('fill', props.textColor).attr('transform', function (d) {
        return "translate(10, ".concat(scaleY(d), ")");
      });
      labels.exit().transition().style('opacity', 0).remove();
      var hoverName = plot.appendSelect('text.hover-name');
      var hoverPopAbsolute = plot.appendSelect('text.hover-population-absolute');
      var hoverPopNumber = plot.appendSelect('text.hover-population-number');

      function tipOn(d) {
        d.attr('fill', function (d, i) {
          return props.highlightColour;
        }).attr('stroke', props.highlightStroke).attr('stroke-width', props.highlightStrokeWidth);
        var dataD = d.data()[0];

        if (dataD) {
          hoverName.attr('transform', "translate(".concat(dataD.x, ",").concat(dataD.y - radius(dataD[props.rMetric]) - props.namePadding, ")")).style('text-anchor', 'middle').text(dataD.country);
          hoverPopNumber.style('text-anchor', 'middle').text(function () {
            if (parseInt(dataD[props.xMetric] * 1000) / 10 === 0) {
              return '(<0.1%)';
            } else {
              return "(".concat(parseInt(dataD[props.xMetric] * 1000) / 10, "%)");
            }
          }).attr('transform', "translate(".concat(dataD.x, ",").concat(dataD.y + radius(dataD[props.rMetric]) + props.namePaddingBottom + 16, ")"));
          hoverPopAbsolute.style('text-anchor', 'middle').text("".concat(props.keyFormat(dataD[props.rMetric]), " people")).attr('transform', "translate(".concat(dataD.x, ",").concat(dataD.y + radius(dataD[props.rMetric]) + props.namePaddingBottom, ")"));
        }
      }

      function tipOff(d) {
        d.attr('fill', function (d, i) {
          return props.colorScale(d);
        }).attr('stroke', props.colorStroke).attr('stroke-width', 1);
        hoverName.text('');
        hoverPopNumber.text('');
        hoverPopAbsolute.text('');
      }

      return this; // Generally, always return the chart class from draw!
    }
  }]);

  return IncomeVaccinations;
}();

module.exports = IncomeVaccinations;
