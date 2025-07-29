from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from api.properties import router as properties_router
from api.auth import router as auth_router  # Importá el router de auth

app = FastAPI()

# Orígenes permitidos (frontend local y producción)
origins = [
    "http://localhost:3000",
    # "https://mi-frontend-deployado.com",  # reemplazá con tu dominio real
]

# Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(properties_router)
app.include_router(auth_router)  # Incluir el router de auth

# Redirección a Swagger


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
