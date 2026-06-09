
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Bem-vindo ao Backend do Trading Room!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
