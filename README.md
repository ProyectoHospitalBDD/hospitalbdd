# 🏥 Hospital Management System (Proyecto Bases de Datos)

## 📘 Descripción General

Este proyecto implementa un **sistema de gestión hospitalaria** desarrollado con una arquitectura de **tres niveles**:

- **Frontend:** React + Vite
- **Backend:** ASP.NET Core Web API (C#)
- **Base de Datos:** SQL Server (SSMS local)

Este repositorio forma parte del **Proyecto Final de Bases de Datos (26-1)** e incluye los módulos necesarios para gestionar usuarios, doctores, pacientes y citas médicas.

---

## 🧱 Arquitectura del Repositorio

```
📦 HospitalBD
├── api/                # Backend en ASP.NET Core (C#)
│   └── Hospital.Api/
│       ├── Controllers/
│       ├── Persistence/
│       │   ├── HospitalContext.cs
│       │   └── Models/
│       ├── Program.cs
│       └── appsettings.json
├── web/                # Frontend en React (Vite)
├── db/                 # Scripts SQL (estructura y datos iniciales)
│   ├── scripts/
│   │   ├── 001_schema.sql
│   │   └── 002_seed.sql
├── docs/               # Documentación y capturas
└── infra/              # Configuración e infraestructura (Docker, etc.)
```

---

## ⚙️ Requisitos Previos

| Componente | Versión recomendada   |
| ---------- | ---------------------- |
| .NET SDK   | 8.0 o superior         |
| SQL Server | 2022 Express / LocalDB |
| SSMS       | 19 o superior          |
| Node.js    | LTS (v20 o superior)   |
| npm        | 10+                    |
| Git        | 2.40+                  |

---

## 🚀 Instrucciones de instalación y ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd HospitalBD
git checkout dev
```

### 2️⃣ Configurar la base de datos

1. Abre **SQL Server Management Studio (SSMS)**.
2. Ejecuta el script:
   ```sql
   db/scripts/001_tablas.sql
   db/scripts/002_seed.sql
   ```
3. Verifica que la base se llama **hospitalBD**.

---

### 3️⃣ Ejecutar el Backend (API)

```bash
cd api/Hospital.Api
dotnet restore
dotnet run
```

- La API estará disponible en `http://localhost:5020` o `https://localhost:7080`
- Puedes probar los endpoints en:
  👉 [http://localhost:5020/swagger](http://localhost:5020/swagger)

---

### 4️⃣ Ejecutar el Frontend (React)

```bash
cd web
npm create vite@latest hospital-web -- --template react
cd hospital-web
npm install
npm run dev
```

Luego abre [http://localhost:5173](http://localhost:5173)
y verifica que se comunique con la API.

---

## 🧩 Conexión a la Base de Datos

En el archivo `api/Hospital.Api/appsettings.json` se define la cadena de conexión:

```json
{
  "ConnectionStrings": {
    "SqlServer": "Server=LAPTOP-KT0RGNLU\\SQLEXPRESS;Database=hospitalBD;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "AllowedHosts": "*"
}
```

---

---

## 🧠 Estado actual (Primera Entrega)

✅ Conexión establecida entre C# y SQL Server
✅ API funcional con Swagger y CORS
🚧 En desarrollo: CRUD de Doctores y Citas (con validaciones)
🚧 Próximo: Frontend React conectado a API

---

## 📄 Licencia

Proyecto académico para la materia **Bases de Datos** - ESCOM IPN 2025.
Uso educativo únicamente.
