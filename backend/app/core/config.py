from pydantic.v1 import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://usuario:contraseña@localhost:3306/inmobiliaria_db"
    SECRET_KEY: str = "esta_es_una_clave_muy_secreta_y_larga"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
