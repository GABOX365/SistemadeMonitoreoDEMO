document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const sidebar = document.querySelector('.app-sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Control del sidebar
    function toggleSidebar() {
        if (window.innerWidth > 992) {
            sidebar.classList.toggle('collapsed');
            saveSidebarState();
        } else {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : 'auto';
        }
    }

    // Guardar/recuperar estado del sidebar
    function saveSidebarState() {
        if (window.innerWidth > 992) {
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    function loadSidebarState() {
        if (window.innerWidth > 992 && localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
    }

    // Manejo responsive
    function handleResponsive() {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('show');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else {
            sidebar.classList.remove('collapsed');
        }
    }

    // Event listeners para el sidebar
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });

    overlay.addEventListener('click', toggleSidebar);

    // Función para actualizar el menú activo
    function updateActiveMenu(currentHash) {
        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.remove('active');
            const link = li.querySelector('a');
            if (link) {
                const linkHref = link.getAttribute('href');
                if (linkHref === currentHash) {
                    li.classList.add('active');
                }
            }
        });
    }

    // Navegación SPA
    function handleNavigation() {
        let currentHash = window.location.hash;
        if (!currentHash || currentHash === '#') {
            currentHash = '#dashboard';
            window.location.hash = currentHash;
            return;
        }

        const sectionId = currentHash.substring(1);
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = 'block';
            
            // Inicializar componentes según la sección
            if (sectionId === 'dashboard' && typeof initDashboardCharts === 'function') {
                initDashboardCharts();
            } else if (sectionId === 'historial' && typeof initHistoryCharts === 'function') {
                initHistoryCharts();
            } else if (sectionId === 'dispositivos' && typeof initDevicesCharts === 'function') {
                initDevicesCharts();
            } else if (sectionId === 'configuracion' && typeof initConfiguration === 'function') {
                initConfiguration();
            } else if (sectionId === 'lista-negra' && typeof initBlacklist === 'function') {
                initBlacklist();
            }
        }
        
        // Actualizar menú activo
        updateActiveMenu(currentHash);
    }

    // Event listeners para enlaces del menú
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href');
            
            // Actualizar el menú activo inmediatamente
            updateActiveMenu(targetSection);
            
            // Forzar la actualización del estado activo
            if (window.location.hash !== targetSection) {
                window.location.hash = targetSection;
            } else {
                handleNavigation(); // Forzar actualización si ya está en la misma sección
            }
            
            if (window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });

    // Inicialización mejorada
    function initializeApp() {
        // Establecer hash por defecto si no existe
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = '#dashboard';
            // Mostrar dashboard inmediatamente
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) {
                dashboardSection.style.display = 'block';
            }
        }
        
        loadSidebarState();
        handleResponsive();
        
        // Pequeño retraso para asegurar que todo esté listo
        setTimeout(() => {
            handleNavigation();
        }, 50);
    }

    // Manejar cambios en la URL
    window.addEventListener('hashchange', handleNavigation);
    
    // Inicialización
    initializeApp();

    // Redimensionamiento con debounce
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            handleResponsive();
            void sidebar.offsetHeight; // Forzar repintado
            handleNavigation(); // Reforzar navegación actual
        }, 150);
    });
});

// Función para inicializar gráficos
function initDashboardCharts() {
    const trafficCanvas = document.getElementById('webTrafficChart');
    if (!trafficCanvas) return;

    // Destruir gráfico existente si lo hay
    if (trafficCanvas.chart) {
        trafficCanvas.chart.destroy();
    }

    // Crear nuevo gráfico
    trafficCanvas.chart = new Chart(trafficCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Redes Sociales', 'Noticias', 'Entretenimiento', 'Tecnología', 'Compras', 'Adultos', 'Otros'],
            datasets: [{
                label: 'Visitas',
                data: [1250, 980, 1560, 870, 450, 120, 680],
                backgroundColor: [
                    '#4361ee', '#4895ef', '#4cc9f0', 
                    '#7209b7', '#f72585', '#ef233c', 
                    '#adb5bd'
                ],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y} visitas`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });
}


function initHistoryCharts() {
    const timelineCanvas = document.getElementById('activityTimelineChart');
    if (!timelineCanvas) return;

    // Destruir gráfico existente si lo hay
    if (timelineCanvas.chart) {
        timelineCanvas.chart.destroy();
    }

    // Crear nuevo gráfico de línea
    timelineCanvas.chart = new Chart(timelineCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [
                {
                    label: 'Conexiones',
                    data: [45, 52, 48, 65, 72, 43, 50],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Alertas',
                    data: [5, 8, 6, 12, 15, 4, 7],
                    borderColor: '#ef233c',
                    backgroundColor: 'rgba(239, 35, 60, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Bloqueos',
                    data: [12, 15, 10, 18, 22, 8, 14],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initDevicesCharts() {
    // Gráfico de distribución de dispositivos
    const distributionCanvas = document.getElementById('devicesDistributionChart');
    if (distributionCanvas) {
        distributionCanvas.chart = new Chart(distributionCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Oficina Principal', 'Marketing', 'TI', 'Ventas', 'Recursos Humanos', 'Gerencia'],
                datasets: [{
                    label: 'Dispositivos',
                    data: [28, 15, 12, 18, 8, 5],
                    backgroundColor: [
                        '#4361ee', '#4895ef', '#4cc9f0', 
                        '#7209b7', '#f72585', '#ef233c'
                    ],
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} dispositivos`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { drawBorder: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Gráfico de tipos de dispositivos
    const typeCanvas = document.getElementById('devicesTypeChart');
    if (typeCanvas) {
        typeCanvas.chart = new Chart(typeCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Laptops', 'Teléfonos', 'Tablets', 'Servidores', 'IoT'],
                datasets: [{
                    data: [35, 28, 12, 8, 5],
                    backgroundColor: [
                        '#4361ee', '#4895ef', '#4cc9f0', 
                        '#7209b7', '#f72585'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Actualizar métricas (simulación)
    updateDeviceMetrics();
}

function updateDeviceMetrics() {
    // Simulación de datos - en una aplicación real estos vendrían de una API
    document.getElementById('total-devices').textContent = '86';
    document.getElementById('connected-devices').textContent = '58';
    document.getElementById('unauthorized-devices').textContent = '7';
    document.getElementById('blocked-devices').textContent = '5';
    
    document.getElementById('device-trend').textContent = '5.4';
    document.getElementById('connected-trend').textContent = '3.2';
    document.getElementById('unauthorized-trend').textContent = '2.1';
    document.getElementById('blocked-trend').textContent = '8.7';
}

function initConfiguration() {
    // Inicializar pestañas de configuración
    const configTabs = document.querySelectorAll('#configuracion a[data-bs-toggle="list"]');
    configTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            localStorage.setItem('lastConfigTab', event.target.getAttribute('href'));
        });
    });

    // Restaurar última pestaña visitada
    const lastTab = localStorage.getItem('lastConfigTab');
    if (lastTab) {
        const tab = document.querySelector(`a[href="${lastTab}"]`);
        if (tab) new bootstrap.Tab(tab).show();
    }

    // Validación de formularios
    document.querySelectorAll('#configuracion form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para guardar la configuración
            showAlert('success', 'Configuración guardada correctamente');
        });
    });

    // Mostrar alerta de ejemplo
    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('#configuracion .container-fluid');
        if (container) {
            container.prepend(alert);
            
            // Eliminar la alerta después de 5 segundos
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }, 5000);
        }
    }
}


function initBlacklist() {
    // Actualizar métricas
    updateBlacklistMetrics();
    
    // Inicializar gráficos
    initBlacklistCharts();
    
    // Configurar el modal de agregar a lista negra
    setupBlacklistModal();
    
    // Configurar eventos de la tabla
    setupBlacklistTable();
}

function updateBlacklistMetrics() {
    // Simulación de datos - en una aplicación real estos vendrían de una API
    document.getElementById('total-blacklist').textContent = '42';
    document.getElementById('blocked-attempts').textContent = '128';
    document.getElementById('devices-blacklist').textContent = '8';
    document.getElementById('websites-blacklist').textContent = '34';
    
    document.getElementById('blacklist-trend').textContent = '5.2';
    document.getElementById('attempts-trend').textContent = '12.7';
    document.getElementById('devices-trend').textContent = '3.5';
    document.getElementById('websites-trend').textContent = '8.1';
}

function initBlacklistCharts() {
    // Gráfico de categorías de sitios bloqueados
    const categoriesCanvas = document.getElementById('categoriesChart');
    if (categoriesCanvas) {
        categoriesCanvas.chart = new Chart(categoriesCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Redes Sociales', 'Juegos', 'Entretenimiento', 'Adultos', 'Otros'],
                datasets: [{
                    data: [15, 8, 6, 3, 2],
                    backgroundColor: [
                        '#4361ee', '#4895ef', '#4cc9f0', 
                        '#f72585', '#adb5bd'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // Gráfico de tipos de dispositivos bloqueados
    const devicesCanvas = document.getElementById('devicesBlockedChart');
    if (devicesCanvas) {
        devicesCanvas.chart = new Chart(devicesCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Laptops', 'Teléfonos', 'Tablets', 'Servidores', 'Otros'],
                datasets: [{
                    label: 'Dispositivos Bloqueados',
                    data: [4, 2, 1, 0, 1],
                    backgroundColor: '#ef233c',
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} dispositivos`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { drawBorder: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function setupBlacklistModal() {
    // Mostrar/ocultar campos según el tipo de bloqueo seleccionado
    const tipoBloqueoRadios = document.querySelectorAll('input[name="tipoBloqueo"]');
    tipoBloqueoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('sitioWebGroup').classList.add('d-none');
            document.getElementById('dispositivoGroup').classList.add('d-none');
            document.getElementById('palabraClaveGroup').classList.add('d-none');
            
            if (this.value === 'sitio') {
                document.getElementById('sitioWebGroup').classList.remove('d-none');
            } else if (this.value === 'dispositivo') {
                document.getElementById('dispositivoGroup').classList.remove('d-none');
            } else if (this.value === 'palabra') {
                document.getElementById('palabraClaveGroup').classList.remove('d-none');
            }
        });
    });
}

function setupBlacklistTable() {
    // Configurar eventos para los botones de la tabla
    document.querySelectorAll('#lista-negra .btn-outline-success').forEach(btn => {
        btn.addEventListener('click', function() {
            const fila = this.closest('tr');
            const tipo = fila.querySelector('td:first-child').textContent.trim();
            const elemento = fila.querySelector('td:nth-child(2)').textContent;
            
            if (confirm(`¿Está seguro que desea desbloquear ${elemento}?`)) {
                fila.querySelector('td:nth-child(6) span').className = 'badge bg-success';
                fila.querySelector('td:nth-child(6) span').textContent = 'Inactivo';
                showAlert('success', `${tipo} ${elemento} ha sido desbloqueado`);
            }
        });
    });
    
    document.querySelectorAll('#lista-negra .btn-outline-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            const fila = this.closest('tr');
            const tipo = fila.querySelector('td:first-child').textContent.trim();
            const elemento = fila.querySelector('td:nth-child(2)').textContent;
            
            if (confirm(`¿Está seguro que desea eliminar ${elemento} de la lista negra?`)) {
                fila.remove();
                showAlert('success', `${tipo} ${elemento} ha sido eliminado de la lista negra`);
            }
        });
    });
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alert.style.zIndex = '1100';
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}


