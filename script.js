// script.js

document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // Cargar el tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    // Manejar el clic para cambiar el tema
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark');
        if (body.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            localStorage.setItem('theme', 'light');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
        // Actualizar los colores del gráfico si existe
        if (impactChart) {
            updateChartColors(impactChart);
        }
    });

    const featureTabs = document.querySelectorAll('.feature-tab');
    const tabPanes = document.querySelectorAll('#tab-content .tab-pane');

    // Manejar la navegación de las pestañas
    featureTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            featureTabs.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.remove('bg-green-600', 'dark:bg-purple-600', 'text-white');
            });
            tab.classList.add('tab-active', 'bg-green-600', 'text-white');
            if (body.classList.contains('dark')) {
                 tab.classList.remove('bg-green-600');
                 tab.classList.add('dark:bg-purple-600');
            }

            const target = tab.getAttribute('data-tab');
            
            tabPanes.forEach(pane => {
                if (pane.id === `content-${target}`) {
                    pane.classList.remove('hidden');
                } else {
                    pane.classList.add('hidden');
                }
            });
        });
    });

    // Función para actualizar los colores del gráfico
    function updateChartColors(chart) {
        const isDark = body.classList.contains('dark');
        chart.data.datasets[0].backgroundColor = isDark ? '#f87171' : 'rgba(16, 185, 129, 0.7)';
        chart.data.datasets[0].borderColor = isDark ? '#ef4444' : 'rgba(16, 185, 129, 1)';
        chart.options.scales.y.grid.color = isDark ? '#4b5563' : '#e5e7eb';
        chart.options.plugins.tooltip.backgroundColor = isDark ? '#374151' : '#1f2937';
        chart.update();
    }

    // Configuración inicial del gráfico
    const ctx = document.getElementById('impactChart').getContext('2d');
    const impactChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Usuarios', 'Retención', 'Interoperabilidad', 'Adopción', 'Crecimiento'],
            datasets: [{
                label: 'Potencial de Crecimiento (en miles)',
                data: [500, 450, 300, 600, 400],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}k`;
                        }
                    }
                }
            }
        }
    });
     updateChartColors(impactChart);
});
