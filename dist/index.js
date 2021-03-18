'use strict';

var d3 = require('d3');
require('d3-axis');
var d3Appendselect = require('d3-appendselect');
require('d3-array');
var merge = require('lodash/merge');
var d3Scale = require('d3-scale');
var d3Collection = require('d3-collection');
var AtlasMetadataClient = require('@reuters-graphics/graphics-atlas-client');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);
var AtlasMetadataClient__default = /*#__PURE__*/_interopDefaultLegacy(AtlasMetadataClient);

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
        left: 30
      },
      maxRadius: 35,
      fill: 'grey',
      rMetric: 'peopleVaccinated',
      xMetric: 'peopleVaccinatedPerPopulation',
      yMetric: 'region',
      highlightColour: 'rgba(163, 190, 140, 1)',
      // yMetric: 'IncomeGroup',
      padding: 1,
      colorScale: function colorScale(d) {
        return 'rgba(163, 190, 140, 0.5)';
      },
      colorStroke: 'none',
      highlightStroke: 'white',
      highlightStrokeWidth: '1',
      namePadding: 5,
      namePaddingBottom: 15,
      textColor: 'hsla(0,0%,100%,.75)',
      transition: d3.transition().duration(750).ease(d3.easeCubic),
      tooltipText: 'of population'
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

      var margin = props.margin;
      var t = props.transition;
      var container = this.selection().node();

      var _container$getBoundin = container.getBoundingClientRect(),
          containerWidth = _container$getBoundin.width; // Respect the width of your container!


      var width = containerWidth - margin.left - margin.right;
      var height = props.height - margin.top - margin.bottom;
      var scaleX = d3Scale.scaleLinear().domain([0, 0.7]).range([margin.left, width]);
      data.forEach(function (d) {
        d.IncomeGroup = client.getCountry(d.countryISO).dataProfile.income.IncomeGroup;
        d.region = client.getCountry(d.countryISO).region.name;
        d.peopleVaccinatedPerPopulation = d.peopleVaccinated / d.population;
        d.peopleFullyVaccinatedPerPopulation = d.peopleFullyVaccinated / d.population;
        d.dosesPerPopulation = d.totalDoses / d.population;
      });
      var radius = d3.scaleSqrt().range([1, props.maxRadius]) // .range([5,5])
      .domain(d3.extent(data, function (d) {
        return d[props.rMetric];
      }));
      var grouped = d3Collection.nest().key(function (d) {
        return d[props.yMetric];
      }).entries(data);
      var scaleY = d3.scaleBand().domain(grouped.map(function (d) {
        return d.key;
      })).range([height, margin.top]);
      var plot = this.selection().appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
      .attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).appendSelect('g.plot').attr('transform', "translate(".concat(margin.left, ",").concat(margin.top, ")"));
      plot.appendSelect('g.axis.x') // .attr('transform', `translate(0,${height})`)
      // .call(d3.axisBottom(scaleX).tickValues([0,.20,.40,.60,.80,1.00]).tickFormat(d=>d*100));
      .call(d3.axisTop(scaleX).tickValues([0, 0.2, 0.4, 0.6, 0.8, 1.0]).tickFormat(function (d) {
        return d * 100;
      }).tickSize(-height));
      var simulation = d3.forceSimulation(data).force('y', d3.forceY(function (d) {
        return scaleY(d[props.yMetric]) + scaleY.bandwidth() / 2;
      })).force('x', d3.forceX(function (d) {
        return scaleX(d[props.xMetric]);
      })).force('collide', d3.forceCollide(function (d) {
        return radius(d[props.rMetric]) + props.padding;
      })).stop();

      for (var i = 0; i < 500; ++i) {
        simulation.tick();
      }

      var circles = plot.appendSelect('g.nodes').selectAll('circle').data(data, function (d, i) {
        return i;
      });
      var delaunay = d3.Delaunay.from(data.map(function (d) {
        return [d.x, d.y];
      }));
      data.map(function (d) {
        return radius(d[props.rMetric]) + props.padding;
      });
      var voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);
      var cells = data.map(function (d, i) {
        return [d, voronoi.cellPolygon(i)];
      });
      circles.enter().append('circle').attr('cx', function (d) {
        return d.x;
      }).attr('cy', function (d) {
        return d.y;
      }).attr('r', function (d) {
        return radius(d[props.rMetric]);
      }).merge(circles).transition(t).attr('class', function (d, i) {
        return "i-".concat(d.countryISO);
      }).attr('fill', function (d) {
        return props.colorScale(d[props.yMetric]);
      }).attr('stroke', function (d) {
        return props.colorStroke;
      }).attr('cx', function (d) {
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
      cellsG.exit().remove(); // const tooltipBox = this.selection()
      //     .appendSelect('div.custom-tooltip');
      // const ttInner = tooltipBox.appendSelect('div.tooltip-inner');

      var hoverName = plot.appendSelect('text.hover-name');
      var hoverPopNumber = plot.appendSelect('text.hover-population-number');

      function tipOn(d) {
        d.attr('fill', function (d, i) {
          return props.highlightColour;
        }).attr('stroke', props.highlightStroke).attr('stroke-width', props.highlightStrokeWidth);
        var dataD = d.data()[0];

        if (dataD) {
          hoverName.attr('transform', "translate(".concat(dataD.x, ",").concat(dataD.y - radius(dataD[props.rMetric]) - props.namePadding, ")")).style('text-anchor', 'middle').text(dataD.country);
          hoverPopNumber.style('text-anchor', 'middle').text(parseInt(dataD[props.xMetric] * 1000) / 10 + '%').attr('transform', "translate(".concat(dataD.x, ",").concat(dataD.y + radius(dataD[props.rMetric]) + props.namePaddingBottom, ")"));
        }
      }

      function tipOff(d) {
        d.attr('fill', function (d, i) {
          return props.colorScale(d);
        }).attr('stroke', props.colorStroke).attr('stroke-width', 1);
        hoverName.text('');
        hoverPopNumber.text('');
      }

      var labels = plot.appendSelect('g.axis.y').selectAll('text').data(grouped.map(function (d) {
        return d.key;
      }), function (d) {
        return d;
      });
      labels.enter().append('text').style('opacity', 0).attr('transform', function (d) {
        return "translate(10, ".concat(scaleY(d) + 10, ")");
      }).merge(labels).transition(t).style('opacity', 1).style('fill', props.textColor).attr('transform', function (d) {
        return "translate(10, ".concat(scaleY(d) + 10, ")");
      }).text(function (d) {
        return d;
      });
      labels.exit().transition(t).style('opacity', 0).remove();
      return this; // Generally, always return the chart class from draw!
    }
  }]);

  return IncomeVaccinations;
}();

module.exports = IncomeVaccinations;
