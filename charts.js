let chart;
let originalData;

// Get the first and last date of the current month
function getDefaultDateRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] };
}

// Fetch data from external JSON file
fetch('https://marque6299.github.io/OneReport/Raw_One_Report_Data.json')
    .then(response => response.json())
    .then(data => {
        originalData = data.raw;
        setupFilters();
        const { startDate, endDate } = getDefaultDateRange();
        document.getElementById('startDate').value = startDate;
        document.getElementById('endDate').value = endDate;
        updateChart(filterDataByDateRange(originalData, startDate, endDate)); // Initial chart display
    })
    .catch(error => console.error('Error fetching the JSON data:', error));

// Set up filter options and event listeners
function setupFilters() {
    const dimensionFilter = document.getElementById('dimensionFilter');
    const valueFilter = document.getElementById('valueFilter');
    const valueFilterLabel = document.getElementById('valueFilterLabel');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Event listener for primary dimension filter
    dimensionFilter.addEventListener('change', function() {
        const selectedDimension = this.value;

        if (selectedDimension) {
            // Populate and sort secondary filter values
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
        applyFilters();
    });

    // Event listener for value filter
    valueFilter.addEventListener('change', applyFilters);

    // Event listeners for date range filters
    startDateInput.addEventListener('change', applyFilters);
    endDateInput.addEventListener('change', applyFilters);
}

// Apply all filters and update the chart
function applyFilters() {
    const dimensionFilter = document.getElementById('dimensionFilter').value;
    const valueFilter = document.getElementById('valueFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let filteredData = originalData;

    // Filter by dimension and value
    if (dimensionFilter && valueFilter) {
        filteredData = filteredData.filter(item => item[dimensionFilter] === valueFilter);
    }

    // Filter by date range
    filteredData = filterDataByDateRange(filteredData, startDate, endDate);

    updateChart(filteredData);
}

// Filter data by selected date range
function filterDataByDateRange(data, startDate, endDate) {
    return data.filter(item => {
        const itemDate = new Date((item.Date - 25569) * 86400 * 1000).toISOString().slice(0, 10);
        return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
    });
}

// Function to update the chart with filtered data
function updateChart(data) {
    const dailyData = data.reduce((acc, entry) => {
        const date = new Date((entry.Date - 25569) * 86400 * 1000).toISOString().slice(0, 10);
        const talkTime = entry.AHT * entry["Handle Count"];
        if (!acc[date]) {
            acc[date] = { totalTalkTime: 0, totalHandleCount: 0 };
        }
        acc[date].totalTalkTime += talkTime;
        acc[date].totalHandleCount += entry["Handle Count"];
        return acc;
    }, {});

    const labels = Object.keys(dailyData);
    const dailyAHT = labels.map(date => {
        const { totalTalkTime, totalHandleCount } = dailyData[date];
        return totalHandleCount ? totalTalkTime / totalHandleCount : 0;
    });

    // Destroy existing chart instance if it exists to avoid duplication
    if (chart) chart.destroy();

    const ctx = document.getElementById('ahtChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Handling Time (AHT)',
                data: dailyAHT,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#333',
                    font: {
                        size: (context) => {
                            const barWidth = context.chart.scales.x.getPixelForTick(context.dataIndex + 1) - 
                                             context.chart.scales.x.getPixelForTick(context.dataIndex);
                            return barWidth > 30 ? 12 : Math.max(8, barWidth * 0.4); // Adjust size dynamically
                        },
                        weight: 'bold'
                    },
                    rotation: (context) => {
                        const barWidth = context.chart.scales.x.getPixelForTick(context.dataIndex + 1) - 
                                         context.chart.scales.x.getPixelForTick(context.dataIndex);
                        return barWidth > 30 ? 0 : 90; // Rotate 90 degrees if bar width is too small
                    },
                    formatter: (value) => value.toFixed(2)
                }
            },
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
                        text: 'Average AHT (seconds)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Initialize ChartDataLabels plugin
    });
}
