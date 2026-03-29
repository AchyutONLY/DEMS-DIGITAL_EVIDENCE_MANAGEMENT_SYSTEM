from fastapi import FastAPI
from app.database import engine,Base
from app.routers import users, cases, evidence, custody, audit, auth
app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(custody.router)
app.include_router(audit.router)
app.include_router(auth.router)