from pydantic import BaseModel
from typing import Optional


class PropertyBase(BaseModel):
    titulo: str
    ciudad: str
    tipo: str
    precio: float
    ambientes: int
    metros_cuadrados: float
    imagen: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass  # Igual que PropertyBase para crear


class PropertyUpdate(BaseModel):
    titulo: Optional[str] = None
    ciudad: Optional[str] = None
    tipo: Optional[str] = None
    precio: Optional[float] = None
    ambientes: Optional[int] = None
    metros_cuadrados: Optional[float] = None
    imagen: Optional[str] = None


class PropertyRead(PropertyBase):
    id: int

    class Config:
        orm_mode = True  # Para que funcione con ORM (SQLAlchemy)
