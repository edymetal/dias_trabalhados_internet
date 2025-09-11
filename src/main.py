from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional, Any
from pydantic import BaseModel
import json
from sqlalchemy import select, and_, func

from .database import create_db_and_tables, SessionLocal, WorkLog, ShiftType, WorkStatus, Settings

# Pydantic Models
class WorkLogBase(BaseModel):
    date: date
    status: WorkStatus
    shift_type: Optional[ShiftType] = None
    daily_rate: Optional[float] = None

class WorkLogCreate(WorkLogBase):
    pass

class WorkLogSchema(WorkLogBase):
    id: Optional[int] = None # ID pode ser None para logs virtuais
    class Config:
        orm_mode = True

class SettingsUpdate(BaseModel):
    value: str

class ConfiguredDaysOff(BaseModel):
    days: List[int]

class ConfiguredDaysOffWeekly(BaseModel): # NOVO
    week_start_date: date
    days: List[int]

# --- FastAPI App Setup ---
app = FastAPI(
    title="Controle de Dias Trabalhados",
    description="Uma API para gerenciar e calcular dias de trabalho e pagamentos.",
    version="0.3.1" # Version updated
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

@app.get("/", tags=["Frontend"], include_in_schema=False)
async def read_root():
    return FileResponse('static/index.html')

@app.get("/api/logs", response_model=List[WorkLogSchema], tags=["Work Logs"])
def get_logs_for_range(start_date: date, end_date: date, db: Session = Depends(get_db)):
    statement = select(WorkLog).where(and_(WorkLog.date >= start_date, WorkLog.date <= end_date))
    logs = db.execute(statement).scalars().all()
    return logs

@app.post("/api/log", response_model=WorkLogSchema, tags=["Work Logs"])
def create_or_update_log(log: WorkLogCreate, db: Session = Depends(get_db)):
    try:
        print(f"Attempting to save log for date: {log.date}")
        statement = select(WorkLog).where(WorkLog.date == log.date)
        db_log = db.execute(statement).scalars().first()
        if db_log:
            print(f"Found existing log for date: {db_log.date}")
            db_log.status = log.status
            db_log.shift_type = log.shift_type
            db_log.daily_rate = log.daily_rate
        else:
            print(f"No existing log found for date: {log.date}. Creating new.")
            db_log = WorkLog(**log.dict())
            db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as e:
        print(f"Error in create_or_update_log: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/summary/week", tags=["Calculations"])
def get_week_summary(current_date: date, db: Session = Depends(get_db)):
    # Monday is 0 and Sunday is 6
    start_of_week = current_date - timedelta(days=current_date.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    statement = select(func.sum(WorkLog.daily_rate)).where(
        and_(
            WorkLog.date >= start_of_week,
            WorkLog.date <= end_of_week,
            WorkLog.status == WorkStatus.TRABALHADO
        )
    )
    total = db.execute(statement).scalar_one_or_none() or 0
    return {"week_start": start_of_week, "week_end": end_of_week, "total": total}

@app.get("/api/summary/month", tags=["Calculations"])
def get_month_summary(year: int, month: int, db: Session = Depends(get_db)):
    start_date = date(year, month, 1)
    end_date = date(year, month + 1, 1) if month < 12 else date(year + 1, 1, 1)
    statement = select(func.sum(WorkLog.daily_rate)).where(
        and_(
            WorkLog.date >= start_date,
            WorkLog.date < end_date,
            WorkLog.status == WorkStatus.TRABALHADO
        )
    )
    total = db.execute(statement).scalar_one_or_none() or 0
    return {"total": total}



@app.get("/api/settings/default_day_off")
def get_default_day_off(db: Session = Depends(get_db)):
    setting = db.query(Settings).filter(Settings.key == "default_day_off").first()
    if setting:
        return {"value": setting.value}
    return {"value": None}





@app.get("/api/settings/configured_days_off_weekly_range", response_model=List[ConfiguredDaysOffWeekly], tags=["Settings"])
def get_configured_days_off_weekly_range(start_date: date, end_date: date, db: Session = Depends(get_db)):
    """Gets configured days off for weeks within a specified date range."""
    # Generate all possible setting keys for the given date range
    # Calculate the Monday of the start_date
    current_week_start = start_date - timedelta(days=start_date.weekday())

    setting_keys = []
    while current_week_start <= end_date:
        setting_keys.append(f"configured_days_off_{current_week_start.strftime('%Y-%m-%d')}")
        current_week_start += timedelta(days=7) # Move to the next Monday

    # Query settings that match these keys
    statement = select(Settings).where(Settings.key.in_(setting_keys))
    settings = db.execute(statement).scalars().all()

    result = []
    for setting in settings:
        try:
            # Extract week_start_date from the key
            key_parts = setting.key.split('_')
            week_start_date_str = key_parts[-1]
            week_start_date = date.fromisoformat(week_start_date_str)
            days = json.loads(setting.value)
            result.append(ConfiguredDaysOffWeekly(week_start_date=week_start_date, days=days))
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Error parsing setting {setting.key}: {e}")
            continue
    return result

@app.delete("/api/settings/clear_all_weekly_configs", tags=["Settings"])
def clear_all_weekly_configs(db: Session = Depends(get_db)):
    """Clears all configured weekly days off settings."""
    statement = select(Settings).where(Settings.key.like("configured_days_off_%"))
    settings_to_delete = db.execute(statement).scalars().all()
    for setting in settings_to_delete:
        db.delete(setting)
    db.commit()
    return {"message": "All weekly configured days off cleared successfully."}

@app.get("/api/settings/configured_days_off_weekly", tags=["Settings"])
def get_configured_days_off_weekly(week_start_date: date, db: Session = Depends(get_db)):
    """Gets the configured days off for a specific week."""
    setting_key = f"configured_days_off_{week_start_date.strftime('%Y-%m-%d')}"
    setting = db.query(Settings).filter(Settings.key == setting_key).first()
    if setting and setting.value:
        return {"days": json.loads(setting.value)}
    return {"days": []}

@app.post("/api/settings/configured_days_off_weekly", tags=["Settings"])
def set_configured_days_off_weekly(data: ConfiguredDaysOffWeekly, db: Session = Depends(get_db)):
    """Sets the configured days off for a specific week."""
    # Get default daily rate
    default_rate_setting = db.query(Settings).filter(Settings.key == "default_rate").first()
    default_rate = float(default_rate_setting.value) if default_rate_setting and default_rate_setting.value else 0.0

    # Iterate through all 7 days of the week
    for i in range(7):
        current_date = data.week_start_date + timedelta(days=i)
        
        # Check if the current day is in the selected days (days to be worked)
        if i in data.days:
            # This day should be marked as TRABALHADO
            existing_log = db.query(WorkLog).filter(WorkLog.date == current_date).first()
            if existing_log:
                existing_log.status = WorkStatus.TRABALHADO
                existing_log.daily_rate = default_rate
            else:
                new_log = WorkLog(date=current_date, status=WorkStatus.TRABALHADO, daily_rate=default_rate)
                db.add(new_log)
        else:
            # This day should not be explicitly marked as FOLGA; delete the log if it exists.
            existing_log = db.query(WorkLog).filter(WorkLog.date == current_date).first()
            if existing_log:
                db.delete(existing_log)

    db.commit()
    return {"message": "Dias de contribuição padrão salvos e logs atualizados com sucesso."}

@app.get("/api/settings/{key}", tags=["Settings"])
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.get(Settings, key)
    if not setting:
        return {"value": ""}
    return {"value": setting.value}

@app.post("/api/settings/{key}", tags=["Settings"])
def update_setting(key: str, data: SettingsUpdate, db: Session = Depends(get_db)):
    setting = db.get(Settings, key)
    if setting:
        setting.value = data.value
    else:
        setting = Settings(key=key, value=data.value)
        db.add(setting)
    db.commit()
    return {"message": "Configuração salva com sucesso."}

@app.delete("/api/log/{log_date}", tags=["Work Logs"])
def delete_log(log_date: str, db: Session = Depends(get_db)):
    """Deletes a work log entry for a specific date."""
    try:
        parsed_date = date.fromisoformat(log_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD.")

    statement = select(WorkLog).where(WorkLog.date == parsed_date)
    db_log = db.execute(statement).scalars().first()

    if not db_log:
        raise HTTPException(status_code=404, detail="Registro não encontrado para a data especificada.")

    db.delete(db_log)
    db.commit()
    return {"message": f"Registro para {parsed_date} excluído com sucesso."}

@app.delete("/api/logs/by_weekday", tags=["Work Logs"])
def delete_logs_by_weekday(weekday: int, week_start_date: date, db: Session = Depends(get_db)):
    """Deletes all work log entries for a specific weekday in a given week."""
    # Ensure weekday is valid (0=Monday, 6=Sunday)
    if not (0 <= weekday <= 6):
        raise HTTPException(status_code=400, detail="Weekday must be between 0 (Monday) and 6 (Sunday).")

    # Calculate start and end of the week
    start_of_week = week_start_date
    end_of_week = start_of_week + timedelta(days=6)

    # Calculate the specific date for the given weekday within this week
    date_to_delete = None
    current_day = start_of_week
    while current_day <= end_of_week:
        if current_day.weekday() == weekday:
            date_to_delete = current_day
            break
        current_day += timedelta(days=1)

    if not date_to_delete:
        return {"message": f"No date found for weekday {weekday} in week starting {week_start_date}."}

    # Delete logs for the identified date
    statement = select(WorkLog).where(WorkLog.date == date_to_delete) # Modificado
    logs_to_delete = db.execute(statement).scalars().all()

    if not logs_to_delete:
        return {"message": f"No logs found for {date_to_delete}."}

    for log in logs_to_delete:
        db.delete(log)
    db.commit()

    return {"message": f"All logs for {date_to_delete} deleted successfully."}

# Pydantic Models for Weekly Payments
class WeeklyPaymentBase(BaseModel):
    week_start_date: date
    payment_date: Optional[date] = None

class WeeklyPaymentCreate(WeeklyPaymentBase):
    pass

class WeeklyPaymentSchema(WeeklyPaymentBase):
    id: Optional[int] = None # Optional for new entries
    class Config:
        orm_mode = True

class CalculateDaysRequest(BaseModel):
    payment_date: date
    start_date: date
    daily_rate: float
    paid_amount: float

@app.post("/api/calculate-days", tags=["Calculations"])
def calculate_days(request: CalculateDaysRequest):
    if request.daily_rate <= 0:
        raise HTTPException(status_code=400, detail="O valor do dia deve ser positivo.")
    if request.paid_amount <= 0:
        raise HTTPException(status_code=400, detail="O valor pago deve ser positivo.")

    calculated_days = request.paid_amount / request.daily_rate
    return {"calculated_days": calculated_days}

@app.get("/api/weekly_payment/{week_start_date}", response_model=WeeklyPaymentSchema, tags=["Weekly Payments"])
def get_weekly_payment(week_start_date: date, db: Session = Depends(get_db)):
    """Gets the payment details for a specific week."""
    statement = select(WeeklyPayment).where(WeeklyPayment.week_start_date == week_start_date)
    payment = db.execute(statement).scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento semanal não encontrado.")
    return payment

@app.post("/api/weekly_payment", response_model=WeeklyPaymentSchema, tags=["Weekly Payments"])
def create_or_update_weekly_payment(payment: WeeklyPaymentCreate, db: Session = Depends(get_db)):
    """Creates or updates the payment date for a specific week."""
    statement = select(WeeklyPayment).where(WeeklyPayment.week_start_date == payment.week_start_date)
    db_payment = db.execute(statement).scalars().first()

    if db_payment:
        db_payment.payment_date = payment.payment_date
    else:
        db_payment = WeeklyPayment(**payment.dict())
        db.add(db_payment)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment