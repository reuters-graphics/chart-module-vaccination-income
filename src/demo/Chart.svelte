<!-- ⭐ Write an interactive DEMO of your chart in this component.
Follow the notes below! -->
<script>
  export let responsive; // eslint-disable-line
  import { afterUpdate } from 'svelte';
  import Docs from './App/Docs.svelte';
  import Explorer from './App/Explorer.svelte';
  import IncomeVaccinations from '../js/index';
  import chartData from './data.json';
  let chart = new IncomeVaccinations();
  let chartContainer;

  // 🎚️ Create variables for any data or props you want users to be able
  // to update in the demo. (And write buttons to update them below!)

  let metric = 'region';
  // ...

  // 🎈 Tie your custom props back together into one chartProps object.
  $: chartProps = { yMetric: metric };

  afterUpdate(() => {
    // 💪 Create a new chart instance of your module.
    chart = new IncomeVaccinations();
    // ⚡ And let's use your chart!
    chart
      .selection(chartContainer)
      .data(chartData) // Pass your chartData
      .props(chartProps) // Pass your chartProps
      .draw(); // 🚀 DRAW IT!
  });

  // Creates array of random variables for 3 circles.
  function getRandomData() {
    const arr = [];
    for (let i = 0; i < 3; i++) {
      const d = {
        x: Math.floor(Math.random() * Math.floor(100)), //Random int 0-100
        y: Math.floor(Math.random() * Math.floor(100)), //Random int 0-100
        r: Math.floor(Math.random() * Math.floor(30 - 10) + 10), //Random int 10-30
      };
      arr.push(d);
    }
    return arr;
  }
</script>

<div id="vaccination-income-container" bind:this={chartContainer} />

<div class="chart-options">
  <!-- ✏️ Create buttons that update your data/props variables when they're clicked! -->
  <button
    on:click={() => {
      metric = 'region';
    }}>Region</button
  >
  <button
    on:click={() => {
      metric = 'IncomeGroup';
    }}>Income</button
  >
</div>

<!-- ⚙️ These components will automatically create interactive documentation for you chart! -->
<Docs />
<Explorer title="Data" data={chart.data()} />
<Explorer title="Props" data={chart.props()} />

<!-- 🖌️ Style your demo page here -->
<style lang="scss">
  .chart-options {
    button {
      padding: 5px 15px;
    }
  }
</style>
