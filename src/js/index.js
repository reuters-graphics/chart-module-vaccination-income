import 'd3-transition';

import * as d3 from 'd3';

import AtlasMetadataClient from '@reuters-graphics/graphics-atlas-client';
import { appendSelect } from 'd3-appendselect';
import merge from 'lodash/merge';
import { nest } from 'd3-collection';
import { scaleLinear } from 'd3-scale';

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
  defaultData = [];

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
    maxRadius: 35,
    fill: 'grey',
    rMetric: 'peopleVaccinated',
    xMetric: 'peopleVaccinatedPerPopulation',
    yMetric: 'region',
    highlightColour: 'rgba(163, 190, 140, 1)',
    // yMetric: 'IncomeGroup',
    padding: 1,
    colorScale: function (d) {
      return 'rgba(163, 190, 140, 0.5)';
    },
    colorStroke: 'none',
    highlightStroke: 'white',
    highlightStrokeWidth: '1',
    namePadding: 5,
    namePaddingBottom: 15,
    textColor: 'hsla(0,0%,100%,.75)',
    transition: d3.transition().duration(750).ease(d3.easeCubic),
    tooltipText: 'of population',
    tickText: "% of population"
  };

  /**
   * Write all your code to draw your chart in this function!
   * Remember to use appendSelect!
   */
  draw() {
    const data = this.data(); // Data passed to your chart
    const props = this.props(); // Props passed to your chart

    const { margin } = props;
    const t = props.transition;
    const container = this.selection().node();
    const { width: containerWidth } = container.getBoundingClientRect(); // Respect the width of your container!

    const width = containerWidth - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const scaleX = scaleLinear().domain([0, 0.7]).range([margin.left, width]);

    data.forEach(function (d) {
      d.IncomeGroup = client.getCountry(
        d.countryISO
      ).dataProfile.income.IncomeGroup;
      d.region = client.getCountry(d.countryISO).region.name;
      d.peopleVaccinatedPerPopulation = d.peopleVaccinated / d.population;
      d.peopleFullyVaccinatedPerPopulation =
        d.peopleFullyVaccinated / d.population;
      d.dosesPerPopulation = d.totalDoses / d.population;
    });

    const radius = d3
      .scaleSqrt()
      .range([1, props.maxRadius])
      // .range([5,5])
      .domain(d3.extent(data, (d) => d[props.rMetric]));

    const grouped = nest()
      .key((d) => d[props.yMetric])
      .entries(data);

    const scaleY = d3
      .scaleBand()
      .domain(grouped.map((d) => d.key))
      .range([height, margin.top]);

    const plot = this.selection()
      .appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .appendSelect('g.plot')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const axis = plot
      .appendSelect('g.axis.x')
      // .attr('transform', `translate(0,${height})`)
      // .call(d3.axisBottom(scaleX).tickValues([0,.20,.40,.60,.80,1.00]).tickFormat(d=>d*100));
      .call(
        d3
          .axisTop(scaleX)
          // .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1.0])
          .tickFormat((d) => d * 100)
          .tickSize(-height)
      );

    axis.selectAll('.tick')
      .each((d,i) => {
        const el = axis.selectAll('.tick').filter((e,j)=>e==d)
        if ((d*100)%20 != 0) {
          el.remove();
        }
      });

    const totalTicks = axis.selectAll('.tick').nodes().length

    axis.selectAll('.tick')
      .filter((d,i)=>i==totalTicks-1)
      .select('text')
      .text(d=>d*100+props.tickText)

    const simulation = d3
      .forceSimulation(data)
      .force(
        'y',
        d3.forceY((d) => scaleY(d[props.yMetric]) + scaleY.bandwidth() / 2)
      )
      .force(
        'x',
        d3.forceX((d) => scaleX(d[props.xMetric]))
      )
      .force(
        'collide',
        d3.forceCollide((d) => radius(d[props.rMetric]) + props.padding)
      )
      .stop();

    for (let i = 0; i < 500; ++i) simulation.tick();

    const circles = plot
      .appendSelect('g.nodes')
      .selectAll('circle')
      .data(data, (d, i) => i);

    const delaunay = d3.Delaunay.from(data.map((d) => [d.x, d.y]));
    const radii = data.map((d) => radius(d[props.rMetric]) + props.padding);

    const voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);

    const cells = data.map((d, i) => [d, voronoi.cellPolygon(i)]);

    circles
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => radius(d[props.rMetric]))
      .merge(circles)
      .transition(t)
      .attr('class', (d, i) => `i-${d.countryISO}`)
      .attr('fill', (d) => props.colorScale(d[props.yMetric]))
      .attr('stroke', (d) => props.colorStroke)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    circles.exit().attr('r', 0).remove();

    const cellsG = plot
      .appendSelect('g.cell-group')
      .selectAll('.cell')
      .data(cells, (d, i) => i);

    cellsG
      .enter()
      .append('path')
      .attr('class', 'cell')
      .merge(cellsG)
      .attr('d', (d, i) => voronoi.renderCell(i))
      // .attr('fill','none')
      // .attr('stroke','white')
      .style('opacity', 0)
      .on('mouseover', function (d, i) {
        const el = d3.select(this);
        d3.select('.i-' + el.data()[0][0].countryISO).call(tipOn);
      })
      .on('mouseout', function (d, i) {
        const el = d3.select(this);
        d3.select('.i-' + el.data()[0][0].countryISO).call(tipOff);
      });

    cellsG.exit().remove();

    // const tooltipBox = this.selection()
    //     .appendSelect('div.custom-tooltip');

    // const ttInner = tooltipBox.appendSelect('div.tooltip-inner');

    const hoverName = plot.appendSelect('text.hover-name');

    const hoverPopNumber = plot.appendSelect('text.hover-population-number');

    function tipOn(d) {
      d.attr('fill', function (d, i) {
        return props.highlightColour;
      })
        .attr('stroke', props.highlightStroke)
        .attr('stroke-width', props.highlightStrokeWidth);

      const dataD = d.data()[0];
      if (dataD) {
        hoverName
          .attr(
            'transform',
            `translate(${dataD.x},${
              dataD.y - radius(dataD[props.rMetric]) - props.namePadding
            })`
          )
          .style('text-anchor', 'middle')
          .text(dataD.country);

        hoverPopNumber
          .style('text-anchor', 'middle')
          .text(parseInt(dataD[props.xMetric] * 1000) / 10 + '%')
          .attr(
            'transform',
            `translate(${dataD.x},${
              dataD.y + radius(dataD[props.rMetric]) + props.namePaddingBottom
            })`
          );
      }
    }

    function tipOff(d) {
      d.attr('fill', function (d, i) {
        return props.colorScale(d);
      })
        .attr('stroke', props.colorStroke)
        .attr('stroke-width', 1);

      hoverName.text('');
      hoverPopNumber.text('');
    }

    const labels = plot
      .appendSelect('g.axis.y')
      .selectAll('text')
      .data(
        grouped.map((d) => d.key),
        (d) => d
      );

    labels
      .enter()
      .append('text')
      .style('opacity', 0)
      .attr('transform', (d) => `translate(10, ${scaleY(d) + 10})`)
      .merge(labels)
      .transition(t)
      .style('opacity', 1)
      .style('fill', props.textColor)
      .attr('transform', (d) => `translate(10, ${scaleY(d) + 10})`)
      .text((d) => d);

    labels.exit().transition(t).style('opacity', 0).remove();

    return this; // Generally, always return the chart class from draw!
  }
}

export default IncomeVaccinations;
