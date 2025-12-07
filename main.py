# FastAPI backend (demo). IMPORTANT: This is a demonstration only.
# Do NOT store raw card numbers in production. Integrate with a PCI-compliant processor (Stripe/PayPal).
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json, os, time

app = FastAPI(title="LaRotiseria API (demo)")
app.add_middleware(
  CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

DATA_FILE = "data/products.json"

if not os.path.exists("data"):
    os.makedirs("data")

# sample products
sample = [
  {"id":1,"name":"Pollo a la brasa","desc":"Pollo jugoso con papas","price":25.0,"stock":10,"img":"images/product1.jpg"},
  {"id":2,"name":"Arroz con pollo","desc":"Arroz amarillo con pollo","price":20.0,"stock":5,"img":"images/product2.jpg"},
  {"id":3,"name":"Causa limeña","desc":"Causa fría tradicional","price":18.0,"stock":2,"img":"images/product3.jpg"}
]
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE,"w") as f:
        json.dump(sample,f,ensure_ascii=False,indent=2)

def read_products():
  with open(DATA_FILE,"r",encoding="utf-8") as f:
    return json.load(f)
def write_products(lst):
  with open(DATA_FILE,"w",encoding="utf-8") as f:
    json.dump(lst,f,ensure_ascii=False,indent=2)

@app.get("/api/products")
def products(request: Request):
  # If admin token provided, return full list; else, hide out-of-stock items? We'll return all but frontend marks out-of-stock
  return read_products()

class CheckoutPayload(BaseModel):
  holder: str
  card: str
  exp: str
  cvc: str
  items: list

@app.post("/api/checkout")
def checkout(payload: CheckoutPayload):
  # DEMO: do not save card data. Simulate tokenization and order creation.
  # Basic validation:
  if not payload.items:
    raise HTTPException(400, "Carrito vacío")
  total = sum(item.get("price",0)*item.get("qty",1) for item in payload.items)
  # simulate token (do not store card)
  token = "tok_demo_" + str(int(time.time()))
  order = {"id": int(time.time()), "total": total, "status":"confirmed", "token": token}
  # In production: send card to payment processor, do 3DS, etc.
  return {"success": True, "message": f"Pago simulado aprobado. Total S/. {total:.2f}", "order": order}

@app.post("/api/admin/login")
def admin_login(creds: dict):
  # demo credential check
  if creds.get("user")== "admin" and creds.get("pass")== "admin":
    return {"ok":True,"token":"demo-token"}
  return {"ok":False}

@app.post("/api/admin/update_stock")
def update_stock(payload: dict, request: Request):
  token = request.headers.get("x-admin-token")
  if token != "demo-token":
    raise HTTPException(401,"No autorizado")
  products = read_products()
  pid = int(payload.get("id"))
  new = int(payload.get("stock"))
  for p in products:
    if p["id"]==pid:
      p["stock"]=new
  write_products(products)
  return {"ok":True}

if __name__=="__main__":
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
