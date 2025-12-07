// Frontend JS: fetches products from backend, cart logic, banners and checkout demo
const API = "/api"; // when deployed, proxy or host backend separately

const banners = [
  {id:1, title:"Promo - 2x1 Pollo", img:"images/banner1.jpg"},
  {id:2, title:"Envío gratis hoy", img:"images/banner2.jpg"}
];

function $(s){return document.querySelector(s)}
function qs(s){return document.querySelectorAll(s)}

async function fetchProducts(){
  try{
    const res = await fetch(API + "/products");
    const data = await res.json();
    return data;
  }catch(e){
    console.error(e);
    // fallback sample
    return [
      {id:1,name:"Pollo a la brasa",desc:"Clásico",price:25,stock:10,img:"images/product1.jpg"},
      {id:2,name:"Arroz con pollo",desc:"Con salsa",price:20,stock:5,img:"images/product2.jpg"}
    ];
  }
}

function renderBanners(){
  const el = $("#banners");
  banners.forEach(b=>{
    const d = document.createElement("div");
    d.className="banner";
    d.innerHTML = `<img src="${b.img}" alt="${b.title}" style="width:100%;border-radius:10px"><strong>${b.title}</strong>`;
    d.onclick = ()=> alert(b.title + " - acción demo");
    el.appendChild(d);
  });
}

function cartGet(){ return JSON.parse(localStorage.getItem("lr_cart")||"[]") }
function cartSet(c){ localStorage.setItem("lr_cart",JSON.stringify(c)); updateCartCount() }
function updateCartCount(){ document.getElementById("cart-count").textContent = cartGet().reduce((s,i)=>s+i.qty,0) }

function renderProducts(list){
  const wrap = document.getElementById("product-list"); wrap.innerHTML="";
  list.forEach(p=>{
    const card = document.createElement("div"); card.className="product";
    if(p.stock===0) card.classList.add("out");
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <div class="meta">
        <div><strong>S/. ${p.price.toFixed(2)}</strong></div>
        <div>
          <button ${p.stock===0? "disabled":""} data-id="${p.id}" class="add">Añadir</button>
        </div>
      </div>
      <div style="font-size:12px;margin-top:6px;color:#666">${p.stock>0? p.stock+' en stock':'Sin stock'}</div>
    `;
    wrap.appendChild(card);
  });
  qs(".add").forEach(b=>b.addEventListener("click",onAdd));
}

function onAdd(e){
  const id = Number(e.target.dataset.id);
  fetch(API + "/products")
    .then(r=>r.json()).then(list=>{
      const prod = list.find(x=>x.id===id);
      if(!prod || prod.stock===0){ alert("Producto sin stock"); return; }
      const cart = cartGet();
      const existing = cart.find(c=>c.id===id);
      if(existing){ existing.qty++; } else cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1});
      cartSet(cart);
    });
}

// Cart UI + checkout modal
document.getElementById("cart-btn").addEventListener("click", async ()=>{
  const modal = document.getElementById("checkout-modal"); modal.classList.remove("hidden");
  const items = cartGet();
  const wrap = document.getElementById("cart-items"); wrap.innerHTML="";
  if(items.length===0) wrap.innerHTML="<em>Carrito vacío</em>";
  else items.forEach(it=>{
    const d = document.createElement("div"); d.innerHTML = `${it.name} x ${it.qty} — S/. ${(it.price*it.qty).toFixed(2)}`;
    wrap.appendChild(d);
  });
  updateCartCount();
});
document.getElementById("close-checkout").addEventListener("click", ()=>document.getElementById("checkout-modal").classList.add("hidden"));

// simple payment demo — DO NOT use in production. Card data is discarded; backend simulates tokenization.
document.getElementById("pay-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = {holder:form.get("holder"), card:form.get("card"), exp:form.get("exp"), cvc:form.get("cvc"), items:cartGet()};
  document.getElementById("checkout-result").textContent = "Procesando...";
  const res = await fetch(API + "/checkout", {method:"POST",headers:{"content-type":"application/json"}, body:JSON.stringify(payload)});
  const data = await res.json();
  document.getElementById("checkout-result").textContent = data.message || "Error";
  if(data.success){ localStorage.removeItem("lr_cart"); updateCartCount(); setTimeout(()=>document.getElementById("checkout-modal").classList.add("hidden"),1500); }
});

// Admin demo
document.getElementById("admin-login").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const user=fd.get("user"), pass=fd.get("pass");
  const res = await fetch(API + "/admin/login", {method:"POST", body: JSON.stringify({user,pass}), headers:{"content-type":"application/json"}});
  const j = await res.json();
  if(j.ok){ document.getElementById("admin-area").classList.remove("hidden"); loadAdminProducts(j.token); } else alert("Credenciales incorrectas (demo)");
});

async function loadAdminProducts(token){
  const res = await fetch(API + "/products", {headers:{"x-admin-token":token}});
  const list = await res.json();
  const wrap = document.getElementById("admin-products"); wrap.innerHTML="";
  list.forEach(p=>{
    const row = document.createElement("div");
    row.innerHTML = `<strong>${p.name}</strong> - Stock: <input type="number" value="${p.stock}" min="0" data-id="${p.id}" class="stock-input"> <button data-id="${p.id}" class="save">Guardar</button>`;
    wrap.appendChild(row);
  });
  qs(".save").forEach(b=>b.addEventListener("click", async (e)=>{
    const id = Number(e.target.dataset.id);
    const val = Number(document.querySelector(`input[data-id='${id}']`).value);
    const res = await fetch(API + "/admin/update_stock", {method:"POST", headers:{"content-type":"application/json","x-admin-token":"demo-token"}, body:JSON.stringify({id,stock:val})});
    const j = await res.json();
    if(j.ok){ alert("Stock actualizado"); refreshProducts(); }
  }));
}

async function refreshProducts(){
  const list = await fetchProducts();
  renderProducts(list);
}

async function init(){
  renderBanners();
  const list = await fetchProducts();
  renderProducts(list);
  updateCartCount();
}
init();
