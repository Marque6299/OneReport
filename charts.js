// Fetch data from external JSON file
fetch('https://marque6299.github.io/OneReport/Raw_One_Report_Data.json')
    .then(response => response.json())
    .then(data => {
        // Calculate daily total talk time and handle count
        const dailyData = data.raw.reduce((acc, entry) => {
            const date = new Date((entry.Date - 25569) * 86400 * 1000).toISOString().slice(0, 10);
            const talkTime = entry.AHT * entry["Handle Count"]; // Total Talk Time per entry
            if (!acc[date]) {
                acc[date] = { totalTalkTime: 0, totalHandleCount: 0 };
            }
            acc[date].totalTalkTime += talkTime;
            acc[date].totalHandleCount += entry["Handle Count"];
            return acc;
        }, {});

        // Calculate average AHT per day
        const labels = Object.keys(dailyData);
        const dailyAHT = labels.map(date => {
            const { totalTalkTime, totalHandleCount } = dailyData[date];
            return totalTalkTime / totalHandleCount; // Average AHT for the day
        });

        // Chart setup
        const ctx = document.getElementById('ahtChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
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
