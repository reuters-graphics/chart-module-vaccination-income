import 'd3-transition';

import * as d3 from 'd3';

import { axisBottom, axisLeft } from 'd3-axis';

import { appendSelect } from 'd3-appendselect';
import { extent, sum } from 'd3-array';
import merge from 'lodash/merge';
import { scaleLinear, scaleBand } from 'd3-scale';
import { nest } from 'd3-collection';

import AtlasMetadataClient from '@reuters-graphics/graphics-atlas-client';
const client = new AtlasMetadataClient();

d3.selection.prototype.appendSelect = appendSelect;

/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */
class IncomeVaccinations {
  selection(selector) {
    if (!selector) return this._selection;
    this._selection = d3.select(selector);
    return this;
  }

  data(newData) {
    if (!newData) return this._data || this.defaultData;
    this._data = newData;
    return this;
  }

  props(newProps) {
    if (!newProps) return this._props || this.defaultProps;
    this._props = merge(this._props || this.defaultProps, newProps);
    return this;
  }

  /**
   * Default data for your chart. Generally, it's NOT a good idea to import
   * a big dataset and assign it here b/c it'll make your component quite
   * large in terms of file size. At minimum, though, you should assign an
   * empty Array or Object, depending on what your chart expects.
   */
  defaultData = [

  ];

  /**
   * Default props are the built-in styles your chart comes with
   * that you want to allow a user to customize. Remember, you can
   * pass in complex data here, like default d3 axes or accessor
   * functions that can get properties from your data.
   */
  defaultProps = {
    height: 700,
    margin: {
      top: 20,
      right: 20,
      bottom: 25,
      left: 30,
    },
    maxRadius: 30,
    fill: 'grey',
    rMetric: 'peopleVaccinated',
    xMetric: 'peopleVaccinatedPerPopulation',
    yMetric: 'region',
    // yMetric: 'IncomeGroup',
    padding: 1,
    colorScale: function(d) {
      return 'rgba(163, 190, 140, 0.5)'
    },
    colorStroke: '#a3be8c',
    textColor: 'hsla(0,0%,100%,.75)',
  };

  /**
   * Write all your code to draw your chart in this function!
   * Remember to use appendSelect!
   */
  draw() {
    const data = this.data(); // Data passed to your chart
    const props = this.props(); // Props passed to your chart

    const { margin } = props;

    const container = this.selection().node();
    const { width: containerWidth } = container.getBoundingClientRect(); // Respect the width of your container!

    const width = containerWidth - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const scaleX = scaleLinear()
      .domain([0,.7])
      .range([margin.left, width]);

    data.forEach(function(d) {
      d.IncomeGroup = client.getCountry(d.countryISO).dataProfile.income.IncomeGroup
      d.region = client.getCountry(d.countryISO).region.name;
      d.peopleVaccinatedPerPopulation = d.peopleVaccinated / d.population;
      d.peopleFullyVaccinatedPerPopulation = d.peopleFullyVaccinated / d.population;
      d.dosesPerPopulation = d.totalDoses / d.population;
    });

    const radius = d3.scaleSqrt()
      .range([1,props.maxRadius])
      // .range([5,5])
      .domain(d3.extent(data, d=>d[props.rMetric]))

    const grouped = nest()
      .key(d => d[props.yMetric])
      .entries(data)

    const scaleY = d3.scaleBand()
      .domain(grouped.map(d => d.key))
      .range([height, margin.top]);

    const plot = this.selection()
      .appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .appendSelect('g.plot')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    plot
      .appendSelect('g.axis.x')
      // .attr('transform', `translate(0,${height})`)
      // .call(d3.axisBottom(scaleX).tickValues([0,.20,.40,.60,.80,1.00]).tickFormat(d=>d*100));
      .call(d3.axisTop(scaleX).tickValues([0,.20,.40,.60,.80,1.00]).tickFormat(d=>d*100).tickSize(-height));

    const circles = plot
      .appendSelect('g.nodes')
      .selectAll('circle')
      .data(data, (d, i) => i);

    const simulation = d3.forceSimulation(data)
      .force('y', d3.forceY(d => scaleY(d[props.yMetric])+ scaleY.bandwidth()/2))
      .force('x', d3.forceX(d => scaleX(d[props.xMetric])))
      .force('collide', d3.forceCollide(d=> radius(d[props.rMetric])+props.padding))
      .stop();

    for (let i = 0; i < 500; ++i) simulation.tick();

    circles.enter().append('circle')
      // .style('fill', d =>( d.type == 'explosion')?props.fill_explosion:props.fill_nuclear)
      .attr('cx', d=> d.x)
      .attr('cy', d=> d.y)
      .merge(circles)
      .transition()
      .attr('id', d => d.id)
      .attr('fill', d=> props.colorScale(d[props.yMetric]))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => radius(d[props.rMetric]));

    circles.exit()
      .attr('r', 0)
      .remove();

  

    plot
      .appendSelect('g.axis.y')
      .selectAll('text')
      .data(grouped.map(d=>d.key))
      .enter()
      .append('text')
      .style('fill',props.textColor)
      .attr('transform',d => `translate(10, ${scaleY(d)+10})`)
      .text(d => d)

    return this; // Generally, always return the chart class from draw!
  }
}

export default IncomeVaccinations;
