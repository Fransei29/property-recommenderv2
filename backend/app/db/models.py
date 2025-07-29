from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    ciudad = Column(String(100), nullable=False)
    tipo = Column(String(100), nullable=False)
    precio = Column(Float, nullable=False)
    ambientes = Column(Integer, nullable=False)
    metros_cuadrados = Column(Float, nullable=False)
    imagen = Column(String(500), nullable=True)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))

    # CORREGIDO: añadimos back_populates
    role = relationship("Role", back_populates="users")
