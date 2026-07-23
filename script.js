// ==========================================
// SISTEMA DE CONTROLE DE PRESENÇA
// Academia de Jiu-Jitsu
// Script Principal
// ==========================================

// Configuração da API do Google Apps Script
// Substitua pela URL do seu Apps Script publicado
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2i_2BodnImRv4pQGnJr9rUNM-x0wMCok7xq-3amKD9Kj1wdYtS8eGOmjiRzhN-9ERLQ/exec';

// Elementos do DOM
const attendanceForm = document.getElementById('attendanceForm');
const studentNameInput = document.getElementById('studentName');
const classTypeSelect = document.getElementById('classType');
const submitBtn = document.getElementById('submitBtn');
const successToast = new bootstrap.Toast(document.getElementById('successToast'));
const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
const warningToast = new bootstrap.Toast(document.getElementById('warningToast'));
const errorMessage = document.getElementById('errorMessage');

// Elementos do Modal QR Code
const qrModal = document.getElementById('qrModal');
const qrUrlInput = document.getElementById('qrUrl');
const generateQrBtn = document.getElementById('generateQrBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const qrCodeContainer = document.getElementById('qrCodeContainer');

// Variável para armazenar o canvas do QR Code
let qrCodeCanvas = null;

// ==========================================
// Inicialização
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Carregar URL atual no campo do QR Code
    qrUrlInput.value = window.location.href;
    
    // Adicionar event listeners
    attendanceForm.addEventListener('submit', handleSubmit);
    generateQrBtn.addEventListener('click', generateQRCode);
    downloadQrBtn.addEventListener('click', downloadQRCode);
});

// ==========================================
// Manipulação do Formulário
// ==========================================

async function handleSubmit(event) {
    event.preventDefault();
    
    // Validar campos
    const name = studentNameInput.value.trim();
    const classType = classTypeSelect.value;
    
    if (!name) {
        showError('Por favor, digite seu nome.');
        return;
    }
    
    if (!classType) {
        showError('Por favor, selecione sua turma.');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Verificar se o aluno já registrou presença hoje (validação local)
        const alreadyRegistered = checkAttendanceLocal(name);
        
        if (alreadyRegistered) {
            showWarning();
            resetForm();
            return;
        }
        
        // Registrar presença
        await registerAttendance(name, classType);
        
        // Salvar no localStorage para validação futura
        saveAttendanceLocal(name);
        
        // Mostrar sucesso
        showSuccess();
        resetForm();
        
    } catch (error) {
        console.error('Erro ao registrar presença:', error);
        showError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
        // Reabilitar botão e esconder loading
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// ==========================================
// Funções de API
// ==========================================

/**
 * Normaliza o nome para comparação (remove espaços extras e converte para minúsculo)
 * @param {string} name - Nome a ser normalizado
 * @returns {string} - Nome normalizado
 */
function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Verifica se o aluno já registrou presença hoje (validação local usando localStorage)
 * @param {string} name - Nome do aluno
 * @returns {boolean} - true se já registrou, false caso contrário
 */
function checkAttendanceLocal(name) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const normalizedName = normalizeName(name);
        
        // Buscar check-ins do dia do localStorage
        const storageKey = 'attendance_' + today;
        const todayAttendance = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Verificar se o nome normalizado já existe
        return todayAttendance.some(recordName => normalizeName(recordName) === normalizedName);
        
    } catch (error) {
        console.error('Erro ao verificar presença local:', error);
        // Em caso de erro, permite o registro (fail-safe)
        return false;
    }
}

/**
 * Salva o check-in no localStorage
 * @param {string} name - Nome do aluno
 */
function saveAttendanceLocal(name) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = 'attendance_' + today;
        const todayAttendance = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Adicionar o nome à lista
        todayAttendance.push(name);
        localStorage.setItem(storageKey, JSON.stringify(todayAttendance));
        
    } catch (error) {
        console.error('Erro ao salvar presença local:', error);
    }
}

/**
 * Verifica se o aluno já registrou presença hoje (método original - não usado)
 * @param {string} name - Nome do aluno
 * @returns {Promise<boolean>} - true se já registrou, false caso contrário
 */
async function checkAttendance(name) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const normalizedName = normalizeName(name);
        
        const response = await fetch(`${APPS_SCRIPT_URL}?action=checkAttendance&name=${encodeURIComponent(normalizedName)}&date=${today}`, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        // Com no-cors, não podemos ler a resposta
        // Em caso de erro de rede, permite o registro (fail-safe)
        return false;
        
    } catch (error) {
        console.error('Erro ao verificar presença:', error);
        // Em caso de erro, permite o registro (fail-safe)
        return false;
    }
}

/**
 * Registra a presença do aluno
 * @param {string} name - Nome do aluno
 * @param {string} classType - Tipo de turma
 */
async function registerAttendance(name, classType) {
    try {
        const now = new Date();
        const data = {
            action: 'registerAttendance',
            name: name,
            classType: classType,
            timestamp: now.toISOString(),
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            dayOfWeek: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
            month: now.toLocaleDateString('pt-BR', { month: 'long' }),
            year: now.getFullYear()
        };
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // Com no-cors, não podemos verificar response.ok ou ler o JSON
        // Assumimos sucesso se não houver erro de rede
        return true;
        
    } catch (error) {
        console.error('Erro ao registrar presença:', error);
        throw error;
    }
}

// ==========================================
// Funções de UI
// ==========================================

/**
 * Mostra toast de sucesso
 */
function showSuccess() {
    successToast.show();
}

/**
 * Mostra toast de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    errorMessage.textContent = message;
    errorToast.show();
}

/**
 * Mostra toast de aviso (já registrado)
 */
function showWarning() {
    warningToast.show();
}

/**
 * Reseta o formulário
 */
function resetForm() {
    attendanceForm.reset();
}

// ==========================================
// Funções de QR Code
// ==========================================

/**
 * Gera o QR Code
 */
function generateQRCode() {
    const url = qrUrlInput.value.trim();
    
    if (!url) {
        alert('Por favor, insira uma URL válida.');
        return;
    }
    
    // Limpar container anterior
    qrCodeContainer.innerHTML = '';
    
    // Verificar se a biblioteca QRCode está carregada
    if (typeof QRCode === 'undefined') {
        console.error('Biblioteca QRCode não carregada');
        alert('Erro ao carregar biblioteca QRCode. Verifique sua conexão.');
        return;
    }
    
    // Criar elemento para o QR Code
    const qrElement = document.createElement('div');
    qrCodeContainer.appendChild(qrElement);
    
    // Gerar QR Code usando a biblioteca qrcodejs
    try {
        new QRCode(qrElement, {
            text: url,
            width: 300,
            height: 300,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Obter o canvas ou img gerado
        qrCodeCanvas = qrElement.querySelector('canvas');
        if (!qrCodeCanvas) {
            qrCodeCanvas = qrElement.querySelector('img');
        }
        
        downloadQrBtn.style.display = 'inline-block';
        
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        alert('Erro ao gerar QR Code: ' + error.message);
    }
}

/**
 * Download do QR Code como PNG
 */
function downloadQRCode() {
    if (!qrCodeCanvas) {
        alert('Gere o QR Code primeiro.');
        return;
    }
    
    // Verificar se é canvas ou img
    if (qrCodeCanvas.tagName === 'CANVAS') {
        // Se for canvas, converter para data URL
        const link = document.createElement('a');
        link.download = 'qrcode-presenca.png';
        link.href = qrCodeCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (qrCodeCanvas.tagName === 'IMG') {
        // Se for img, baixar diretamente
        const link = document.createElement('a');
        link.download = 'qrcode-presenca.png';
        link.href = qrCodeCanvas.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Erro ao identificar tipo de QR Code');
    }
}

// ==========================================
// Funções Utilitárias
// ==========================================

/**
 * Formata data para exibição
 * @param {Date} date - Data a formatar
 * @returns {string} - Data formatada
 */
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formata hora para exibição
 * @param {Date} date - Data a formatar
 * @returns {string} - Hora formatada
 */
function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
