# LaRotiseria - Demo (Frontend + FastAPI backend)
## Resumen
Proyecto demo que mejora la página estática añadiendo banners interactivos, carrito, panel admin (demo) y un backend FastAPI que gestiona productos y simula checkout.

## Estructura
- frontend/ -> archivos estáticos (index.html, app.js, styles.css, images/)
- backend/ -> FastAPI app (main.py), data/products.json

## Importante - Pago y seguridad
Este proyecto **no** es una solución de pago en producción. NO almacene números de tarjeta en su servidor. Integre con Stripe/PayPal o similar para cumplir PCI-DSS.

## Cómo desplegar (paso a paso)
1. Descargar y descomprimir el ZIP en tu máquina.
2. Subir `frontend/` a GitHub Pages (repo público) - veremos pasos abajo.
3. Deploy backend (FastAPI) en un servicio como Render, Railway o Fly:
   - Crear un repo (o subir carpeta `backend/`).
   - En el servicio, crear una nueva Web Service apuntando a `backend/main.py`, establecer `pip install -r backend/requirements.txt` como comando de instalación y `uvicorn main:app --host 0.0.0.0 --port $PORT` como comando de inicio.
4. Cambiar la constante `API` en `frontend/app.js` para la URL de tu backend (ej: https://la-rotiseria-api.onrender.com).
5. Subir imágenes: coloca en `frontend/images/` las imágenes con estos nombres:
   - logo.png (logo)
   - central.jpg (imagen central)
   - product1.jpg, product2.jpg, product3.jpg (imágenes de productos)
   - banner1.jpg, banner2.jpg (banners promocionales)
6. Subir a GitHub:
   - Inicializa repo: `git init` -> `git add .` -> `git commit -m "Initial"`
   - Crear repo en GitHub y seguir sus instrucciones `git remote add origin ...` `git push -u origin main`
7. Activar GitHub Pages: en la configuración del repo, activar Pages desde la rama `main` y carpeta `/frontend` (o usar la carpeta raíz si lo prefieres). GitHub Pages servirá solo archivos estáticos; backend debe estar en servicio aparte.
8. Probar: abre la URL de Pages, luego ajusta `app.js` para apuntar al backend si es necesario.

## Cómo usar el admin demo
- En la sección "Admin", ingresar usuario: `admin`, contraseña: `admin`.
- Cambiar stock y presionar Guardar. El backend actualizará `data/products.json`.
- Cuando stock llegue a 0, el frontend mostrará "Sin stock" y deshabilitará el botón Añadir.

## Notas finales
- Reemplaza la lógica de pago demo por Stripe Elements + server-side charge para producción.
- Nunca pongas credenciales reales en repositorios públicos.
