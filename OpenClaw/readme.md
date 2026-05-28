# Implementación de Asistente Inteligente con OpenClaw y Azure DevOps

repositorio de GitHub: https://David-Triana55@github.com/David-Triana55/Ingeniria_procesos.git

## Descripción general

Este proyecto consiste en la implementación de un asistente inteligente conectado a Azure DevOps mediante OpenClaw y una API desarrollada con Node.js y Express.

El objetivo principal fue construir un flujo capaz de consultar información relacionada con bugs y work items desde lenguaje natural, utilizando servicios desplegados en una máquina virtual Ubuntu dentro de AWS EC2.

---


# Tecnologías utilizadas

| Tecnología       | Uso                     |
| ---------------- | ----------------------- |
| Node.js          | Backend                 |
| Express          | API REST                |
| Axios            | Consumo HTTP            |
| Azure DevOps API | Obtención de work items |
| OpenClaw         | Asistente inteligente   |
| AWS EC2          | Infraestructura cloud   |
| Ubuntu Server    | Sistema operativo       |
| SSH              | Administración remota   |

---

# Desarrollo del proyecto

---

# 1. Creación de la infraestructura en AWS

Se creó una instancia EC2 con Ubuntu Server para desplegar la solución.

Durante esta etapa se realizó:

* Configuración de la máquina virtual.
* Generación y descarga de claves PEM.
* Configuración de grupos de seguridad.
* Apertura de puertos necesarios.

## Adjuntar imagen aquí

<p align="center">
  <img src="Images/image.png" width="900">
</p>
---

# 2. Configuración de acceso SSH

Posteriormente se realizó la conexión remota mediante SSH utilizando la clave PEM descargada desde AWS.

Comando utilizado:

```bash id="rd1"
ssh -i clave.pem ubuntu@IP_PUBLICA
```

## Adjuntar imagen aquí


<p align="center">
  <img src="Images/image-1.png" width="900">
</p>

---

# 3. Instalación del entorno de desarrollo

Dentro de la máquina virtual se instalaron:

* Node.js
* npm
* OpenClaw

Comandos utilizados:

```bash id="rd2"
sudo apt update
```

```bash id="rd3"
sudo apt install nodejs npm
```

```bash id="rd4"
npm install -g openclaw
```

## Adjuntar imagen aquí


<p align="center">
  <img src="Images/image-2.png" width="500">
</p>

---

# 4. Configuración inicial de OpenClaw

Se realizó el proceso de onboarding de OpenClaw para inicializar el entorno del agente.

Comando ejecutado:

```bash id="rd5"
openclaw onboard
```

Durante esta etapa se configuró:

* Modelo base.
* Gateway local.
* Dashboard web.
* Configuración inicial del agente.

## Adjuntar imagen aquí

<p align="center">
  <img src="Images/image-3.png" width="900">
</p>
---

# 5. Desarrollo de la API REST

Se desarrolló una API utilizando Express para consultar información desde Azure DevOps.

La API implementó endpoints para:

* Obtener bugs activos.
* Obtener detalle de work items.

## Estructura utilizada

```text id="rd6"
project/
│
├── server.js
├── azure.js
├── .env
└── package.json
```

---

# 6. Integración con Azure DevOps

Se utilizó la API oficial de Azure DevOps mediante autenticación con Personal Access Token (PAT).

Se realizaron consultas utilizando WIQL para obtener work items.

## Variables de entorno

```env id="rd7"
AZURE_ORG=
AZURE_PROJECT=
AZURE_PAT=
```


<p align="center">
  <img src="Images/image-4.png" width="900">
</p>

---

# 7. Exposición de endpoints

La API fue expuesta mediante el puerto 3000 de la instancia EC2.

Endpoints implementados:

```http id="rd8"
GET /bugs
```

```http id="rd9"
GET /bugs/:id
```

<p align="center">
  <img src="Images/image-5.png" width="900">
</p>


<p align="center">
  <img src="Images/image-6.png" width="900">
</p>

---

# 8. Integración con OpenClaw

Finalmente se realizaron pruebas de integración entre OpenClaw y la API desarrollada.

El objetivo fue permitir que el asistente pudiera consultar información de Azure DevOps desde lenguaje natural.

## Flujo implementado

```text id="rd10"
Usuario
   ↓
OpenClaw
   ↓
API Express
   ↓
Azure DevOps
```
---

# 9 Integración con whatsapp


<p align="center">
  <img src="Images/image-7.png" width="900">
</p>


<p align="center">
  <img src="Images/image-8.png" width="900">
</p>