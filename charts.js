let chart;
let originalData;

// Fetch data from external JSON file
fetch('https://marque6299.github.io/OneReport/Raw_One_Report_Data.json')
    .then(response => response.json())
    .then(data => {
        originalData = data.raw;
        setupFilters();
        updateChart(originalData); // Initial chart display
    })
    .catch(error => console.error('Error fetching the JSON data:', error));

// Set up filter options and event listeners
function setupFilters() {
    const dimensionFilter = document.getElementById('dimensionFilter');
    const valueFilter = document.getElementById('valueFilter');
    const valueFilterLabel = document.getElementById('valueFilterLabel');

    dimensionFilter.addEventListener('change', function() {
        const selectedDimension = this.value;

        if (selectedDimension) {
            // Get unique values for the selected dimension and sort them A-Z
            const uniqueValues = [...new Set(originalData.map(item => item[selectedDimension]))].sort();
            valueFilter.innerHTML = `<option value="">Select ${selectedDimension}</option>`;
            uniqueValues.forEach(value => {
                valueFilter.innerHTML += `<option value="${value}">${value}</option>`;
            });

            // Show secondary filter
            valueFilter.style.display = 'inline';
            valueFilterLabel.style.display = 'inline';
        } else {
            // Hide secondary filter if no dimension is selected
            valueFilter.style.display = 'none';
            valueFilterLabel.style.display = 'none';
        }

        // Reset secondary filter selection and update chart
        valueFilter.value = "";
        updateChart(originalData);
    });

    valueFilter.addEventListener('change', function() {
        const selectedDimension = dimensionFilter.value;
        const selectedValue = this.value;

        if (selectedDimension && selectedValue) {
            // Filter data based on selected dimension and value
            const filteredData = originalData.filter(item => item[selectedDimension] === selectedValue);
            updateChart(filteredData);
        } else {
            // Reset to original data if no value is selected
            updateChart(originalData);
        }
    });
}

// Function to update the chart with filtered data
function updateChart(data) {
    const dailyData = data.reduce((acc, entry) => {
        const date = new Date((entry.Date - 25569) * 86400 * 1000).toISOString().slice(0, 10);
        const score = entry.AHT * entry["Handle Count"]; // Calculate score as needed
        if (!acc[date]) {
            acc[date] = { totalScore: 0, totalHandleCount: 0 };
        }
        acc[date].totalScore += score;
        acc[date].totalHandleCount += entry["Handle Count"];
        return acc;
    }, {});

    const labels = Object.keys(dailyData);
    const dailyScores = labels.map(date => {
        const { totalScore, totalHandleCount } = dailyData[date];
        return totalHandleCount ? totalScore / totalHandleCount : 0; // Use score calculation logic here
    });

    // Destroy existing chart instance if it exists to avoid duplication
    if (chart) chart.destroy();

    const ctx = document.getElementById('ahtChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score',
                data: dailyScores,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Score'
                    }
                }
            }
        }
    });
}
