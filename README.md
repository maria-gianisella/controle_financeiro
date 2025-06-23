# Controle Financeiro

Sistema web para controle financeiro pessoal, desenvolvido como trabalho para a disciplina de Desenvolvimento Web - Cliente.

## Funcionalidades

- Cadastro do nome do usuário no primeiro acesso
- Visualização do saldo atual
- Adição, edição e remoção de transações (entradas e saídas)
- Visualização de transações separadas por entradas e saídas
- Gráficos interativos de entradas, saídas e saldo
- Estatísticas de entradas, saídas e saldo final por período
- Exportação dos dados para CSV
- Limpeza de todos os dados salvos
- Interface responsiva para desktop, tablets e celulares

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- [Chart.js](https://www.chartjs.org/) para gráficos

## Como Usar

1. **Clone ou baixe este repositório.**
2. **Abra o arquivo `index.html` em seu navegador.**
3. **No primeiro acesso, digite seu nome para começar.**
4. **Adicione suas transações.**
5. **Visualize gráficos e estatísticas de acordo com o período selecionado.**
6. **Exporte seus dados para CSV ou limpe tudo quando desejar.**

## Estrutura das Seções

- **Início:** Saudação personalizada ao usuário.
- **Saldo:** Mostra o saldo atual calculado.
- **Transações:** Lista de entradas e saídas, com formulário para adicionar novas transações.
- **Gráficos:** Visualização gráfica dos dados financeiros.
- **Estatísticas:** Totais de entradas, saídas e saldo final por período.
- **Exportar:** Botão para exportar os dados em formato CSV.
- **Limpar:** Botão para apagar todos os dados salvos.
- **Sobre:** Informações sobre o sistema e autoria.

## Observações

- Todos os dados são salvos localmente no navegador (localStorage).
- O sistema é totalmente client-side, não requer backend.
- Para visualizar os gráficos, é necessário acesso à internet para carregar o Chart.js via CDN.
