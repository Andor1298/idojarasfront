let chart = null;
let chartLabels = [];
let chartData = [];

async function getChartData() {
    // lekérdezi a backendről a user lépésadatait
    // majd feltölti a labels és data tömböket
    chartLabels = [];
    chartData = [];

    try {
        let res = await fetch(`${ServerUrl}/steps/user/${loggedUser.id}`);
        let data = await res.json();
        data.forEach(element => {
            chartLabels.push(element.date);
            chartData.push(element.count);
        });
    } catch (error) {
        console.log(error);
    }
}

function initChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
            {
              label: 'Teszt felhasználó',
              data: chartData
            }
          ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Lépés statisztika'
                }
            },
            scales:{
              y:{
                beginAtZero: true
              }
            }
        }
    })
}

