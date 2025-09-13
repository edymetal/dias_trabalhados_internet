document.addEventListener('DOMContentLoaded', async function () {
    // --- Elementos da UI ---
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const weeklySummary = document.getElementById('weekly-summary');
    // --- Elementos do Modal de Calcular Dias ---
    const calculateDaysModalEl = document.getElementById('calculate-days-modal');
    const calculateDaysModal = new bootstrap.Modal(calculateDaysModalEl);
    const paymentDateCalcInput = document.getElementById('payment-date-calc-input');
    const startDateCalcInput = document.getElementById('start-date-calc-input');
    const dailyRateCalcInput = document.getElementById('daily-rate-calc-input');
    const paidAmountCalcInput = document.getElementById('paid-amount-calc-input');
    const calculateDaysBtn = document.getElementById('calculate-days-btn');
    const calculatedDaysResult = document.getElementById('calculated-days-result');

    // --- Elementos do Histórico de Pagamentos ---
    const paymentHistoryBody = document.getElementById('payment-history-body');
    const noPaymentHistoryMessage = document.getElementById('no-payment-history-message');

    calculateDaysModalEl.addEventListener('show.bs.modal', async function () {
        // Preencher Valor do Dia (€) com o Valor Padrão do Dia
        dailyRateCalcInput.value = currentDefaultRate.toFixed(2);

        // Preencher Data de Início (Cálculo) com a primeira data disponível no calendário (primeiro dia do mês atual sem status)
        const firstAvailableDayCell = calendarGrid.querySelector('.calendar-day:not(.day-name):not(.prev-month):not(.status-folga):not(.status-trabalhado):not(.week-total-cell)');

        if (firstAvailableDayCell) {
            const dayNumber = parseInt(firstAvailableDayCell.querySelector('span').textContent);
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();

            const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
            startDateCalcInput.value = formattedDate;
        }
        // Resetar o alerta de resultado
        calculatedDaysResult.textContent = 'Dias Trabalhados Calculados: 0.00 dias';
        calculatedDaysResult.classList.remove('alert-success', 'alert-danger');
        calculatedDaysResult.classList.add('alert-info');
    });
    

    // Elementos de Configuracao
    const defaultDailyRateInput = document.getElementById('default-daily-rate-input');
    const saveDefaultRateBtn = document.getElementById('save-default-rate-btn');
    const defaultRateStatus = document.getElementById('default-rate-status');
    const defaultDayOffSelect = document.getElementById('default-day-off-select'); 
    const saveDefaultDayOffBtn = document.getElementById('save-default-day-off-btn'); 
    const defaultDayOffStatus = document.getElementById('default-day-off-status'); 

    // --- Elementos do Modal de Edicao de Dia ---
    const dayEditModalEl = document.getElementById('day-edit-modal');
    const dayEditModal = new bootstrap.Modal(dayEditModalEl);
    const modalTitle = document.getElementById('modal-title');
    const editDateInput = document.getElementById('edit-date-input');
    const statusSelect = document.getElementById('status-select');
    const shiftSelect = document.getElementById('shift-select');
    const dailyRateInput = document.getElementById('daily-rate-input');
    const trabalhadoFields = document.getElementById('trabalhado-fields');
    const saveDayBtn = document.getElementById('save-day-btn');
    const deleteDayBtn = document.getElementById('delete-day-btn');
const settingsModalEl = document.getElementById('settings-modal');
const settingsModal = new bootstrap.Modal(settingsModalEl);
const saveAllSettingsBtn = document.getElementById('save-all-settings-btn'); 
const manageVacationsBtn = document.getElementById('manage-vacations-btn'); // NOVO: Botão Gerenciar Férias

    // --- Elementos do Modal de Férias ---
    const vacationModalEl = document.getElementById('vacation-modal');
    const vacationModal = new bootstrap.Modal(vacationModalEl);
    const vacationStartDateInput = document.getElementById('vacation-start-date-input');
    const vacationEndDateInput = document.getElementById('vacation-end-date-input');
    const addVacationBtn = document.getElementById('add-vacation-btn');
    const removeVacationBtn = document.getElementById('remove-vacation-btn');

    // --- Elementos do Modal de Resumo Semanal ---
    const weeklySummaryModalEl = document.getElementById('weekly-summary-modal');
    const weeklySummaryModal = new bootstrap.Modal(weeklySummaryModalEl);
    const weeklySummaryModalTitle = document.getElementById('weekly-summary-modal-title');
    const weeklyDaysStatus = document.getElementById('weekly-days-status');
    const paymentDateInput = document.getElementById('payment-date-input');
    const savePaymentBtn = document.getElementById('save-payment-btn');

    // --- Elementos do Modal de Configuracao de Folga Semanal ---
    const weeklyDayOffModalEl = document.getElementById('weekly-day-off-modal');
    const weeklyDayOffModal = new bootstrap.Modal(weeklyDayOffModalEl);
    const dayOffCheckboxesContainer = document.getElementById('day-off-checkboxes');
    const saveWeeklyDayOffBtn = document.getElementById('save-weekly-day-off-btn');
    const selectAllDaysBtn = document.getElementById('select-all-days-btn');
    const deselectAllDaysBtn = document.getElementById('deselect-all-days-btn');

    // --- Elementos do Custom Alert Modal ---
    const customAlertModalEl = document.getElementById('custom-alert-modal');
    const customAlertModal = new bootstrap.Modal(customAlertModalEl);
    const customAlertMessage = document.getElementById('custom-alert-message');

    function showAlert(message) {
        customAlertMessage.textContent = message;
        customAlertModal.show();
        document.body.focus();
    }

    // --- Elementos do Custom Confirm Modal ---
    const customConfirmModalEl = document.getElementById('custom-confirm-modal');
    const customConfirmModal = new bootstrap.Modal(customConfirmModalEl);
    const customConfirmMessage = document.getElementById('custom-confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    let confirmCallback = null; // Para armazenar o callback da confirmação

    function showConfirm(message, callback) {
        customConfirmMessage.textContent = message;
        confirmCallback = callback;
        customConfirmModal.show();
        document.body.focus();
    }

    confirmYesBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(true);
            confirmCallback = null; // Limpa o callback
        }
    });

    confirmNoBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(false);
            confirmCallback = null; // Limpa o callback
        }
    });

    let currentDate = new Date();
    let currentDefaultRate = 0;
    let currentDefaultDayOff = -1; // -1 significa nenhum dia de folga padrao
    let currentConfiguredDaysOff = []; // NOVO: Armazena os dias de folga configurados semanalmente
    let initialConfiguredDaysOff = []; // Para armazenar o estado inicial dos dias configurados
    let currentWeekStartDate = null; // Para armazenar a data de início da semana atual do modal
    let logsMap = new Map(); // NOVO: Para armazenar o mapa de logs globalmente

    // --- Funcoes de Carregamento e Salvamento de Configuracoes ---
    async function loadDefaultRate() {
        const response = await fetch('/api/settings/default_rate');
        const data = await response.json();
        if (data.value) {
            defaultDailyRateInput.value = parseFloat(data.value).toFixed(2);
            currentDefaultRate = parseFloat(data.value);
        } else {
            defaultDailyRateInput.value = '';
            currentDefaultRate = 0;
        }
    }

    async function loadDefaultDayOff() {
        const response = await fetch('/api/settings/default_day_off');
        const data = await response.json();
        if (data.value) {
            defaultDayOffSelect.value = data.value;
            currentDefaultDayOff = parseInt(data.value);
        } else {
            defaultDayOffSelect.value = '-1';
            currentDefaultDayOff = -1;
        }
    }

    

    

    // --- Funcoes do Calendario ---
    async function renderCalendar(date) {
        calendarGrid.innerHTML = '';
        const month = date.getMonth();
        const year = date.getFullYear();

        // 1. Calculate the start and end dates of the displayed calendar view.
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
        const startDay = (firstDayOfMonth.getUTCDay() + 6) % 7;
        const calendarStartDate = new Date(firstDayOfMonth);
        calendarStartDate.setUTCDate(calendarStartDate.getUTCDate() - startDay);

        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const lastDayOfMonth = new Date(Date.UTC(year, month, daysInMonth));
        const dayCounterEnd = startDay + daysInMonth;
        const remainingCells = 7 - (dayCounterEnd % 7);
        const calendarEndDate = new Date(lastDayOfMonth);
        if(remainingCells < 7) {
            calendarEndDate.setUTCDate(calendarEndDate.getUTCDate() + remainingCells);
        }


        // 2. Fetch all logs, history, and vacations for the entire displayed period.
        const [logsResponse, historyResponseRaw, weeklyConfigResponse, vacationsResponse] = await Promise.all([
            fetch(`/api/logs?start_date=${calendarStartDate.toISOString().split('T')[0]}&end_date=${calendarEndDate.toISOString().split('T')[0]}`),
            fetch('/api/settings/default_day_off'),
            fetch(`/api/settings/configured_days_off_weekly_range?start_date=${calendarStartDate.toISOString().split('T')[0]}&end_date=${calendarEndDate.toISOString().split('T')[0]}`),
            fetch('/api/vacations')
        ]);

        logsMap = new Map((await logsResponse.json()).map(log => [log.date, log]));

        const vacations = await vacationsResponse.json();
        vacations.forEach(vacation => {
            let currentVacationDay = new Date(vacation.start_date);
            while (currentVacationDay <= new Date(vacation.end_date)) {
                const isoDate = currentVacationDay.toISOString().split('T')[0];
                if (!logsMap.has(isoDate)) {
                    logsMap.set(isoDate, { date: isoDate, status: 'ferias' });
                }
                currentVacationDay.setDate(currentVacationDay.getDate() + 1);
            }
        });

        const weeklyConfigMap = new Map();
        (await weeklyConfigResponse.json()).forEach(config => {
            weeklyConfigMap.set(config.week_start_date, config.days);
        });

        currentMonthYear.textContent = `${date.toLocaleString('default', { month: 'long' }).toUpperCase()} ${year}`;

        const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('calendar-day', 'day-name');
            dayNameCell.textContent = name;
            calendarGrid.appendChild(dayNameCell);
        });
        const weekTotalHeader = document.createElement('div');
        weekTotalHeader.classList.add('calendar-day', 'day-name', 'week-total-header');
        weekTotalHeader.textContent = 'Total Sem.';
        calendarGrid.appendChild(weekTotalHeader);

        let currentWeekTotal = 0;
        let monthlyTotal = 0;
        let dayIterator = new Date(calendarStartDate);

        while (dayIterator <= calendarEndDate) {
            const currentDay = new Date(dayIterator); // Capture the current date
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            if (currentDay.getMonth() < month || (currentDay.getFullYear() < year && currentDay.getMonth() === 11) ) {
                dayCell.classList.add('prev-month');
            } else if (currentDay.getMonth() > month || (currentDay.getFullYear() > year && currentDay.getMonth() === 0)) {
                dayCell.classList.add('next-month');
            }

            const dayNumber = document.createElement('span');
            dayNumber.textContent = currentDay.getDate();
            dayCell.appendChild(dayNumber);

            const isoDate = currentDay.toISOString().split('T')[0];
            const log = logsMap.get(isoDate);
            const currentDayOfWeek = (currentDay.getUTCDay() + 6) % 7;

            if (log) {
                dayCell.classList.add(`status-${log.status}`);
                const statusIndicator = document.createElement('div');
                statusIndicator.classList.add('status-indicator');
                statusIndicator.textContent = log.status === 'trabalhado' ? `€${log.daily_rate.toFixed(2)}` : (log.status === 'ferias' ? 'Férias' : log.status.replace('_', ' '));
                dayCell.appendChild(statusIndicator);

                if (log.status === 'trabalhado' && log.daily_rate) {
                    currentWeekTotal += log.daily_rate;
                    if (currentDay.getMonth() === month) {
                        monthlyTotal += log.daily_rate;
                    }
                }
            } else {
                let isDefaultDayOff = false;
                let isWeeklyConfiguredDayOff = false;

                // Check for global default day off
                if (currentDefaultDayOff !== -1 && currentDayOfWeek === currentDefaultDayOff) {
                    isDefaultDayOff = true;
                }

                

                if (isDefaultDayOff) { // Only check for default day off
                    dayCell.classList.add('status-folga');
                    const statusIndicator = document.createElement('div');
                    statusIndicator.classList.add('status-indicator');
                    statusIndicator.textContent = 'Folga';
                    dayCell.appendChild(statusIndicator);
                }
            }

            dayCell.addEventListener('click', () => {
                const clickedDate = new Date(currentDay); // Use the captured date
                const clickedIsoDate = clickedDate.toISOString().split('T')[0];

                modalTitle.textContent = `Editar Dia - ${clickedDate.getDate()}/${clickedDate.getMonth() + 1}/${clickedDate.getFullYear()}`;
                editDateInput.value = clickedIsoDate;

                const logData = logsMap.get(clickedIsoDate);

                if (logData) {
                    statusSelect.value = logData.status;
                    shiftSelect.value = logData.shift_type || 'manha';
                    dailyRateInput.value = logData.daily_rate || '';
                } else {
                    document.getElementById('day-edit-form').reset();
                    if (currentDefaultRate > 0) {
                        dailyRateInput.value = currentDefaultRate.toFixed(2);
                    } else {
                        let activeDefaultDayOff = -1;
                        for (const setting of history) {
                            const startDate = new Date(setting.startDate.split('-')[0], setting.startDate.split('-')[1] - 1, setting.startDate.split('-')[2]);
                            if (clickedDate >= startDate) {
                                activeDefaultDayOff = setting.day;
                                break;
                            }
                        }
                        if (activeDefaultDayOff !== -1 && clickedDate.getUTCDay() === activeDefaultDayOff) {
                            statusSelect.value = 'folga';
                        }
                    }
                }

                updateWeeklySummary(clickedIsoDate);
                toggleTrabalhadoFields();
                dayEditModal.show();
            });
            calendarGrid.appendChild(dayCell);

            if (currentDayOfWeek === 6) { // Sunday
                const weekTotalCell = document.createElement('div');
                weekTotalCell.classList.add('calendar-day', 'week-total-cell');
                weekTotalCell.textContent = `€${currentWeekTotal.toFixed(2)}`;

                const weekStart = new Date(currentDay);
                weekStart.setUTCDate(weekStart.getUTCDate() - 6);

                weekTotalCell.addEventListener('click', () => {
                    populateWeeklyDayOffModal(weekStart, logsMap);
                    weeklyDayOffModal.show();
                });

                calendarGrid.appendChild(weekTotalCell);
                currentWeekTotal = 0;
            }

            dayIterator.setUTCDate(dayIterator.getUTCDate() + 1);
        }

        // Add the last week's total if it's not a full week
        if (currentWeekTotal > 0) {
            const weekTotalCell = document.createElement('div');
            weekTotalCell.classList.add('calendar-day', 'week-total-cell');
            weekTotalCell.textContent = `€${currentWeekTotal.toFixed(2)}`;

            const weekStart = new Date(dayIterator); // This will be the day after the last day of the calendar
            weekStart.setUTCDate(weekStart.getUTCDate() - (weekStart.getUTCDay() + 6) % 7); // Adjust to Monday of the last week

            weekTotalCell.addEventListener('click', () => {
                populateWeeklyDayOffModal(weekStart, logsMap);
                weeklyDayOffModal.show();
            });

            calendarGrid.appendChild(weekTotalCell);
        }

        const monthTotalElement = document.createElement('div');
        monthTotalElement.classList.add('calendar-day', 'month-total');
        monthTotalElement.style.gridColumn = 'span 8';
        calendarGrid.appendChild(monthTotalElement);

        // NOVO: Renderizar o histórico de pagamentos para o mês atual
        await renderPaymentHistory(year, month + 1); // Ensure this is awaited

        // Calculate and display monthly totals
        const monthlyPaymentsResponse = await fetch(`/api/monthly_payments_history?year=${year}&month=${month + 1}`);
        const monthlyPayments = await monthlyPaymentsResponse.json();

        let monthlyTotalValue = 0;
        let monthlyTotalBonus = 0;
        let monthlyTotalPaid = 0;

        monthlyPayments.forEach(payment => {
            monthlyTotalBonus += (payment.bonus || 0);
        });

        monthlyTotalValue = monthlyTotal; // Assign the sum of daily_rate from calendar days

        monthlyTotalPaid = monthlyTotalValue + monthlyTotalBonus; // Calculate Total Pago

        monthTotalElement.innerHTML = `
            <div class="row align-items-center justify-content-between mb-2">
                <div class="col-auto text-start">
                    <i class="bi bi-currency-euro me-1"></i> Valor Trabalhado: €${monthlyTotalValue.toFixed(2)}
                </div>
                <div class="col-auto text-end">
                    <i class="bi bi-gift me-1"></i> Bônus: €${monthlyTotalBonus.toFixed(2)}
                </div>
            </div>
            <div class="row align-items-center justify-content-center">
                <div class="col-auto text-center fs-5 fw-bold">
                    <i class="bi bi-wallet me-1"></i> Total Pago: €${monthlyTotalPaid.toFixed(2)}
                </div>
            </div>
        `;
    }

    function toggleTrabalhadoFields() {
        trabalhadoFields.style.display = statusSelect.value === 'trabalhado' ? 'block' : 'none';
    }

    async function renderPaymentHistory(year, month) {
        paymentHistoryBody.innerHTML = ''; // Clear previous entries
        noPaymentHistoryMessage.style.display = 'none'; // Hide message by default

        const response = await fetch(`/api/monthly_payments_history?year=${year}&month=${month}`);
        const payments = await response.json();

        if (payments.length === 0) {
            noPaymentHistoryMessage.style.display = 'block';
            return;
        }

        payments.forEach(payment => {
            const row = document.createElement('tr');

            function formatDateToBR(isoDateString) {
        if (!isoDateString) return '';
        const date = new Date(isoDateString + 'T00:00:00'); // Add T00:00:00 to ensure UTC interpretation
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

            // Coluna Pagamento
            const paymentDateCell = document.createElement('td');
            if (payment.payment_date) {
                paymentDateCell.textContent = formatDateToBR(payment.payment_date);
            } else {
                // Se não houver data de pagamento, use o último dia da semana (domingo)
                const weekStartDate = new Date(payment.week_start_date);
                const sundayOfWeek = new Date(weekStartDate);
                sundayOfWeek.setDate(weekStartDate.getDate() + 6); // Adiciona 6 dias para chegar ao domingo
                paymentDateCell.textContent = formatDateToBR(sundayOfWeek.toISOString().split('T')[0]);
            }
            row.appendChild(paymentDateCell);

            // Coluna Período
            const periodCell = document.createElement('td');
            if (payment.calculated_start_date && payment.calculated_days) {
                const calculatedEndDate = new Date(payment.calculated_start_date);
                calculatedEndDate.setDate(calculatedEndDate.getDate() + payment.calculated_days - 1);
                periodCell.textContent = `${formatDateToBR(payment.calculated_start_date)} a ${formatDateToBR(calculatedEndDate.toISOString().split('T')[0])}`;
            } else {
                periodCell.textContent = `${formatDateToBR(payment.week_start_date)} a ${formatDateToBR(payment.period_end)}`;
            }
            row.appendChild(periodCell);

            // Coluna Dias
            const daysCell = document.createElement('td');
            daysCell.textContent = (payment.calculated_days !== null && payment.calculated_days !== undefined) ? Math.floor(payment.calculated_days).toFixed(0) : Math.floor(payment.total_worked_days).toFixed(0);
            row.appendChild(daysCell);

            // Coluna Valor
            const valueCell = document.createElement('td');
            valueCell.textContent = `€${(payment.calculated_value !== null && payment.calculated_value !== undefined) ? payment.calculated_value.toFixed(2) : payment.total_worked_value.toFixed(2)}`;
            row.appendChild(valueCell);

            // NOVO: Coluna Bônus
            const bonusCell = document.createElement('td');
            bonusCell.textContent = `€${(payment.bonus !== null && payment.bonus !== undefined) ? payment.bonus.toFixed(2) : (0).toFixed(2)}`;
            row.appendChild(bonusCell);

            // NOVO: Coluna Pago
            const paidAmountCell = document.createElement('td');
            paidAmountCell.textContent = `€${(payment.paid_amount !== null && payment.paid_amount !== undefined) ? payment.paid_amount.toFixed(2) : (0).toFixed(2)}`;
            row.appendChild(paidAmountCell);

            // Coluna Ações (Botão de Excluir)
            const actionsCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.addEventListener('click', async () => {
                showConfirm('Tem certeza que deseja excluir este registro de pagamento?', async (confirmed) => {
                    if (confirmed) {
                        const response = await fetch(`/api/weekly_payment/${payment.id}`, {
                            method: 'DELETE',
                        });
                        if (response.ok) {
                            showAlert('Registro de pagamento excluído com sucesso!');
                            renderPaymentHistory(currentDate.getFullYear(), currentDate.getMonth() + 1); // Recarrega o histórico
                        } else {
                            showAlert('Erro ao excluir o registro de pagamento.');
                        }
                    }
                });
            });
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);

            paymentHistoryBody.appendChild(row);
        });
    }

    async function populateWeeklyDayOffModal(weekStartDate, logsMap) { // Adiciona weekStartDate e logsMap como parametros
        currentWeekStartDate = weekStartDate; // Armazena a data de início da semana
        dayOffCheckboxesContainer.innerHTML = ''; // Limpa checkboxes anteriores
        const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

        // Formatar weekStartDate para YYYY-MM-DD
        const formattedWeekStartDate = `${weekStartDate.getFullYear()}-${(weekStartDate.getMonth() + 1).toString().padStart(2, '0')}-${weekStartDate.getDate().toString().padStart(2, '0')}`;

        

        const loggedDaysOfWeek = new Set();
        // Iterar sobre os dias da semana para verificar se há logs
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStartDate);
            currentDay.setDate(weekStartDate.getDate() + i);
            const isoDate = currentDay.toISOString().split('T')[0];
            const log = logsMap.get(isoDate);

            if (log && log.status === 'trabalhado' && log.daily_rate && log.daily_rate > 0) {
                loggedDaysOfWeek.add(i); // Adiciona o índice do dia da semana (0=Segunda, 1=Terça, etc.)
            }
        }
        console.log('loggedDaysOfWeek:', loggedDaysOfWeek);

        dayNames.forEach((dayName, index) => {
            const div = document.createElement('div');
            div.classList.add('form-check');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.classList.add('form-check-input');
            input.id = `day-off-${index}`;
            input.value = index;

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = `day-off-${index}`;
            label.textContent = dayName;

            // Marcar se for um dia de folga configurado para esta semana OU se tiver um log com valor
            if (loggedDaysOfWeek.has(index)) {
                input.checked = true;
            }

            div.appendChild(input);
            div.appendChild(label);
            dayOffCheckboxesContainer.appendChild(div);
        });

        // NOVO: Armazenar o estado inicial dos checkboxes marcados para esta semana
        initialConfiguredDaysOff = [];
        dayOffCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            initialConfiguredDaysOff.push(parseInt(checkbox.value));
        });
    }

    async function updateWeeklySummary(isoDate) {
        const response = await fetch(`/api/summary/week?current_date=${isoDate}`);
        const data = await response.json();
        weeklySummary.textContent = `Total para a semana (${data.week_start} a ${data.week_end}): €${data.total.toFixed(2)}`;
    }

    statusSelect.addEventListener('change', toggleTrabalhadoFields);

    saveDayBtn.addEventListener('click', async () => {
        const logData = {
            date: editDateInput.value,
            status: statusSelect.value,
            shift_type: statusSelect.value === 'trabalhado' ? shiftSelect.value : null,
            daily_rate: statusSelect.value === 'trabalhado' ? parseFloat(dailyRateInput.value) : null,
        };

        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });

        dayEditModal.hide();
        renderCalendar(currentDate);
    });

    // NOVO: Event Listener para o botao de Excluir
    deleteDayBtn.addEventListener('click', async () => {
        const isoDate = editDateInput.value;
        showConfirm(`Tem certeza que deseja excluir o registro para ${isoDate}?`, async (confirmed) => {
            if (confirmed) {
                const response = await fetch(`/api/log/${isoDate}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    dayEditModal.hide();
                    renderCalendar(currentDate);
                } else {
                    showAlert('Erro ao excluir o registro.');
                }
            }
        });
    });

    // NOVO: Event Listener para o botão "Gerenciar Férias"
    manageVacationsBtn.addEventListener('click', () => {
        settingsModal.hide(); // Esconde o modal de configurações
        vacationModal.show(); // Mostra o modal de férias
    });

    // NOVO: Event Listener para o botão "Adicionar" férias
    addVacationBtn.addEventListener('click', async () => {
        const startDate = vacationStartDateInput.value;
        const endDate = vacationEndDateInput.value;

        if (!startDate || !endDate) {
            showAlert('Por favor, selecione as datas de início e fim das férias.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            showAlert('A data de início não pode ser posterior à data de término.');
            return;
        }

        try {
            const response = await fetch('/api/vacations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start_date: startDate, end_date: endDate }),
            });

            if (response.ok) {
                showAlert('Período de férias adicionado com sucesso!');
                vacationModal.hide();
                renderCalendar(currentDate);
            } else {
                const errorData = await response.json();
                showAlert(`Erro ao adicionar férias: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar férias:', error);
            showAlert('Erro ao conectar com o servidor para adicionar férias.');
        }
    });

    // NOVO: Event Listener para o botão "Remover" férias
    removeVacationBtn.addEventListener('click', async () => {
        const startDate = vacationStartDateInput.value;
        const endDate = vacationEndDateInput.value;

        if (!startDate || !endDate) {
            showAlert('Por favor, selecione as datas de início e fim das férias para remover.');
            return;
        }

        vacationModal.hide(); // Oculta o modal de férias antes de mostrar o de confirmação

        showConfirm('Tem certeza que deseja remover este período de férias?', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/api/vacations?start_date=${startDate}&end_date=${endDate}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        showAlert('Período de férias removido com sucesso!');
                        renderCalendar(currentDate);
                    } else {
                        const errorData = await response.json();
                        showAlert(`Erro ao remover férias: ${errorData.detail || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Erro ao remover férias:', error);
                    showAlert('Erro ao conectar com o servidor para remover férias.');
                }
            } else {
                vacationModal.show(); // Reexibe o modal de férias se a confirmação for cancelada
            }
        });
    });

    

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    selectAllDaysBtn.addEventListener('click', () => {
        dayOffCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
    });

    deselectAllDaysBtn.addEventListener('click', () => {
        dayOffCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    saveWeeklyDayOffBtn.addEventListener('click', async () => {
        const selectedDays = [];
        dayOffCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            selectedDays.push(parseInt(checkbox.value));
        });

        

        // Salvar a nova configuração de dias de contribuição padrão
        console.log('Sending days:', selectedDays); // Added for debugging
        const formattedWeekStartDateSave = `${currentWeekStartDate.getFullYear()}-${(currentWeekStartDate.getMonth() + 1).toString().padStart(2, '0')}-${currentWeekStartDate.getDate().toString().padStart(2, '0')}`;

        const response = await fetch('/api/settings/configured_days_off_weekly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ week_start_date: formattedWeekStartDateSave, days: selectedDays }),
        });

        if (response.ok) {
            weeklyDayOffModal.hide();
            document.body.focus();
            renderCalendar(currentDate); // Recarrega o calendario para aplicar as novas configuracoes
            showAlert('Dias de contribuição padrão salvos com sucesso!');
        } else {
            showAlert('Erro ao salvar dias de contribuição padrão.');
        }
    });

    saveAllSettingsBtn.addEventListener('click', async () => {
        // Save Default Rate
        const rate = parseFloat(defaultDailyRateInput.value);
        if (isNaN(rate) || rate <= 0) {
            showAlert('Por favor, insira um valor positivo para o Valor Padrão do Dia.');
            return;
        }

        const saveRatePromise = fetch('/api/settings/default_rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: rate.toFixed(2) }),
        });

        // Save Default Day Off
        const dayOff = defaultDayOffSelect.value;
        const saveDayOffPromise = fetch('/api/settings/default_day_off', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: dayOff }),
        });

        try {
            const [rateResponse, dayOffResponse] = await Promise.all([saveRatePromise, saveDayOffPromise]);

            let success = true;
            if (rateResponse.ok) {
                currentDefaultRate = rate;
            } else {
                success = false;
                console.error('Erro ao salvar Valor Padrão do Dia:', await rateResponse.json());
            }

            if (dayOffResponse.ok) {
                currentDefaultDayOff = parseInt(dayOff);
            } else {
                success = false;
                console.error('Erro ao salvar Dia de Folga Padrão:', await dayOffResponse.json());
            }

            if (success) {
                showAlert('Configurações salvas com sucesso!');
                settingsModal.hide(); // Hide the settings modal
                renderCalendar(currentDate); // Re-render calendar to apply changes
            } else {
                showAlert('Ocorreu um erro ao salvar uma ou ambas as configurações. Verifique o console para detalhes.');
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            showAlert('Ocorreu um erro inesperado ao salvar as configurações.');
        }
    });

    calculateDaysBtn.addEventListener('click', async () => {
        const paymentDate = paymentDateCalcInput.value;
        const startDate = startDateCalcInput.value;
        const dailyRate = parseFloat(dailyRateCalcInput.value);
        const paidAmount = parseFloat(paidAmountCalcInput.value);

        if (!paymentDate || !startDate || isNaN(dailyRate) || dailyRate <= 0 || isNaN(paidAmount) || paidAmount <= 0) {
            calculatedDaysResult.textContent = 'Por favor, preencha todos os campos com valores válidos.';
            calculatedDaysResult.classList.remove('alert-success', 'alert-info');
            calculatedDaysResult.classList.add('alert-danger');
            return;
        }

        try {
            const response = await fetch('/api/calculate-days', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_date: paymentDate,
                    start_date: startDate,
                    daily_rate: dailyRate,
                    paid_amount: paidAmount
                }),
            });

            const data = await response.json();

            if (response.ok) {
                calculatedDaysResult.textContent = `Dias Trabalhados Calculados: ${data.calculated_days.toFixed(2)} dias`;
                calculatedDaysResult.classList.remove('alert-danger', 'alert-info');
                calculatedDaysResult.classList.add('alert-success');

                // Calculate bonus here
                const calculatedValue = data.calculated_days * dailyRate;
                const bonus = paidAmount - calculatedValue; // Calculate bonus

                // NOVO: Preencher o calendário com os dias calculados
                const numDaysToFill = Math.floor(data.calculated_days);
                const startDateObj = new Date(startDate); // startDate is already YYYY-MM-DD
                let daysFilled = 0;

                for (let i = 0; daysFilled < numDaysToFill && i < 365; i++) { // Limite de 365 dias para evitar loop infinito
                    const currentDay = new Date(startDateObj);
                    currentDay.setDate(startDateObj.getDate() + i);
                    const isoDate = currentDay.toISOString().split('T')[0];

                    const log = logsMap.get(isoDate);

                    // Verifica se o dia não tem status (não trabalhado e não folga)
                    if (!log || (log.status !== 'trabalhado' && log.status !== 'folga' && log.status !== 'ferias')) {
                        const logData = {
                            date: isoDate,
                            status: 'trabalhado',
                            shift_type: 'dia_todo', // Assumindo dia todo para preenchimento automático
                            daily_rate: dailyRate,
                        };

                        await fetch('/api/log', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(logData),
                        });
                        daysFilled++;
                    }
                }
                // NOVO: Criar/Atualizar WeeklyPayment após o preenchimento dos dias
                const paymentDateObj = new Date(paymentDate); // Cria um objeto Date a partir da string YYYY-MM-DD
                const weekStartPaymentDate = new Date(paymentDateObj);
                const dayOfWeek = weekStartPaymentDate.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

                // Calcula quantos dias subtrair para chegar à segunda-feira
                // Se for domingo (0), subtrai 6 dias. Caso contrário, subtrai (dia da semana - 1)
                const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                weekStartPaymentDate.setDate(paymentDateObj.getDate() - daysToSubtract);
                const isoWeekStartPaymentDate = weekStartPaymentDate.toISOString().split('T')[0];

                await fetch('/api/weekly_payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        week_start_date: isoWeekStartPaymentDate,
                        payment_date: paymentDate,
                        calculated_start_date: startDate,
                        calculated_days: data.calculated_days,
                        calculated_value: Math.floor(data.calculated_days) * dailyRate, // This is the "Valor" part
                        bonus: paidAmount - (Math.floor(data.calculated_days) * dailyRate), // Calculate bonus
                        paid_amount: paidAmount // This is the "Pago" part
                    }),
                });

                // Reset input fields
                paymentDateCalcInput.value = '';
                startDateCalcInput.value = '';
                dailyRateCalcInput.value = '';
                paidAmountCalcInput.value = '';
                calculatedDaysResult.textContent = ''; // Clear the calculated message

                calculateDaysModal.hide(); // Fecha o modal após o preenchimento
                renderCalendar(currentDate); // Re-renderiza o calendário para mostrar os novos dias

            } else {
                calculatedDaysResult.textContent = `Erro: ${data.detail || 'Ocorreu um erro no cálculo.'}`;
                calculatedDaysResult.classList.remove('alert-success', 'alert-info');
                calculatedDaysResult.classList.add('alert-danger');
            }
        } catch (error) {
            console.error('Erro ao calcular dias:', error);
            calculatedDaysResult.textContent = 'Erro ao conectar com o servidor.';
            calculatedDaysResult.classList.remove('alert-success', 'alert-info');
            calculatedDaysResult.classList.add('alert-danger');
        }
    });

    // Inicializacao
    await loadDefaultRate();
    loadDefaultDayOff(); // NOVO: Carrega a configuracao de folga padrao
    renderCalendar(currentDate);
});