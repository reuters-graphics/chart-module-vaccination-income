![](./badge.svg)

# IncomeVaccinations

See the [demo page](https://reuters-graphics.github.io/chart-module-vaccination-income/).

### Install

```
$ yarn add https://github.com/reuters-graphics/chart-module-vaccination-income.git
```

### Use

```javascript
import IncomeVaccinations from '@reuters-graphics/chart-module-vaccination-income';

const chart = new IncomeVaccinations();

// To create your chart, pass a selector string to the chart's selection method,
// as well as any props or data to their respective methods. Then call draw.
chart
  .selection('#chart')
  .data([{
      "country": "Gibraltar",
      "countryISO": "GI",
      "date": "2021-03-09",
      "totalDoses": 44240,
      "peopleVaccinated": 28431,
      "peopleFullyVaccinated": 15809,
      "vaccineName": "Pfizer/BioNTech",
      "perPop": "131272.07",
      "population": 33701
    },
    {
      "country": "Israel",
      "countryISO": "IL",
      "date": "2021-03-09",
      "totalDoses": 8975914,
      "peopleVaccinated": 5035562,
      "peopleFullyVaccinated": 3940352,
      "vaccineName": "Moderna, Pfizer/BioNTech",
      "perPop": "99145.22",
      "population": 9053300
  }])
  .props({ 
    height: 700, // Must have a fixed height

    margin: {
      top: 20,
      right: 20,
      bottom: 25,
      left: 30,
    }, 

    maxRadius: 30, // Max radius of the circle

    rMetric: 'peopleVaccinated', // Size of the circle is based on...
    // Other options - peopleFullyVaccinated, totalDoses

    xMetric: 'peopleVaccinatedPerPopulation', // Variable for the x axis
    // Other options - peopleFullyVaccinatedPerPopulation, dosesPerPopulation

    yMetric: 'region', // Change to IncomeGroup to re-sort

    padding: 1, // padding between circles

    colorScale: function(d) {
      return 'rgba(163, 190, 140, 0.5)' // Colour of the circle must be a function. Placed in case tomorrow we want a colour scale.
    },

    colorStroke: '#a3be8c', // Stroke of the circle

    textColor: 'hsla(0,0%,100%,.75)', // Fill of the group name
  })
  .draw();

// You can call any method again to update the chart.
chart
  .data([3, 4, 5])
  .draw();

// Or just call the draw function alone, which is useful for resizing the chart.
chart.draw();
```

To apply this chart's default styles when using SCSS, simply define the variable `$IncomeVaccinations-container` to represent the ID or class of the chart's container(s) and import the `_chart.scss` partial.

```CSS
$IncomeVaccinations-container: '#chart';

@import '~@reuters-graphics/chart-module-vaccination-income/src/scss/chart';
```

## Developing chart modules

Read more in the [DEVELOPING docs](./DEVELOPING.md) about how to write your chart module.