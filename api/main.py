from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
import os
import uvicorn
from contextlib import asynccontextmanager

from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship

# -------------------------------------------------------------------------
# Konfiguracja bazy danych oraz SQLAlchemy
# -------------------------------------------------------------------------

os.makedirs("./data", exist_ok=True)
DATABASE_URL = "sqlite:///./data/energy_usage.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Modele SQLAlchemy

class HomeModel(Base):
    __tablename__ = "homes"
    number = Column(String, primary_key=True, index=True)  # numer domku jako klucz główny
    usages = relationship("UsageModel", back_populates="home", cascade="all, delete-orphan")



class UsageModel(Base):
    __tablename__ = "usages"
    id = Column(Integer, primary_key=True, index=True)
    homeNumber = Column(String, ForeignKey("homes.number", ondelete="CASCADE"), nullable=False)
    userName = Column(String, nullable=False)
    initialReading = Column(Float, nullable=False)
    finalReading = Column(Float, nullable=True)
    kwhUsed = Column(Float, nullable=True)
    costPerKwh = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    startDate = Column(String, nullable=False)
    endDate = Column(String, nullable=False)
    isCompleted = Column(Boolean, default=False, nullable=False)
    
    home = relationship("HomeModel", back_populates="usages")



# Dependency do pobierania sesji

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------------
# Modele Pydantic
# -------------------------------------------------------------------------

class HomeBase(BaseModel):
    number: str

class HomeCreate(HomeBase):
    pass

class Home(HomeBase):
    class Config:
        orm_mode = True

class UsageBase(BaseModel):
    homeNumber: str
    userName: str
    initialReading: float
    finalReading: Optional[float] = None
    costPerKwh: float
    date: str
    startDate: str
    endDate: str

    @validator('endDate')
    def end_date_after_start_date(cls, v, values):
        if 'startDate' in values and v < values['startDate']:
            raise ValueError('Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia')
        return v

class UsageCreate(UsageBase):
    pass

class UsageUpdate(BaseModel):
    finalReading: float
    date: Optional[str] = None

class UsageEdit(BaseModel):
    userName: Optional[str] = None
    initialReading: Optional[float] = None
    costPerKwh: Optional[float] = None
    date: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

    @validator('endDate')
    def end_date_after_start_date(cls, v, values):
        if 'startDate' in values and values.get('startDate') is not None and v < values['startDate']:
            raise ValueError('Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia')
        return v

class Usage(UsageBase):
    id: int
    kwhUsed: Optional[float] = None
    isCompleted: bool
    class Config:
        orm_mode = True


# -------------------------------------------------------------------------
# Funkcje pomocnicze logiki biznesowej
# -------------------------------------------------------------------------

def calculate_kwh_used(initial_reading: float, final_reading: float) -> float:
    return final_reading - initial_reading

def calculate_stay_days(start_date: str, end_date: str) -> int:
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    return (end - start).days + 1


# -------------------------------------------------------------------------
# Inicjalizacja przykładowych danych i bazy
# -------------------------------------------------------------------------

def init_db():
    Base.metadata.create_all(bind=engine)

def add_sample_data():
    db: Session = SessionLocal()
    try:
        # Sprawdzenie czy istnieją już domki
        if db.query(HomeModel).count() == 0:
            # Dodanie przykładowych domków; numer służy jako identyfikator (np. "1", "2", "3" lub "5a")
            homes = [HomeModel(number="1"), HomeModel(number="2"), HomeModel(number="3")]
            db.add_all(homes)
            db.commit()
            # Wykorzystujemy pierwszy domek do przykładowych zużyć
            homeNumber = homes[0].number

            usage1 = UsageModel(
                homeNumber=homeNumber,
                userName="Jan Kowalski",
                initialReading=1000.0,
                finalReading=1050.0,
                kwhUsed=calculate_kwh_used(1000.0, 1050.0),
                costPerKwh=0.75,
                date="2025-03-01",
                startDate="2025-02-25",
                endDate="2025-03-01",
                isCompleted=True
            )
            usage2 = UsageModel(
                homeNumber=homeNumber,
                userName="Anna Nowak",
                initialReading=1050.0,
                finalReading=None,
                kwhUsed=None,
                costPerKwh=0.75,
                date="2025-03-10",
                startDate="2025-03-10",
                endDate="2025-03-15",
                isCompleted=False
            )
            db.add_all([usage1, usage2])
            db.commit()
    finally:
        db.close()


# -------------------------------------------------------------------------
# Konfiguracja aplikacji FastAPI
# -------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    add_sample_data()
    yield

app = FastAPI(title="API Zarządzania Zużyciem Energii", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji warto ograniczyć do właściwej domeny
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# Endpointy dla domków
# -------------------------------------------------------------------------

@app.get("/api/homes", response_model=List[Home])
def get_homes(db: Session = Depends(get_db)):
    homes = db.query(HomeModel).order_by(HomeModel.number).all()
    return homes

@app.post("/api/homes", response_model=Home)
def create_home(home: HomeCreate, db: Session = Depends(get_db)):
    existing = db.query(HomeModel).filter_by(number=home.number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Domek o tym numerze już istnieje")
    new_home = HomeModel(number=home.number)
    db.add(new_home)
    db.commit()
    db.refresh(new_home)
    return new_home

@app.get("/api/homes/{homeNumber}", response_model=Home)
def get_home(homeNumber: str, db: Session = Depends(get_db)):
    home = db.query(HomeModel).filter_by(number=homeNumber).first()
    if not home:
        raise HTTPException(status_code=404, detail="Domek nie znaleziony")
    return home

@app.delete("/api/homes/{homeNumber}")
def delete_home(homeNumber: str, db: Session = Depends(get_db)):
    home = db.query(HomeModel).filter_by(number=homeNumber).first()
    if not home:
        raise HTTPException(status_code=404, detail="Domek nie znaleziony")
    db.delete(home)
    db.commit()
    return {"message": "Domek i powiązane zużycia zostały usunięte"}

# -------------------------------------------------------------------------
# Endpointy dla zużyć energii
# -------------------------------------------------------------------------

@app.get("/api/usages", response_model=List[Usage])
def get_all_usages(db: Session = Depends(get_db)):
    usages = db.query(UsageModel).order_by(UsageModel.date.desc()).all()
    return usages

@app.get("/api/usages/latest/{limit}", response_model=List[Usage])
def get_latest_usages(limit: int, db: Session = Depends(get_db)):
    usages = db.query(UsageModel).order_by(UsageModel.date.desc()).limit(limit).all()
    return usages

@app.get("/api/homes/{homeNumber}/usages", response_model=List[Usage])
def get_home_usages(homeNumber: str, db: Session = Depends(get_db)):
    usages = db.query(UsageModel).filter_by(homeNumber=homeNumber).order_by(UsageModel.date.desc()).all()
    return usages

@app.get("/api/homes/{homeNumber}/last-meter-reading")
def get_last_meter_reading(homeNumber: str, db: Session = Depends(get_db)):
    # Pobranie ostatniego zakończonego odczytu licznika
    usage = (
        db.query(UsageModel)
        .filter(UsageModel.homeNumber == homeNumber, UsageModel.isCompleted == True, UsageModel.finalReading != None)
        .order_by(UsageModel.date.desc())
        .first()
    )
    if usage:
        return float(usage.finalReading)
    # Jeśli brak zakończonych, pobierz ostatni odczyt początkowy
    usage = (
        db.query(UsageModel)
        .filter(UsageModel.homeNumber == homeNumber)
        .order_by(UsageModel.date.desc())
        .first()
    )
    if usage:
        return float(usage.initialReading)
    return 0.0

@app.post("/api/usages", response_model=Usage)
def create_usage(usage: UsageCreate, db: Session = Depends(get_db)):
    home = db.query(HomeModel).filter_by(number=usage.homeNumber).first()
    if not home:
        raise HTTPException(status_code=404, detail="Podany domek nie istnieje")
    
    is_completed = usage.finalReading is not None
    kwh_used = None
    if is_completed:
        if usage.finalReading <= usage.initialReading:
            raise HTTPException(status_code=400, detail="Stan końcowy musi być większy niż stan początkowy")
        kwh_used = calculate_kwh_used(usage.initialReading, usage.finalReading)
    
    new_usage = UsageModel(
        homeNumber=usage.homeNumber,
        userName=usage.userName,
        initialReading=usage.initialReading,
        finalReading=usage.finalReading,
        kwhUsed=kwh_used,
        costPerKwh=usage.costPerKwh,
        date=usage.date,
        startDate=usage.startDate,
        endDate=usage.endDate,
        isCompleted=is_completed
    )
    db.add(new_usage)
    db.commit()
    db.refresh(new_usage)
    return new_usage

@app.get("/api/usages/{usage_id}", response_model=Usage)
def get_usage(usage_id: int, db: Session = Depends(get_db)):
    usage = db.query(UsageModel).filter_by(id=usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Zużycie nie znalezione")
    return usage

@app.put("/api/usages/{usage_id}", response_model=Usage)
def update_usage(usage_id: int, update_data: UsageUpdate, db: Session = Depends(get_db)):
    usage = db.query(UsageModel).filter_by(id=usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Zużycie nie znalezione")
    if update_data.finalReading <= usage.initialReading:
        raise HTTPException(status_code=400, detail="Stan końcowy musi być większy niż stan początkowy")
    usage.finalReading = update_data.finalReading
    usage.kwhUsed = calculate_kwh_used(usage.initialReading, update_data.finalReading)
    usage.isCompleted = True
    usage.date = update_data.date if update_data.date is not None else usage.date
    db.commit()
    db.refresh(usage)
    return usage

@app.patch("/api/usages/{usage_id}/edit", response_model=Usage)
def edit_usage(usage_id: int, update_data: UsageEdit, db: Session = Depends(get_db)):
    usage = db.query(UsageModel).filter_by(id=usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Zużycie nie znalezione")
    if usage.isCompleted:
        raise HTTPException(status_code=400, detail="Nie można edytować zakończonego zużycia")
    
    usage.userName = update_data.userName if update_data.userName is not None else usage.userName
    usage.initialReading = update_data.initialReading if update_data.initialReading is not None else usage.initialReading
    usage.costPerKwh = update_data.costPerKwh if update_data.costPerKwh is not None else usage.costPerKwh
    usage.date = update_data.date if update_data.date is not None else usage.date
    usage.startDate = update_data.startDate if update_data.startDate is not None else usage.startDate
    usage.endDate = update_data.endDate if update_data.endDate is not None else usage.endDate
    db.commit()
    db.refresh(usage)
    return usage

@app.delete("/api/usages/{usage_id}")
def delete_usage(usage_id: int, db: Session = Depends(get_db)):
    usage = db.query(UsageModel).filter_by(id=usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Zużycie nie znalezione")
    db.delete(usage)
    db.commit()
    return {"message": "Zużycie zostało usunięte"}

# -------------------------------------------------------------------------
# Uruchomienie aplikacji
# -------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
