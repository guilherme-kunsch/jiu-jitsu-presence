// ==========================================
// SISTEMA DE CONTROLE DE PRESENÇA
// Academia de Jiu-Jitsu
// Script de Administração
// ==========================================

// Configuração da API do Google Apps Script
// Substitua pela URL do seu Apps Script publicado (deve ser a mesma do script.js)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2i_2BodnImRv4pQGnJr9rUNM-x0wMCok7xq-3amKD9Kj1wdYtS8eGOmjiRzhN-9ERLQ/exec';

// Variáveis globais
let allAttendanceData = [];
let filteredData = [];
let charts = {};

// Elementos do DOM
const loadingOverlay = document.getElementById('loadingOverlay');
const refreshBtn = document.getElementById('refreshBtn');
const searchNameInput = document.getElementById('searchName');
const filterClassSelect = document.getElementById('filterClass');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportCsvBtn = document.getElementById('exportCsv');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const adminErrorToast = new bootstrap.Toast(document.getElementById('adminErrorToast'));
const adminErrorMessage = document.getElementById('adminErrorMessage');

// Elementos de estatísticas
const todayCountEl = document.getElementById('todayCount');
const monthCountEl = document.getElementById('monthCount');
const uniqueStudentsEl = document.getElementById('uniqueStudents');
const lastRecordEl = document.getElementById('lastRecord');

// ==========================================
// Inicialização
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Configurar datas iniciais (mês atual)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDateInput.value = firstDay.toISOString().split('T')[0];
    endDateInput.value = lastDay.toISOString().split('T')[0];
    
    // Adicionar event listeners
    refreshBtn.addEventListener('click', loadData);
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    exportCsvBtn.addEventListener('click', exportToCSV);
    searchNameInput.addEventListener('input', applyFilters);
    filterClassSelect.addEventListener('change', applyFilters);
    
    // Carregar dados iniciais
    loadData();
});

// ==========================================
// Carregamento de Dados
// ==========================================

/**
 * Carrega todos os dados de presença do Google Sheets
 */
async function loadData() {
    showLoading(true);
    
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getAllAttendance`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            allAttendanceData = data.data;
            filteredData = [...allAttendanceData];
            updateUI();
        } else {
            throw new Error(data.message || 'Erro ao carregar dados');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados do servidor. Verifique a conexão.');
        attendanceTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Erro ao carregar dados</td></tr>';
    } finally {
        showLoading(false);
    }
}

// ==========================================
// Atualização da Interface
// ==========================================

/**
 * Atualiza toda a interface com os dados filtrados
 */
function updateUI() {
    updateStatistics();
    updateTable();
    updateCharts();
}

/**
 * Atualiza as estatísticas
 */
function updateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Presenças hoje
    const todayRecords = filteredData.filter(record => record.date === today);
    todayCountEl.textContent = todayRecords.length;
    
    // Presenças no mês
    const monthRecords = filteredData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    monthCountEl.textContent = monthRecords.length;
    
    // Alunos diferentes
    const uniqueNames = new Set(filteredData.map(record => record.name.toLowerCase()));
    uniqueStudentsEl.textContent = uniqueNames.size;
    
    // Último registro
    if (filteredData.length > 0) {
        const sortedByTime = [...filteredData].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        const lastRecord = sortedByTime[0];
        lastRecordEl.textContent = lastRecord.time;
    } else {
        lastRecordEl.textContent = '--:--';
    }
}

/**
 * Atualiza a tabela de registros
 */
function updateTable() {
    if (filteredData.length === 0) {
        attendanceTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
        return;
    }
    
    // Ordenar por data e hora (mais recente primeiro)
    const sortedData = [...filteredData].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    attendanceTableBody.innerHTML = sortedData.map(record => `
        <tr>
            <td>${formatDateDisplay(record.date)}</td>
            <td>${record.time}</td>
            <td>${record.name}</td>
            <td><span class="badge" style="background: var(--color-gold); color: var(--color-black);">${record.classType}</span></td>
            <td>${capitalizeFirst(record.dayOfWeek)}</td>
        </tr>
    `).join('');
}

/**
 * Atualiza todos os gráficos
 */
function updateCharts() {
    updateDailyChart();
    updateClassChart();
    updateRankingChart();
    updateMonthlyChart();
}

// ==========================================
// Gráficos
// ==========================================

/**
 * Gráfico de presenças por dia
 */
function updateDailyChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    
    // Agrupar por data
    const dailyData = {};
    filteredData.forEach(record => {
        if (!dailyData[record.date]) {
            dailyData[record.date] = 0;
        }
        dailyData[record.date]++;
    });
    
    // Ordenar por data
    const sortedDates = Object.keys(dailyData).sort();
    const counts = sortedDates.map(date => dailyData[date]);
    
    // Destruir gráfico anterior se existir
    if (charts.daily) {
        charts.daily.destroy();
    }
    
    charts.daily = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(date => formatDateDisplay(date)),
            datasets: [{
                label: 'Presenças',
                data: counts,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de presenças por turma
 */
function updateClassChart() {
    const ctx = document.getElementById('classChart').getContext('2d');
    
    // Agrupar por turma
    const classData = {};
    filteredData.forEach(record => {
        if (!classData[record.classType]) {
            classData[record.classType] = 0;
        }
        classData[record.classType]++;
    });
    
    const labels = Object.keys(classData);
    const data = Object.values(classData);
    
    // Destruir gráfico anterior se existir
    if (charts.class) {
        charts.class.destroy();
    }
    
    charts.class = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#D4AF37',
                    '#F4D03F',
                    '#B8960C',
                    '#FFD700',
                    '#DAA520'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de ranking de alunos
 */
function updateRankingChart() {
    const ctx = document.getElementById('rankingChart').getContext('2d');
    
    // Contar presenças por aluno
    const studentData = {};
    filteredData.forEach(record => {
        const name = record.name.toLowerCase();
        if (!studentData[name]) {
            studentData[name] = 0;
        }
        studentData[name]++;
    });
    
    // Ordenar e pegar top 10
    const sortedStudents = Object.entries(studentData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedStudents.map(([name]) => capitalizeFirst(name));
    const data = sortedStudents.map(([, count]) => count);
    
    // Destruir gráfico anterior se existir
    if (charts.ranking) {
        charts.ranking.destroy();
    }
    
    charts.ranking = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Presenças',
                data: data,
                backgroundColor: '#D4AF37'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de aulas por mês
 */
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Agrupar por mês
    const monthlyData = {};
    filteredData.forEach(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey]++;
    });
    
    // Ordenar por mês
    const sortedMonths = Object.keys(monthlyData).sort();
    const counts = sortedMonths.map(month => monthlyData[month]);
    
    // Destruir gráfico anterior se existir
    if (charts.monthly) {
        charts.monthly.destroy();
    }
    
    charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return `${monthNames[parseInt(monthNum) - 1]}/${year}`;
            }),
            datasets: [{
                label: 'Aulas',
                data: counts,
                backgroundColor: '#D4AF37'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// ==========================================
// Filtros
// ==========================================

/**
 * Aplica os filtros aos dados
 */
function applyFilters() {
    const searchTerm = searchNameInput.value.toLowerCase().trim();
    const classFilter = filterClassSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    filteredData = allAttendanceData.filter(record => {
        // Filtro por nome
        if (searchTerm && !record.name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filtro por turma
        if (classFilter && record.classType !== classFilter) {
            return false;
        }
        
        // Filtro por período
        if (startDate && record.date < startDate) {
            return false;
        }
        
        if (endDate && record.date > endDate) {
            return false;
        }
        
        return true;
    });
    
    updateUI();
}

/**
 * Limpa todos os filtros
 */
function clearFilters() {
    searchNameInput.value = '';
    filterClassSelect.value = '';
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDateInput.value = firstDay.toISOString().split('T')[0];
    endDateInput.value = lastDay.toISOString().split('T')[0];
    
    filteredData = [...allAttendanceData];
    updateUI();
}

// ==========================================
// Exportação
// ==========================================

/**
 * Exporta os dados filtrados para CSV
 */
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    // Cabeçalho do CSV
    const headers = ['Data', 'Hora', 'Nome', 'Turma', 'Dia da Semana', 'Mês', 'Ano', 'Timestamp'];
    
    // Linhas do CSV
    const rows = filteredData.map(record => [
        record.date,
        record.time,
        record.name,
        record.classType,
        record.dayOfWeek,
        record.month,
        record.year,
        record.timestamp
    ]);
    
    // Combinar tudo
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `presencas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// Funções Utilitárias
// ==========================================

/**
 * Mostra ou esconde o loading
 * @param {boolean} show - true para mostrar, false para esconder
 */
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    adminErrorMessage.textContent = message;
    adminErrorToast.show();
}

/**
 * Formata data para exibição
 * @param {string} dateStr - Data em formato ISO
 * @returns {string} - Data formatada
 */
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizada
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
