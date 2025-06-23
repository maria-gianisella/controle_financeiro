const usernameSpan = document.querySelector("#username");
const usernameForm = document.querySelector("#username-form");
const firstAccessContainer = document.querySelector("#first-access-container");
const usernameInput = document.querySelector("#username-input");
const mainContent = document.querySelector("#main-content");
const transactionForm = document.querySelector("#transaction-form");
const incomeList = document.querySelector("#income-list");
const expenseList = document.querySelector("#expense-list");
const balanceSpan = document.querySelector("#balance");
const chartsPeriod = document.querySelector("#charts-period");
const chartsCustomDate = document.querySelector("#charts-custom-date");
const statisticPeriod = document.querySelector("#statistic-period");
const statisticCustomDate = document.querySelector("#statistic-custom-date");
const exportButton = document.querySelector("#export-button");
const clearButton = document.querySelector("#clear-data-button");
const menu = document.querySelector(".menu");
const footer = document.querySelector("footer");

let username = localStorage.getItem("username");
let balance = 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

if (username) {
    usernameSpan.textContent = username;
    firstAccessContainer.style.display = "none";
    mainContent.style.display = "block";
    menu.style.display = "block";
    footer.style.position = "static";
    if (window.incomeChart) window.incomeChart.resize();
    if (window.expenseChart) window.expenseChart.resize();
    if (window.lineChart) window.lineChart.resize();
}
else {
    mainContent.style.display = "none";
    menu.style.display = "none";
    footer.style.position = "fixed";
}

usernameForm.addEventListener("submit", function (event) {
    event.preventDefault();
    username = usernameInput.value.trim();
    if (username) {
        localStorage.setItem("username", username);
        usernameSpan.textContent = username;
        firstAccessContainer.style.display = "none";
        mainContent.style.display = "block";
        menu.style.display = "block";
        footer.style.position = "static";
        if (window.incomeChart) window.incomeChart.resize();
        if (window.expenseChart) window.expenseChart.resize();
        if (window.lineChart) window.lineChart.resize();
    }
    else {
        mainContent.style.display = "none";
        menu.style.display = "none";
        footer.style.position = "fixed";
    }
});

const transactionDateInput = document.getElementById("transaction-date");
if (transactionDateInput) {
    const today = new Date().toISOString().split("T")[0];
    transactionDateInput.value = today;
}

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const transactionType = document.getElementById("transaction-type").value;
    const transactionDescription = document.getElementById("transaction-description").value.trim();
    const transactionAmount = parseFloat(document.getElementById("transaction-amount").value.trim());
    const transactionDate = document.getElementById("transaction-date").value;

    if (transactionDescription && !isNaN(transactionAmount) && transactionDate) {
        const transaction = {
            type: transactionType,
            description: transactionDescription,
            amount: transactionAmount,
            date: transactionDate
        };
        if (transactionType === "expense") {
            transaction.amount = -Math.abs(transactionAmount);
        }
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        transactionForm.reset();
        const today = new Date().toISOString().split("T")[0];
        transactionDateInput.value = today;
        updateTransactionList();
        calculateBalance();
    }

    else {
        alert("Por favor, preencha todos os campos corretamente.");
    }
}
);

function calculateBalance() {
    balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    balanceSpan.textContent = formatAmount(balance);
}

function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function formatAmount(amount) {
    const [integerPart, decimalPart] = Math.abs(amount).toFixed(2).split(".");
    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

function updateTransactionList() {
    incomeList.innerHTML = "";
    expenseList.innerHTML = "";

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactions.forEach((transaction, index) => {
        const listItem = document.createElement("li");
        const formattedDate = formatDate(transaction.date);
        const formattedAmount = formatAmount(transaction.amount);
        listItem.innerHTML = `${transaction.description} - ${formattedAmount}<br>${formattedDate}`;
        listItem.style.marginRight = "30px";

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-button";
        removeBtn.textContent = "Remover";
        removeBtn.style.marginLeft = "10px";
        removeBtn.addEventListener("click", function () {
            if (confirm("Você tem certeza que deseja remover esta transação?")) {
                transactions.splice(index, 1);
                localStorage.setItem("transactions", JSON.stringify(transactions));
                updateTransactionList();
                calculateBalance();
            }
        });

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "edit-button";
        editBtn.style.marginLeft = "5px";
        editBtn.addEventListener("click", function () {
            const newType = prompt(
                "Editar tipo (income para Entrada, expense para Saída):",
                transaction.type === "income" ? "income" : "expense"
            );
            const newDescription = prompt("Editar descrição:", transaction.description);
            const newAmount = parseFloat(prompt("Editar valor:", Math.abs(transaction.amount)));
            let newDate = prompt("Editar data (DD/MM/AAAA):", formatDate(transaction.date));
            if (newDate) {
                const [day, month, year] = newDate.split("/");
                if (day && month && year) {
                    newDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                } else {
                    newDate = null;
                }
            }

            if (
                (newType === "income" || newType === "expense") &&
                newDescription &&
                !isNaN(newAmount) &&
                newDate
            ) {
                transaction.type = newType;
                transaction.description = newDescription;
                transaction.amount = newType === "expense" ? -Math.abs(newAmount) : Math.abs(newAmount);
                transaction.date = newDate;
                localStorage.setItem("transactions", JSON.stringify(transactions));
                updateTransactionList();
                calculateBalance();
                updateCharts();
                updateStatistics();
            } else {
                alert("Por favor, preencha todos os campos corretamente.");
            }
        });


        listItem.appendChild(removeBtn);
        listItem.appendChild(editBtn);

        if (transaction.type === "income") {
            incomeList.appendChild(listItem);
        } else {
            expenseList.appendChild(listItem);
        }
    });
}

updateTransactionList();
calculateBalance();

const chartsContainer = document.getElementById("charts-container");

chartsContainer.innerHTML = `
    <canvas id="incomeChart" height="175"></canvas>
    <canvas id="expenseChart" height="175"></canvas>
    <canvas id="lineChart" height="200"></canvas>
`;

function groupByDescription(transactions, type) {
    const grouped = {};
    transactions.filter(t => t.type === type).forEach(t => {
        if (!grouped[t.description]) grouped[t.description] = 0;
        grouped[t.description] += Math.abs(t.amount);
    });
    return grouped;
}

function getPeriodDates() {
    const today = new Date();
    let result = [];

    if (chartsPeriod.value === "custom" && chartsCustomDate.value) {
        let startDate = new Date(chartsCustomDate.value);
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    } else if (chartsPeriod.value === "all") {
        if (transactions.length === 0) return [];
        const dates = transactions.map(t => t.date).sort();
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    } else {
        let days = parseInt(chartsPeriod.value, 10);
        let startDate = new Date(today);
        startDate.setDate(today.getDate() - (days - 1));
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    }
    return result;
}

function updateCharts() {
    if (window.incomeChart && typeof window.incomeChart.destroy === "function") window.incomeChart.destroy();
    if (window.expenseChart && typeof window.expenseChart.destroy === "function") window.expenseChart.destroy();
    if (window.lineChart && typeof window.lineChart.destroy === "function") window.lineChart.destroy();

    const periodDays = getPeriodDates();

    function groupByDescriptionLast30(transactions, type) {
        const grouped = {};
        transactions
            .filter(t => t.type === type && periodDays.includes(t.date))
            .forEach(t => {
                if (!grouped[t.description]) grouped[t.description] = 0;
                grouped[t.description] += Math.abs(t.amount);
            });
        return grouped;
    }
    const incomeGrouped30 = groupByDescriptionLast30(transactions, "income");
    const expenseGrouped30 = groupByDescriptionLast30(transactions, "expense");

    const allLabels30 = Array.from(new Set([
        ...Object.keys(incomeGrouped30),
        ...Object.keys(expenseGrouped30)
    ])).filter(label => (incomeGrouped30[label] || 0) > 0 || (expenseGrouped30[label] || 0) > 0);
    const incomeData30 = allLabels30.map(label => incomeGrouped30[label] || 0);
    const expenseData30 = allLabels30.map(label => expenseGrouped30[label] || 0);

    const filteredIncome = allLabels30
        .map((label, i) => ({ label, value: incomeData30[i] }))
        .filter(item => item.value > 0);
    const filteredExpense = allLabels30
        .map((label, i) => ({ label, value: expenseData30[i] }))
        .filter(item => item.value > 0);

    const maxIncome = Math.max(...filteredIncome.map(item => item.value), 0);
    const maxExpense = Math.max(...filteredExpense.map(item => item.value), 0);
    const maxY = Math.max(maxIncome, maxExpense)

    window.incomeChart = new Chart(document.getElementById("incomeChart"), {
        type: "bar",
        data: {
            labels: filteredIncome.map(item => item.label),
            datasets: [{
                label: "Entradas",
                data: filteredIncome.map(item => item.value),
                backgroundColor: "#4caf50"
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Entradas"
                }
            },
            scales: {
                x: { title: { display: true, text: "Descrição" } },
                y: { title: { display: true, text: "Valor (R$)" }, beginAtZero: true, max: maxY }
            }
        }
    });

    window.expenseChart = new Chart(document.getElementById("expenseChart"), {
        type: "bar",
        data: {
            labels: filteredExpense.map(item => item.label),
            datasets: [{
                label: "Saídas",
                data: filteredExpense.map(item => item.value),
                backgroundColor: "#f44336"
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Saídas"
                }
            },
            scales: {
                x: { title: { display: true, text: "Descrição" } },
                y: { title: { display: true, text: "Valor (R$)" }, beginAtZero: true, max: maxY }
            }
        }
    });


    const lineLabels = periodDays.map(date => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    });

    const incomeByDay = periodDays.map(date =>
        transactions
            .filter(t => t.type === "income" && t.date === date)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    );
    const expenseByDay = periodDays.map(date =>
        transactions
            .filter(t => t.type === "expense" && t.date === date)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    );

    window.lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: lineLabels,
            datasets: [
                {
                    label: "Entradas",
                    data: incomeByDay,
                    borderColor: "#4caf50",
                    backgroundColor: "rgba(76,175,80,0.1)",
                    fill: false,
                    tension: 0.3
                },
                {
                    label: "Saídas",
                    data: expenseByDay,
                    borderColor: "#f44336",
                    backgroundColor: "rgba(244,67,54,0.1)",
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Saldo"
                }
            },
            scales: {
                x: { title: { display: true, text: "Data" } },
                y: { title: { display: true, text: "Valor (R$)" }, beginAtZero: true, max: Math.max(...incomeByDay, ...expenseByDay) }
            }
        }
    });
}

function getStatisticsPeriodDates() {
    const today = new Date();
    let result = [];

    if (statisticPeriod.value === "custom" && statisticCustomDate.value) {
        let startDate = new Date(statisticCustomDate.value);
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    } else if (statisticPeriod.value === "all") {
        if (transactions.length === 0) return [];
        const dates = transactions.map(t => t.date).sort();
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    } else {
        let days = parseInt(statisticPeriod.value, 10);
        let startDate = new Date(today);
        startDate.setDate(today.getDate() - (days - 1));
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split("T")[0]);
        }
    }
    return result;
}

function updateStatistics() {

    const periodDays = getStatisticsPeriodDates();
    if (!periodDays.length) {
        document.getElementById("total-income").textContent = "R$ 0,00";
        document.getElementById("total-expense").textContent = "R$ 0,00";
        document.getElementById("final-balance").textContent = "R$ 0,00";
        return;
    }

    const filteredTransactions = transactions.filter(t => periodDays.includes(t.date));

    const totalIncome = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpense = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalBalance = totalIncome - totalExpense;

    document.getElementById("total-income").textContent = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById("total-expense").textContent = `R$ ${totalExpense.toFixed(2)}`;
    document.getElementById("final-balance").textContent = `R$ ${totalBalance.toFixed(2)}`;
}

const originalUpdateTransactionList = updateTransactionList;
updateTransactionList = function () {
    originalUpdateTransactionList();
    updateCharts();
    updateStatistics();
    calculateBalance();
};
updateCharts();


chartsPeriod.addEventListener("change", function () {
    chartsCustomDate.style.display = chartsPeriod.value === "custom" ? "inline-block" : "none";
    updateCharts();
});
chartsCustomDate.addEventListener("change", function () {
    updateCharts();
});

statisticPeriod.addEventListener("change", function () {
    statisticCustomDate.style.display = statisticPeriod.value === "custom" ? "inline-block" : "none";
    updateStatistics();
});
statisticCustomDate.addEventListener("change", updateStatistics);

updateStatistics();

exportButton.addEventListener("click", function () {
    const csvContent = "data:text/csv;charset=utf-8," + transactions.map(t => {
        return `${t.date},${t.type},${t.description},${Math.abs(t.amount).toFixed(2)}`;
    }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

clearButton.addEventListener("click", function () {
    if (confirm("Você tem certeza que deseja limpar todos os dados?")) {
        localStorage.removeItem("username");
        localStorage.removeItem("transactions");
        username = null;
        usernameSpan.textContent = "";
        usernameForm.style.display = "block";
        mainContent.style.display = "none";
        firstAccessContainer.style.display = "block";
        menu.style.display = "none";                 
        footer.style.position = "fixed";             
        transactions = [];
        balance = 0;
        balanceSpan.textContent = "R$ 0,00";
        incomeList.innerHTML = "";
        expenseList.innerHTML = "";
        updateCharts();
        updateStatistics();
    }
});