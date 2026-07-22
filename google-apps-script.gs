// ==========================================
// SISTEMA DE CONTROLE DE PRESENÇA
// Academia de Jiu-Jitsu
// Google Apps Script
// ==========================================
// 
// Este script deve ser publicado como API Web
// para que o site do GitHub Pages possa se comunicar
// com a planilha do Google Sheets.
//
// ==========================================

// Nome da planilha (certifique-se de que a planilha existe)
const SHEET_NAME = 'Presenças';

// ==========================================
// Função Principal - doGet
// ==========================================
// 
// Manipula requisições GET
// Usado para verificar se o aluno já registrou presença
// e para buscar todos os registros
//
// ==========================================

function doGet(e) {
    // Configurar CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    try {
        const action = e.parameter.action;
        
        // Verificar qual ação foi solicitada
        if (action === 'checkAttendance') {
            return checkAttendance(e.parameter);
        } else if (action === 'getAllAttendance') {
            return getAllAttendance();
        } else {
            return createResponse({ success: false, message: 'Ação não reconhecida' });
        }
        
    } catch (error) {
        console.error('Erro no doGet:', error);
        return createResponse({ success: false, message: error.toString() });
    }
}

// ==========================================
// Função Principal - doPost
// ==========================================
// 
// Manipula requisições POST
// Usado para registrar nova presença
//
// ==========================================

function doPost(e) {
    // Configurar CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    try {
        // Parsear o corpo da requisição
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        
        // Verificar qual ação foi solicitada
        if (action === 'registerAttendance') {
            return registerAttendance(data);
        } else {
            return createResponse({ success: false, message: 'Ação não reconhecida' });
        }
        
    } catch (error) {
        console.error('Erro no doPost:', error);
        return createResponse({ success: false, message: error.toString() });
    }
}

// ==========================================
// Função: Verificar Presença
// ==========================================
// 
// Verifica se um aluno já registrou presença em uma data específica
//
// Parâmetros:
// - name: Nome do aluno
// - date: Data no formato YYYY-MM-DD
//
// Retorna: JSON com { exists: boolean }
//
// ==========================================

function checkAttendance(params) {
    try {
        const name = params.name;
        const date = params.date;
        
        if (!name || !date) {
            return createResponse({ success: false, message: 'Parâmetros inválidos' });
        }
        
        // Obter a planilha
        const sheet = getSheet();
        
        // Obter todos os dados
        const data = sheet.getDataRange().getValues();
        
        // Pular cabeçalho (linha 1)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const rowName = row[2]; // Coluna Nome (índice 2)
            const rowDate = row[0]; // Coluna Data (índice 0)
            
            // Comparar nome (case insensitive) e data
            if (rowName && rowName.toString().toLowerCase() === name.toLowerCase() && 
                rowDate && rowDate.toString() === date) {
                return createResponse({ success: true, exists: true });
            }
        }
        
        return createResponse({ success: true, exists: false });
        
    } catch (error) {
        console.error('Erro ao verificar presença:', error);
        return createResponse({ success: false, message: error.toString() });
    }
}

// ==========================================
// Função: Registrar Presença
// ==========================================
// 
// Registra uma nova presença na planilha
//
// Parâmetros (data object):
// - name: Nome do aluno
// - classType: Tipo de turma
// - timestamp: Timestamp completo
// - date: Data no formato YYYY-MM-DD
// - time: Hora no formato HH:MM:SS
// - dayOfWeek: Dia da semana
// - month: Mês
// - year: Ano
//
// Retorna: JSON com { success: boolean }
//
// ==========================================

function registerAttendance(data) {
    try {
        const name = data.name;
        const classType = data.classType;
        const timestamp = data.timestamp;
        const date = data.date;
        const time = data.time;
        const dayOfWeek = data.dayOfWeek;
        const month = data.month;
        const year = data.year;
        
        // Validar campos obrigatórios
        if (!name || !classType) {
            return createResponse({ success: false, message: 'Campos obrigatórios faltando' });
        }
        
        // Obter a planilha
        const sheet = getSheet();
        
        // Adicionar nova linha
        sheet.appendRow([
            date,           // Coluna A: Data
            time,           // Coluna B: Hora
            name,           // Coluna C: Nome
            classType,      // Coluna D: Turma
            dayOfWeek,      // Coluna E: Dia da Semana
            month,          // Coluna F: Mês
            year,           // Coluna G: Ano
            timestamp       // Coluna H: Timestamp
        ]);
        
        return createResponse({ success: true, message: 'Presença registrada com sucesso' });
        
    } catch (error) {
        console.error('Erro ao registrar presença:', error);
        return createResponse({ success: false, message: error.toString() });
    }
}

// ==========================================
// Função: Buscar Todas as Presenças
// ==========================================
// 
// Retorna todos os registros de presença da planilha
//
// Retorna: JSON com { success: boolean, data: array }
//
// ==========================================

function getAllAttendance() {
    try {
        // Obter a planilha
        const sheet = getSheet();
        
        // Obter todos os dados
        const data = sheet.getDataRange().getValues();
        
        // Converter para array de objetos (pular cabeçalho)
        const attendanceData = [];
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            
            // Verificar se a linha tem dados
            if (row[0]) { // Se tem data
                attendanceData.push({
                    date: row[0],           // Data
                    time: row[1],           // Hora
                    name: row[2],           // Nome
                    classType: row[3],      // Turma
                    dayOfWeek: row[4],      // Dia da Semana
                    month: row[5],          // Mês
                    year: row[6],           // Ano
                    timestamp: row[7]       // Timestamp
                });
            }
        }
        
        return createResponse({ success: true, data: attendanceData });
        
    } catch (error) {
        console.error('Erro ao buscar presenças:', error);
        return createResponse({ success: false, message: error.toString() });
    }
}

// ==========================================
// Função: Obter Planilha
// ==========================================
// 
// Obtém a planilha ativa ou cria uma nova se não existir
//
// Retorna: Sheet object
//
// ==========================================

function getSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Se a planilha não existir, criar
    if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
        
        // Adicionar cabeçalhos
        sheet.appendRow([
            'Data',
            'Hora',
            'Nome',
            'Turma',
            'Dia da Semana',
            'Mês',
            'Ano',
            'Timestamp'
        ]);
        
        // Formatar cabeçalho
        const headerRange = sheet.getRange(1, 1, 1, 8);
        headerRange.setBackground('#D4AF37');
        headerRange.setFontColor('#000000');
        headerRange.setFontWeight('bold');
        
        // Congelar primeira linha
        sheet.setFrozenRows(1);
        
        // Ajustar largura das colunas
        sheet.setColumnWidth(1, 120); // Data
        sheet.setColumnWidth(2, 100); // Hora
        sheet.setColumnWidth(3, 250); // Nome
        sheet.setColumnWidth(4, 150); // Turma
        sheet.setColumnWidth(5, 150); // Dia da Semana
        sheet.setColumnWidth(6, 100); // Mês
        sheet.setColumnWidth(7, 80);  // Ano
        sheet.setColumnWidth(8, 200); // Timestamp
    }
    
    return sheet;
}

// ==========================================
// Função: Criar Resposta JSON
// ==========================================
// 
// Cria uma resposta JSON formatada com CORS
//
// Parâmetros:
// - data: Objeto a ser convertido em JSON
//
// Retorna: ContentService.TextOutput
//
// ==========================================

function createResponse(data) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

// ==========================================
// Função: Configurar CORS (Opcional)
// ==========================================
// 
// Esta função pode ser usada para configurar CORS
// se necessário. O Google Apps Script geralmente
// lida com CORS automaticamente para requisições
// simples.
//
// ==========================================

function setupCORS() {
    // O Google Apps Script não requer configuração explícita de CORS
    // para requisições simples. Se encontrar problemas de CORS,
    // verifique se a URL do script está correta e se foi publicada
    // como "API Web" com acesso "Qualquer pessoa".
}

// ==========================================
// Função: Teste
// ==========================================
// 
// Função para testar o script
// Execute esta função no editor do Apps Script
// para verificar se tudo está funcionando
//
// ==========================================

function test() {
    // Testar registro de presença
    const testData = {
        action: 'registerAttendance',
        name: 'Teste Aluno',
        classType: 'Adulto',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR'),
        dayOfWeek: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
        month: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        year: new Date().getFullYear()
    };
    
    const result = registerAttendance(testData);
    Logger.log(result.getContent());
    
    // Testar busca de todas as presenças
    const allData = getAllAttendance();
    Logger.log(allData.getContent());
}
