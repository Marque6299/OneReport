// Fetch data from external JSON file
fetch('https://marque6299.github.io/OneReport/Raw_One_Report_Data.json')
    .then(response => response.json())
    .then(data => {
        // Extract Date and AHT for daily values
        const dailyAHTData = data.raw.reduce((acc, entry) => {
            const date = new Date((entry.Date - 25569) * 86400 * 1000).toISOString().slice(0, 10);
            acc[date] = (acc[date] || []).concat(entry.AHT);
            return acc;
        }, {});

        // Average the AHT values per day
        const labels = Object.keys(dailyAHTData);
        const dailyAHT = labels.map(date => {
            const values = dailyAHTData[date];
            return values.reduce((sum, aht) => sum + aht, 0) / values.length;
        });

        // Chart setup
        const ctx = document.getElementById('ahtChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Handling Time (AHT)',
                    data: dailyAHT,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
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
                            text: 'Average AHT (seconds)'
                        }
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching the JSON data:', error));
