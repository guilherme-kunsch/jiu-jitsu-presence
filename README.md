# Sistema de Controle de Presença para Academia de Jiu-Jitsu

Sistema completo e gratuito para controle de presença de alunos, utilizando GitHub Pages e Google Sheets. Sem necessidade de servidor pago ou banco de dados.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do Google Sheets](#configuração-do-google-sheets)
- [Configuração do Google Apps Script](#configuração-do-google-apps-script)
- [Configuração do Projeto](#configuração-do-projeto)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Geração do QR Code](#geração-do-qr-code)
- [Personalização](#personalização)
- [Uso do Sistema](#uso-do-sistema)
- [Painel Administrativo](#painel-administrativo)
- [Solução de Problemas](#solução-de-problemas)
- [Estrutura do Projeto](#estrutura-do-projeto)

## ✨ Características

- ✅ Registro de presença via QR Code
- ✅ Interface moderna e responsiva
- ✅ Tema preto, branco e dourado
- ✅ Validação de duplicidade no mesmo dia
- ✅ Painel administrativo com estatísticas
- ✅ Gráficos interativos (Chart.js)
- ✅ Exportação de dados em CSV
- ✅ Filtros avançados (nome, turma, período)
- ✅ Ranking de alunos
- ✅ 100% gratuito (GitHub Pages + Google Sheets)
- ✅ Sem servidor ou banco de dados

## 🛠 Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Chart.js
- QRCode.js
- Google Apps Script
- Google Sheets
- GitHub Pages

## 📦 Pré-requisitos

- Conta no Google (Gmail)
- Conta no GitHub
- Navegador web moderno
- Conexão com internet

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU-USUARIO/jiu-jitsu-presence.git
cd jiu-jitsu-presence
```

Ou baixe o ZIP e extraia os arquivos.

## 📊 Configuração do Google Sheets

### Passo 1: Criar a Planilha

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em "Em branco" para criar uma nova planilha
3. Dê um nome para a planilha (ex: "Controle de Presença - Jiu-Jitsu")
4. **Não é necessário criar colunas manualmente** - o script fará isso automaticamente

### Passo 2: Obter o ID da Planilha

1. Na URL da planilha, copie o ID que está entre `/d/` e `/edit`
   - Exemplo: `https://docs.google.com/spreadsheets/d/1ABC123XYZ456/edit#gid=0`
   - O ID é: `1ABC123XYZ456`
2. Anote este ID para uso posterior

## 🔧 Configuração do Google Apps Script

### Passo 1: Criar o Apps Script

1. Com a planilha aberta, vá em **Extensões** > **Apps Script**
2. Apague o código padrão que aparece
3. Copie todo o conteúdo do arquivo `google-apps-script.gs` deste projeto
4. Cole no editor do Apps Script
5. Clique no ícone de disquete (💾) para salvar

### Passo 2: Testar o Script

1. No editor do Apps Script, selecione a função `test` no menu suspenso
2. Clique em **Executar**
3. Na primeira execução, o Google pedirá permissão:
   - Clique em **Revisar permissões**
   - Selecione sua conta do Google
   - Clique em **Avançado** > **Acessar Projeto não seguro (não seguro)**
   - Clique em **Permitir**
4. Verifique no log (Execução) se apareceu "Sucesso"

### Passo 3: Publicar como API Web

1. No editor do Apps Script, clique em **Implantar** > **Nova implantação**
2. Selecione o tipo: **API Web**
3. Configure:
   - **Descrição**: "API de Controle de Presença"
   - **Executar como**: "Eu"
   **Quem tem acesso**: "Qualquer pessoa"
4. Clique em **Implantar**
5. **Copie a URL da API Web** que aparece (começa com `https://script.google.com/...`)
6. Esta URL será usada nos arquivos JavaScript

## ⚙️ Configuração do Projeto

### Passo 1: Atualizar a URL da API

1. Abra o arquivo `script.js`
2. Localize a linha:
   ```javascript
   const APPS_SCRIPT_URL = 'SUA_URL_DO_APPS_SCRIPT_AQUI';
   ```
3. Substitua pela URL que você copiou do Apps Script:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';
   ```
4. Salve o arquivo

### Passo 2: Atualizar a URL da API no Admin

1. Abra o arquivo `admin.js`
2. Faça a mesma substituição que fez no `script.js`
3. Salve o arquivo

## 🌐 Publicação no GitHub Pages

### Passo 1: Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no **+** > **New repository**
3. Configure:
   - **Repository name**: `jiu-jitsu-presence`
   - **Description**: "Sistema de Controle de Presença para Academia de Jiu-Jitsu"
   - **Public**: ✅
   - **Add a README file**: ❌ (já temos um)
4. Clique em **Create repository**

### Passo 2: Fazer Upload dos Arquivos

**Opção A: Via Git (Recomendado)**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/jiu-jitsu-presence.git
git push -u origin main
```

**Opção B: Via Interface Web**

1. No repositório criado, clique em **uploading an existing file**
2. Arraste todos os arquivos do projeto para a área de upload
3. Clique em **Commit changes**

### Passo 3: Ativar GitHub Pages

1. No repositório, vá em **Settings** > **Pages**
2. Em **Source**, selecione:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Clique em **Save**
4. Aguarde alguns minutos até que o site seja publicado
5. A URL do seu site será: `https://SEU-USUARIO.github.io/jiu-jitsu-presence`

## 📱 Geração do QR Code

### Passo 1: Acessar o Site

1. Abra o site publicado: `https://SEU-USUARIO.github.io/jiu-jitsu-presence`
2. Clique no botão **"Gerar QR Code"** na parte inferior

### Passo 2: Configurar o QR Code

1. No modal que abrir, verifique se a URL está correta
2. Clique em **"Gerar QR Code"**
3. O QR Code será gerado automaticamente

### Passo 3: Baixar e Imprimir

1. Clique em **"Baixar QR Code"**
2. O QR Code será baixado como PNG
3. Imprima o QR Code em tamanho adequado (recomendado: 10x10cm ou maior)
4. Fixe o QR Code na entrada da academia

## 🎨 Personalização

### Atualizar a Lista de Turmas

1. Abra o arquivo `index.html`
2. Localize o `<select id="classType">`
3. Adicione ou remova opções conforme necessário:
   ```html
   <option value="NovaTurma">Nova Turma</option>
   ```
4. Faça o mesmo no arquivo `admin.html` no filtro de turma
5. Commit e push as alterações

### Personalizar a Logo

1. Crie sua logo no formato PNG ou SVG
2. Coloque o arquivo na pasta `assets/images/`
3. Abra o arquivo `index.html`
4. Localize a seção da logo:
   ```html
   <div class="logo-placeholder">
       <!-- Substitua o SVG pela sua logo -->
   </div>
   ```
5. Substitua o SVG por uma tag `<img>`:
   ```html
   <img src="assets/images/sua-logo.png" alt="Logo da Academia" class="logo-img">
   ```
6. Adicione estilos no `styles.css` se necessário

### Alterar Cores

1. Abra o arquivo `styles.css`
2. Localize as variáveis de cores no início:
   ```css
   :root {
       --color-black: #000000;
       --color-dark-gray: #1a1a1a;
       --color-gold: #D4AF37;
       /* ... */
   }
   ```
3. Altere os valores hexadecimais conforme desejado
4. Salve e commit as alterações

### Alterar Nome da Academia

1. Abra o arquivo `index.html`
2. Localize e altere o título:
   ```html
   <title>Controle de Presença - NOME DA SUA ACADEMIA</title>
   ```
3. Altere o texto do título principal:
   ```html
   <h1 class="main-title">CONTROLE DE PRESENÇA</h1>
   ```
4. Faça o mesmo no `admin.html`

## 📖 Uso do Sistema

### Para os Alunos

1. Ao chegar na academia, escaneie o QR Code com o celular
2. Será redirecionado para a página de check-in
3. Digite seu nome completo
4. Selecione sua turma
5. Clique em **"Registrar Presença"**
6. Aguarde a confirmação de sucesso

### Regras de Validação

- ❌ Nome não pode estar vazio
- ❌ Turma não pode estar vazia
- ❌ Não é permitido registrar presença duas vezes no mesmo dia
- ✅ Se já registrou hoje, aparecerá um aviso

## 📊 Painel Administrativo

### Acessar o Painel

1. Acesse: `https://SEU-USUARIO.github.io/jiu-jitsu-presence/admin.html`
2. O painel carregará automaticamente os dados da planilha

### Funcionalidades

#### Estatísticas em Tempo Real
- **Presenças Hoje**: Total de registros do dia atual
- **Presenças no Mês**: Total de registros do mês atual
- **Alunos Diferentes**: Quantidade de alunos únicos
- **Último Registro**: Horário do último check-in

#### Filtros
- **Pesquisar por Nome**: Digite o nome para filtrar
- **Filtrar por Turma**: Selecione uma turma específica
- **Período**: Defina data inicial e final
- **Aplicar/Limpar Filtros**: Controle os filtros

#### Tabela de Registros
- Visualize todos os registros
- Ordenados por data/hora (mais recente primeiro)
- Exporte para CSV com um clique

#### Gráficos Interativos
- **Presenças por Dia**: Evolução diária
- **Presenças por Turma**: Distribuição por turma
- **Ranking de Alunos**: Top 10 alunos mais frequentes
- **Aulas por Mês**: Histórico mensal

### Exportar Dados

1. Aplique os filtros desejados (ou deixe tudo sem filtro)
2. Clique em **"Exportar CSV"**
3. O arquivo será baixado automaticamente
4. Abra no Excel, Google Sheets ou qualquer editor de CSV

## 🔧 Solução de Problemas

### Erro: "Erro ao conectar com o servidor"

**Causa**: URL da API incorreta ou Apps Script não publicado

**Solução**:
1. Verifique se a URL no `script.js` e `admin.js` está correta
2. Verifique se o Apps Script foi publicado como "API Web"
3. Verifique se o acesso está configurado como "Qualquer pessoa"
4. Tente republicar o Apps Script

### Erro: "Você já registrou sua presença hoje" (mas não registrou)

**Causa**: Comparação de nomes case-insensitive

**Solução**:
1. Verifique se não há variações do seu nome na planilha
2. Use sempre o mesmo nome completo
3. Se necessário, edite a planilha manualmente para corrigir

### Gráficos não aparecem

**Causa**: Chart.js não carregou ou não há dados

**Solução**:
1. Verifique a conexão com internet
2. Verifique o console do navegador (F12) para erros
3. Certifique-se de que há registros na planilha
4. Tente atualizar a página

### QR Code não gera

**Causa**: URL inválida ou biblioteca não carregou

**Solução**:
1. Verifique se a URL está completa (começa com http:// ou https://)
2. Verifique a conexão com internet
3. Verifique o console do navegador para erros

### CORS Error no Console

**Causa**: Apps Script não configurado corretamente

**Solução**:
1. Verifique se o Apps Script está publicado como "API Web"
2. Verifique se "Quem tem acesso" está como "Qualquer pessoa"
3. Tente republicar o Apps Script
4. Limpe o cache do navegador

### Presença não aparece na planilha

**Causa**: Script não está conectado à planilha correta

**Solução**:
1. Abra o Apps Script pela planilha (Extensões > Apps Script)
2. Verifique se a planilha ativa é a correta
3. Execute a função `test` novamente
4. Verifique se os dados aparecem na planilha

## 📁 Estrutura do Projeto

```
jiu-jitsu-presence/
├── index.html              # Página principal de check-in
├── admin.html              # Painel administrativo
├── styles.css              # Estilos globais
├── script.js               # Lógica da página principal
├── admin.js                # Lógica do painel administrativo
├── google-apps-script.gs   # Código do Google Apps Script
├── README.md               # Documentação
└── assets/
    ├── images/             # Imagens (logo, etc.)
    └── icons/               # Ícones
```

## 🔒 Segurança

### Boas Práticas

- Não compartilhe a URL do Apps Script publicamente
- Não exponha dados sensíveis dos alunos
- Use HTTPS sempre que possível
- Mantenha o repositório público apenas se não houver dados sensíveis

### Limitações

- Este sistema não possui autenticação nativa
- Qualquer pessoa com acesso à URL pode registrar presença
- Para proteção adicional, considere adicionar senha simples

## 📝 Licença

Este projeto é gratuito e open-source. Sinta-se livre para usar, modificar e distribuir.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📞 Suporte

Se encontrar problemas:
1. Verifique a seção de solução de problemas
2. Revise a configuração do Apps Script
3. Verifique o console do navegador para erros
4. Abra uma issue no repositório

## 🎯 Próximas Melhorias (Sugestões)

- [ ] Autenticação simples para admin
- [ ] Envio de notificações por e-mail
- [ ] Integração com WhatsApp
- [ ] Histórico de pagamentos
- [ ] Sistema de avaliação física
- [ ] App mobile (PWA)

---

**Desenvolvido com ❤️ para a comunidade de Jiu-Jitsu**
