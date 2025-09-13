translations = {
    "pt": {
        "app_title": "Controle de Dias Trabalhados",
        "app_description": "Uma API para gerenciar e calcular dias de trabalho e pagamentos.",
        "periodo_ferias_nao_encontrado": "Período de férias não encontrado.",
        "periodo_ferias_excluido_sucesso": "Período de férias excluído com sucesso.",
        "formato_data_invalido": "Formato de data inválido. Use YYYY-MM-DD.",
        "registro_nao_encontrado": "Registro não encontrado para a data especificada.",
        "weekday_invalido": "Weekday must be between 0 (Monday) and 6 (Sunday).",
        "no_date_found_for_weekday": "No date found for weekday {weekday} in week starting {week_start_date}.",
        "no_logs_found": "No logs found for {date}.",
        "all_logs_deleted_success": "All logs for {date} deleted successfully.",
        "valor_dia_positivo": "O valor do dia deve ser positivo.",
        "valor_pago_positivo": "O valor pago deve ser positivo.",
        "pagamento_semanal_nao_encontrado": "Pagamento semanal não encontrado.",
        "registro_pagamento_semanal_nao_encontrado": "Registro de pagamento semanal não encontrado.",
        "registro_pagamento_excluido_sucesso": "Registro de pagamento {payment_id} excluído com sucesso.",
        "erro_buscar_historico_pagamentos": "Erro ao buscar histórico de pagamentos: {error_detail}",
        "dias_contribuicao_salvos_sucesso": "Dias de contribuição padrão salvos e logs atualizados com sucesso.",
        "configuracao_salva_sucesso": "Configuração salva com sucesso."
    },
    "en": {
        "app_title": "Worked Days Control",
        "app_description": "An API to manage and calculate worked days and payments.",
        "periodo_ferias_nao_encontrado": "Vacation period not found.",
        "periodo_ferias_excluido_sucesso": "Vacation period deleted successfully.",
        "formato_data_invalido": "Invalid date format. Use YYYY-MM-DD.",
        "registro_nao_encontrado": "Record not found for the specified date.",
        "registro_excluido_sucesso": "Record for {date} deleted successfully.",
        "weekday_invalido": "Weekday must be between 0 (Monday) and 6 (Sunday).",
        "no_date_found_for_weekday": "No date found for weekday {weekday} in week starting {week_start_date}.",
        "no_logs_found": "No logs found for {date}.",
        "all_logs_deleted_success": "All logs for {date} deleted successfully.",
        "valor_dia_positivo": "Daily rate must be positive.",
        "valor_pago_positivo": "Paid amount must be positive.",
        "pagamento_semanal_nao_encontrado": "Weekly payment not found.",
        "registro_pagamento_semanal_nao_encontrado": "Weekly payment record not found.",
        "registro_pagamento_excluido_sucesso": "Weekly payment record {payment_id} deleted successfully.",
        "erro_buscar_historico_pagamentos": "Error fetching payment history: {error_detail}",
        "dias_contribuicao_salvos_sucesso": "Default contribution days saved and logs updated successfully.",
        "configuracao_salva_sucesso": "Setting saved successfully."
    },
    "it": {
        "app_title": "Controllo Giorni Lavorati",
        "app_description": "Un'API per gestire e calcolare i giorni lavorati e i pagamenti.",
        "periodo_ferias_nao_encontrado": "Periodo di vacanza non trovato.",
        "periodo_ferias_excluido_sucesso": "Periodo di vacanza eliminato con successo.",
        "formato_data_invalido": "Formato data non valido. Usa AAAA-MM-GG.",
        "registro_nao_encontrado": "Record non trovato per la data specificata.",
        "registro_excluido_sucesso": "Record per {date} eliminato con successo.",
        "weekday_invalido": "Il giorno della settimana deve essere compreso tra 0 (lunedì) e 6 (domenica).",
        "no_date_found_for_weekday": "Nessuna data trovata per il giorno della settimana {weekday} nella settimana che inizia {week_start_date}.",
        "no_logs_found": "Nessun log trovato per {date}.",
        "all_logs_deleted_success": "Tutti i log per {date} eliminati con successo.",
        "valor_dia_positivo": "Il valore giornaliero deve essere positivo.",
        "valor_pago_positivo": "L'importo pagato deve essere positivo.",
        "pagamento_semanal_nao_encontrado": "Pagamento settimanale non trovato.",
        "registro_pagamento_semanal_nao_encontrado": "Record di pagamento settimanale non trovato.",
        "registro_pagamento_excluido_sucesso": "Record di pagamento settimanale {payment_id} eliminato con successo.",
        "erro_buscar_historico_pagamentos": "Errore durante il recupero della cronologia dei pagamenti: {error_detail}",
        "dias_contribuicao_salvos_sucesso": "Giorni di contribuzione predefiniti salvati e log aggiornati con successo.",
        "configuracao_salva_sucesso": "Impostazione salvata con successo."
    }
}

def get_translation(key: str, lang: str = "pt", **kwargs) -> str:
    lang_translations = translations.get(lang, translations["pt"])
    translated_text = lang_translations.get(key, key)
    return translated_text.format(**kwargs)
