# db/base.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Obtener la URL de la base de datos desde el archivo .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL)

# Crear una sesión local para usar en la app
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de modelos (clases que heredan esto serán tablas)
Base = declarative_base()


# Este archivo se encarga de:
# Cargar el archivo .env.

# Leer DATABASE_URL.

# Crear el motor y la sesión de SQLAlchemy.

# Definir una clase base para tus modelos.
