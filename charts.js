// Fetch data from external JSON file
fetch('https://marque6299.github.io/OneReport/sample.json')
  .then(response => response.json())
  .then(data => {
    // Extract names and AHT values for column chart
    const names = data.sample.map(entry => entry.GM);
    const ahtValues = data.sample.map(entry => entry.AHT);

    // Calculate average FCR%
    const fcrValues = data.sample.map(entry => entry["FCR %"]);
    const averageFcr = (fcrValues.reduce((a, b) => a + b, 0) / fcrValues.length) * 100;

    // AHT Column Chart
    const ahtChartCtx = document.getElementById('ahtChart').getContext('2d');
    new Chart(ahtChartCtx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'AHT',
          data: ahtValues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'AHT (in seconds)' }
          },
          x: {
            title: { display: true, text: 'Names' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    // FCR Gauge Chart
    const gaugeCtx = document.getElementById('fcrGauge').getContext('2d');
    new Chart(gaugeCtx, {
      type: 'doughnut',
      data: {
        labels: ['Average FCR%', 'Remaining'],
        datasets: [{
          data: [averageFcr, 100 - averageFcr],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(200, 200, 200, 0.2)'],
          borderWidth: 1
        }]
      },
      options: {
        circumference: 180,
        rotation: -90,
        cutout: '70%',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          title: {
            display: true,
            text: `Average FCR%: ${averageFcr.toFixed(2)}%`
          }
        }
      }
    });
  })
  .catch(error => console.error('Error loading the JSON file:', error));

// Populate the dropdown with names
function populateDropdown(data) {
  const dropdown = document.getElementById('nameFilter');
  data.forEach(entry => {
    const option = document.createElement('option');
    option.value = entry.GM;
    option.textContent = entry.GM;
    dropdown.appendChild(option);
  });
}
