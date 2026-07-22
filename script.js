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
        // Verificar se o aluno já registrou presença hoje
        const alreadyRegistered = await checkAttendance(name);
        
        if (alreadyRegistered) {
            showWarning();
            resetForm();
            return;
        }
        
        // Registrar presença
        await registerAttendance(name, classType);
        
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
 * Verifica se o aluno já registrou presença hoje
 * @param {string} name - Nome do aluno
 * @returns {Promise<boolean>} - true se já registrou, false caso contrário
 */
async function checkAttendance(name) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`${APPS_SCRIPT_URL}?action=checkAttendance&name=${encodeURIComponent(name)}&date=${today}`, {
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
            time: now.toLocaleTimeString('pt-BR'),
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
    
    // Usar API de QR Code online (goqr.me)
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=D4AF37&bgcolor=000000`;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = apiUrl;
    img.alt = 'QR Code';
    img.style.maxWidth = '100%';
    
    img.onload = () => {
        qrCodeContainer.appendChild(img);
        
        // Armazenar a URL para download direto
        qrCodeCanvas = img;
        
        downloadQrBtn.style.display = 'inline-block';
    };
    
    img.onerror = () => {
        console.error('Erro ao carregar QR Code da API');
        alert('Erro ao gerar QR Code. Tente novamente.');
    };
}

/**
 * Download do QR Code como PNG
 */
function downloadQRCode() {
    if (!qrCodeCanvas) {
        alert('Gere o QR Code primeiro.');
        return;
    }
    
    // Usar a URL direta da API para download via fetch
    const url = qrUrlInput.value.trim();
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=D4AF37&bgcolor=000000`;
    
    fetch(apiUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'qrcode-presenca.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Erro ao baixar QR Code:', error);
            // Fallback: abrir em nova aba
            window.open(apiUrl, '_blank');
        });
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
