
import enum
from sqlalchemy import create_engine, Column, Integer, String, Date, Float, Enum
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./dias_trabalhados.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ShiftType(str, enum.Enum):
    MANHA = "manha"
    NOITE = "noite"
    DIA_TODO = "dia_todo"

class WorkStatus(str, enum.Enum):
    TRABALHADO = "trabalhado"
    FOLGA = "folga"
    NAO_TRABALHADO = "nao_trabalhado"
    FERIAS = "ferias"

class WorkLog(Base):
    __tablename__ = "work_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    shift_type = Column(Enum(ShiftType))
    status = Column(Enum(WorkStatus), nullable=False)
    daily_rate = Column(Float)

class Settings(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)

class WeeklyPayment(Base):
    __tablename__ = "weekly_payments"

    id = Column(Integer, primary_key=True, index=True)
    week_start_date = Column(Date, nullable=False, index=True)
    payment_date = Column(Date, nullable=True) # Nullable if payment not yet made
    calculated_start_date = Column(Date, nullable=True) # NOVO: Data de início do cálculo
    calculated_days = Column(Float, nullable=True) # NOVO: Dias calculados
    calculated_value = Column(Float, nullable=True) # NOVO: Valor calculado
    bonus = Column(Float, nullable=True) # NOVO: Valor do bônus
    paid_amount = Column(Float, nullable=True) # NOVO: Valor total pago (Valor + Bônus)

class Vacation(Base):
    __tablename__ = "vacations"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

