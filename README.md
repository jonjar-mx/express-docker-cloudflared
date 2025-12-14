# Express API + Cloudflare Tunnel (Docker)

Este proyecto levanta una **API en Express** expuesta de forma segura mediante **Cloudflare Tunnel**, sin abrir puertos públicos y usando Docker.

Incluye:
- API Express mínima
- Cloudflare Tunnel dedicado para la API
- Arranque automático tras reinicio
- Configuración limpia (sin credenciales en el repo)

---

## 📁 Estructura del proyecto

```text
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── src/
│   └── index.js
├── cloudflared/
│   ├── config.example.yml
│   └── credentials.example.json
└── README.md

    ⚠️ Nunca subas config.yml ni *.json reales de Cloudflare.

🚀 Requisitos

    Docker

    Docker Compose

    Cuenta en Cloudflare

    Dominio gestionado en Cloudflare

    Cloudflared instalado en la máquina host

🧠 Concepto

    La API corre solo dentro de Docker

    Cloudflare Tunnel se conecta desde dentro del contenedor

    Cloudflare expone el servicio al exterior

    No se abre ningún puerto en la máquina

🛠️ Instalación en una máquina nueva
1️⃣ Clonar el repositorio

git clone https://github.com/tuusuario/express-docker-cloudflared.git
cd express-docker-cloudflared

2️⃣ Crear el túnel en Cloudflare

Autentica Cloudflare en la máquina:

cloudflared login

Crea el túnel:

cloudflared tunnel create api-tunnel

Obtendrás:

    Tunnel UUID

    Archivo UUID.json (credenciales)

3️⃣ Configurar Cloudflared
📄 cloudflared/config.yml

tunnel: <TUNNEL_UUID>
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: api.midominio.com
    service: http://api:3000
  - service: http_status:404

📄 cloudflared/credentials.json

Copia el contenido del archivo UUID.json generado por Cloudflare.
4️⃣ Configurar DNS del túnel

cloudflared tunnel route dns api-tunnel api.midominio.com

5️⃣ Levantar los contenedores

docker compose up -d --build

6️⃣ Verificar

curl https://api.midominio.com/health

Respuesta esperada:

{ "status": "ok" }

🔁 Arranque automático tras reinicio

Este proyecto usa restart: unless-stopped, por lo que:

    Docker se inicia al arrancar la máquina

    Los contenedores se levantan solos

    El túnel vuelve a estar online automáticamente

Verifica que Docker arranca al boot:

sudo systemctl enable docker

❌ Errores comunes y soluciones
🔴 Error 1033 (Cloudflare)

Causa:
El túnel no está levantado o no puede conectar con la API.

Solución:

docker logs api-tunnel

Verifica:

    credentials.json existe

    config.yml apunta al servicio correcto (http://api:3000)

    El contenedor api está corriendo

🔴 Connection refused en localhost

Causa:
La API no expone puertos al host (esto es correcto).

Solución:
Prueba desde dentro del contenedor:

docker exec -it api wget -qO- http://localhost:3000/health

🔴 El subdominio ya existía (A, AAAA o CNAME)

Error típico:

An A, AAAA, or CNAME record with that host already exists

✅ Opción A — El DNS ya apunta al túnel correcto

En Cloudflare → DNS, verifica:

    Tipo: CNAME

    Target: <UUID>.cfargotunnel.com

    Proxy: 🟠 Activado

👉 Si coincide con el túnel de la API, no hagas nada.
❌ Opción B — El DNS apunta a otro lugar

Ejemplos:

    Apunta a una IP

    Apunta al túnel de la web

    Proxy desactivado

Solución:

    Borra el registro DNS existente

    Ejecuta nuevamente:

cloudflared tunnel route dns api-tunnel api.midominio.com

🔴 Devuelve HTML 404 en vez de JSON

Causa:
El subdominio apunta a la web, no a la API.

Solución:

    Revisa el hostname en config.yml

    Asegúrate de que el túnel correcto maneja ese subdominio

🔐 Seguridad

    No se exponen puertos públicos

    El túnel usa mTLS

    Las credenciales no deben versionarse

    Usa .gitignore para proteger secretos

📌 Regla de oro

    Un subdominio = un túnel

Ejemplo correcto:

    midominio.com → túnel web

    api.midominio.com → túnel API

🧹 Buenas prácticas

    Un túnel por servicio

    Un contenedor por responsabilidad

    Nunca reutilices hostnames

    Versiona solo archivos .example

🧪 Healthcheck recomendado

GET /health

Respuesta:

{ "status": "ok" }
