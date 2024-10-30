let originalData = [];

// Fetch data from the JSON file
fetch('sample.json')
  .then(response => response.json())
  .then(data => {
    originalData = data.sample;
    populateDropdown(originalData);
    updateCharts(originalData);
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

// Update charts when dropdown selection changes
document.getElementById('nameFilter').addEventListener('change', () => {
  const selectedNames = Array.from(document.getElementById('nameFilter').selectedOptions).map(option => option.value);
  const filteredData = selectedNames.length ? originalData.filter(entry => selectedNames.includes(entry.GM)) : originalData;
  updateCharts(filteredData);
});

// Update both charts based on filtered data
function updateCharts(data) {
  const names = data.map(entry => entry.GM);
  const ahtValues = data.map(entry => entry.AHT);

  const fcrValues = data.map(entry => entry["FCR %"]);
  const averageFcr = (fcrValues.reduce((a, b) => a + b, 0) / fcrValues.length) * 100;

  // Update AHT Column Chart
  if (window.ahtChart) window.ahtChart.destroy();
  const ahtChartCtx = document.getElementById('ahtChart').getContext('2d');
  window.ahtChart = new Chart(ahtChartCtx, {
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

  // Update FCR Gauge Chart
  if (window.fcrGauge) window.fcrGauge.destroy();
  const gaugeCtx = document.getElementById('fcrGauge').getContext('2d');
  window.fcrGauge = new Chart(gaugeCtx, {
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
}