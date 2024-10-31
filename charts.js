// Enhanced chart rendering with error handling and performance optimization
document.addEventListener('DOMContentLoaded', () => {
    const CHART_CONFIG = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                datalabels: {
                    color: '#333',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toFixed(2)
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Date' },
                    grid: { display: false }
                },
                y: {
                    title: { display: true, text: 'Average AHT (seconds)' },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    };

    let chart = null;
    let originalData = [];

    // Improved error handling for data fetching
    async function fetchData() {
        try {
            const response = await fetch('https://marque6299.github.io/OneReport/Raw_One_Report_Data.json');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            originalData = data.raw || [];
            
            if (originalData.length === 0) {
                throw new Error('No data available');
            }

            setupFilters();
            initializeDefaultDateRange();
        } catch (error) {
            console.error('Data Fetch Error:', error);
            displayErrorMessage('Unable to load data. Please try again later.');
        }
    }

    function displayErrorMessage(message) {
        const chartContainer = document.getElementById('ahtChart').parentElement;
        chartContainer.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                ${message}
            </div>
        `;
    }

    function initializeDefaultDateRange() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];
        
        applyFilters();
    }

    // Rest of the existing charts.js code with minor optimizations...
    // (Keep the existing functions like setupFilters, applyFilters, etc.)

    fetchData();
});