import * as d3 from 'd3';
import AtlasMetadataClient from '@reuters-graphics/graphics-atlas-client';
import { appendSelect } from 'd3-appendselect';
import merge from 'lodash/merge';
import { nest } from 'd3-collection';

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
      left: 20,
    },
    maxRadius: 25,
    fill: 'grey',
    rMetric: 'peopleVaccinated',
    xMetric: 'peopleVaccinatedPerPopulation',
    yMetric: 'region',
    highlightColour: 'rgba(163, 190, 140, 1)',
    keyStroke: 'rgba(255,255,255,0.5)',
    padding: 1,
    colorScale: function (d) {
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
    backgroundBlue: '#2f353f',
  };

  /**
   * Write all your code to draw your chart in this function!
   * Remember to use appendSelect!
   */
  draw() {
    const data = this.data(); // Data passed to your chart
    const props = this.props(); // Props passed to your chart
    let useData = data;
    const { margin } = props;
    const container = this.selection().node();
    const { width: containerWidth } = container.getBoundingClientRect(); // Respect the width of your container!

    const width = containerWidth - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    useData.forEach(function (d) {
      d.IncomeGroup = client.getCountry(
        d.countryISO
      ).dataProfile.income.IncomeGroup;
      d.region = client.getCountry(d.countryISO).region.name;
      d.peopleVaccinatedPerPopulation = d.peopleVaccinated / d.population;
      d.peopleFullyVaccinatedPerPopulation =
        d.peopleFullyVaccinated / d.population;
      d.dosesPerPopulation = d.totalDoses / d.population;
    });

    useData = useData.filter((d) => d[props.xMetric]);

    const scaleX = d3
      .scaleLinear()
      .domain([0, d3.max(useData, (d) => d[props.xMetric])])
      .range([margin.left, width]);

    const radius = d3
      .scaleSqrt()
      .range([1, props.maxRadius])
      .domain([0, d3.max(useData, (d) => +d[props.rMetric])]);

    const grouped = nest()
      .key((d) => d[props.yMetric])
      .entries(useData);

    const scaleY = d3
      .scaleBand()
      .domain(grouped.map((d) => d.key))
      .range([height, margin.top]);

    const axisGroup = this.selection().appendSelect('div.axis-group');

    const axisTextG = axisGroup
      .appendSelect('div.axis-text')
      .text(props.axisText)
      .style('color', props.keyStroke);

    const keyGroup = this.selection().appendSelect('div.key-group');

    keyGroup
      .appendSelect('div.key-text')
      .style('color', props.keyStroke)
      .style('margin-right', margin.right + 'px')
      .text(props.keyText);

    const key = keyGroup
      .appendSelect('svg.key')
      .attr('height', props.maxRadius * 2 + 10)
      .attr('width', width + margin.left + margin.right)
      .appendSelect('g.key-group');

    const maxR = d3.max(useData, (d) => +d[props.rMetric]);
    const legendValues = [parseInt(maxR / 5), maxR];

    axisTextG.style('left', width < 600 ? '5px' : margin.left + 'px');

    const transition = this.selection()
      .transition()
      .duration(750)
      .ease(d3.easeCubic);

    const plot = this.selection()
      .appendSelect('svg.chart') // 👈 Use appendSelect instead of append for non-data-bound elements!
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .appendSelect('g.plot')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const axis = plot.appendSelect('g.axis.x').call(
      d3
        .axisTop(scaleX)
        .tickFormat((d) => d * 100)
        .tickSize(-height)
    );

    axis.selectAll('.tick').each((d, i) => {
      const el = axis.selectAll('.tick').filter((e, j) => e == d);
      if ((d * 100) % 20 != 0) {
        el.remove();
      }
    });

    const totalTicks = axis.selectAll('.tick').nodes().length;

    const finalTick = axis
      .selectAll('.tick')
      .filter((d, i) => i == totalTicks - 1);

    finalTick.select('text').text((d) => d * 100 + '%');

    finalTick.appendSelect('text.more').text(props.tickText).attr('dy', '12px');

    const labels = plot
      .appendSelect('g.axis.y')
      .selectAll('g.group-label')
      .data(
        grouped.map((d) => d.key),
        (d) => d
      );

    labels
      .enter()
      .append('g')
      .attr('class', 'group-label')
      .attr('transform', (d) => `translate(10, ${scaleY(d)})`);

    plot
      .selectAll('.group-label')
      .appendSelect('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', props.labelOffset)
      .style('fill', props.backgroundBlue)
      .style('stroke', 'none');

    plot
      .selectAll('.group-label')
      .appendSelect('text')
      .attr('dy', props.labelOffset * 0.7)
      .text((d) => d);

    const simulation = d3
      .forceSimulation(useData)
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

    plot.selectAll('*').interrupt();

    const circles = plot
      .appendSelect('g.nodes')
      .selectAll('circle')
      .data(useData, (d, i) => i);

    const delaunay = d3.Delaunay.from(useData.map((d) => [d.x, d.y]));

    const voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);

    const cells = useData.map((d, i) => [d, voronoi.cellPolygon(i)]);

    key.attr(
      'transform',
      `translate(${
        width + margin.left + margin.right - radius(maxR) * 2 - 2
      },0)`
    );

    keyGroup.select('.key-text').style('max-width', radius(maxR) * 4 + 'px');

    const legendCircle = key.selectAll('.legend-circle').data(legendValues);

    legendCircle
      .enter()
      .append('circle')
      .attr('class', 'legend-circle')
      .merge(legendCircle)
      .attr('cy', (d) => radius(d) + 1)
      .attr('cx', radius(legendValues[legendValues.length - 1]) + 1)
      .attr('r', (d) => radius(d))
      .style('stroke', props.keyStroke)
      .style('fill', 'none');

    legendCircle.exit().remove();

    const legendLines = key.selectAll('.legend-line').data(legendValues);

    legendLines
      .enter()
      .append('line')
      .attr('class', 'legend-line')
      .merge(legendLines)
      .attr('x1', (d) => radius(maxR) + 1)
      .attr('x2', (d) => -radius(maxR) + 1)
      .attr('y1', (d) => radius(d) * 2 + 1)
      .attr('y2', (d) => radius(d) * 2 + 1)
      .style('stroke', props.keyStroke)
      .style('stroke-dasharray', props.keyDasharray)
      .style('fill', 'none');

    legendLines.exit().remove();

    const legendNumbers = key.selectAll('.legend-text').data(legendValues);

    legendNumbers
      .enter()
      .append('text')
      .attr('class', 'legend-text')
      .merge(legendNumbers)
      .attr(
        'transform',
        (d) => `translate(${-radius(maxR) * 1.75},${radius(d) * 2 + 4.5})`
      )
      .text((d) => props.keyFormat(d))
      .style('fill', props.keyStroke);

    legendNumbers.exit().remove();

    circles
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => radius(d[props.rMetric]))
      .merge(circles)
      .attr('class', (d, i) => `i-${d.countryISO}`)
      .attr('fill', (d) => props.colorScale(d[props.yMetric]))
      .attr('stroke', (d) => props.colorStroke)
      .transition(transition)
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

    labels
      .merge(labels)
      .transition(transition)
      .style('opacity', 1)
      .style('fill', props.textColor)
      .attr('transform', (d) => `translate(10, ${scaleY(d)})`);

    labels.exit().transition().style('opacity', 0).remove();

    const hoverName = plot.appendSelect('text.hover-name');

    const hoverPopAbsolute = plot.appendSelect(
      'text.hover-population-absolute'
    );

    const hoverPopNumber = plot.appendSelect('text.hover-population-number');

    function tipOn(d) {
      d.attr('fill', function (d, i) {
        return props.highlightColour;
      })
        .attr('stroke', props.highlightStroke)
        .attr('stroke-width', props.highlightStrokeWidth);
      const xMax = d3.max(useData, (d) => d[props.xMetric]);
      const dataD = d.data()[0];
      if (dataD) {
        hoverName
          .attr(
            'transform',
            `translate(${dataD.x},${
              dataD.y - radius(dataD[props.rMetric]) - props.namePadding
            })`
          )
          .style('text-anchor', dataD[props.xMetric] == xMax ? 'end' : 'middle')
          .text(dataD.country);

        hoverPopNumber
          .style('text-anchor', dataD[props.xMetric] == xMax ? 'end' : 'middle')
          .text(() => {
            if (parseInt(dataD[props.xMetric] * 1000) / 10 === 0) {
              return '(<0.1%)';
            } else {
              return `(${parseInt(dataD[props.xMetric] * 1000) / 10}%)`;
            }
          })
          .attr(
            'transform',
            `translate(${dataD.x},${
              dataD.y +
              radius(dataD[props.rMetric]) +
              props.namePaddingBottom +
              16
            })`
          );

        hoverPopAbsolute
          .style('text-anchor', dataD[props.xMetric] == xMax ? 'end' : 'middle')
          .text(`${props.keyFormat(dataD[props.rMetric])} people`)
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
      hoverPopAbsolute.text('');
    }

    return this; // Generally, always return the chart class from draw!
  }
}

export default IncomeVaccinations;
