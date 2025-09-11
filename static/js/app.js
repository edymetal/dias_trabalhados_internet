document.addEventListener('DOMContentLoaded', async function () {
    // --- Elementos da UI ---
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const weeklySummary = document.getElementById('weekly-summary');
    const reverseCalcInput = document.getElementById('reverse-calc-input');
    const reverseCalcBtn = document.getElementById('reverse-calc-btn');
    const reverseCalcResult = document.getElementById('reverse-calc-result');

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


        // 2. Fetch all logs and history for the entire displayed period.
        const [logsResponse, historyResponse, weeklyConfigResponse] = await Promise.all([
            fetch(`/api/logs?start_date=${calendarStartDate.toISOString().split('T')[0]}&end_date=${calendarEndDate.toISOString().split('T')[0]}`),
            fetch('/api/settings/default_day_off_history'),
            fetch(`/api/settings/configured_days_off_weekly_range?start_date=${calendarStartDate.toISOString().split('T')[0]}&end_date=${calendarEndDate.toISOString().split('T')[0]}`)
        ]);

        const logs = await logsResponse.json();
        const historyData = await historyResponse.json();
        const weeklyConfigData = await weeklyConfigResponse.json();

        const history = historyData.value ? JSON.parse(historyData.value) : [];
        history.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        const weeklyConfigMap = new Map();
        weeklyConfigData.forEach(config => {
            weeklyConfigMap.set(config.week_start_date, config.days);
        });

        const logsMap = new Map(logs.map(log => [log.date, log]));

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
                statusIndicator.textContent = log.status === 'trabalhado' ? `€${log.daily_rate.toFixed(2)}` : log.status.replace('_', ' ');
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
        monthTotalElement.textContent = `Total do Mês: €${monthlyTotal.toFixed(2)}`;
        calendarGrid.appendChild(monthTotalElement);
    }

    function toggleTrabalhadoFields() {
        trabalhadoFields.style.display = statusSelect.value === 'trabalhado' ? 'block' : 'none';
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
        if (confirm(`Tem certeza que deseja excluir o registro para ${isoDate}?`)) {
            const response = await fetch(`/api/log/${isoDate}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                dayEditModal.hide();
                renderCalendar(currentDate);
            } else {
                alert('Erro ao excluir o registro.');
            }
        }
    });

    reverseCalcBtn.addEventListener('click', async () => {
        const amount = parseFloat(reverseCalcInput.value);
        if (isNaN(amount) || amount <= 0) {
            reverseCalcResult.textContent = 'Por favor, insira um valor positivo.';
            reverseCalcResult.classList.remove('text-success');
            reverseCalcResult.classList.add('text-danger');
            return;
        }

        const response = await fetch(`/api/reverse-calculate?amount=${amount}`);
        const data = await response.json();

        if (response.ok) {
            reverseCalcResult.textContent = `€${amount.toFixed(2)} equivale a aprox. ${data.days_equivalent} dias de trabalho (taxa de €${data.reference_rate.toFixed(2)}/dia).`;
            reverseCalcResult.classList.remove('text-danger');
            reverseCalcResult.classList.add('text-success');
        } else {
            reverseCalcResult.textContent = `Erro: ${data.detail}`;
            reverseCalcResult.classList.remove('text-success');
            reverseCalcResult.classList.add('text-danger');
        }
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

    // Inicializacao
    await loadDefaultRate();
    loadDefaultDayOff(); // NOVO: Carrega a configuracao de folga padrao
    renderCalendar(currentDate);
});