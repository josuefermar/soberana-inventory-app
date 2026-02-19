# Prueba Técnica – Desarrollador Fullstack  
**Empresa:** Soberana SAS  
**Fecha:** 15/02/2025  

---

## 🎯 Objetivo General

Desarrollar una aplicación web para gestionar el conteo mensual de inventarios, permitiendo conciliar el inventario teórico con el físico e identificar diferencias para su análisis o ajuste.

---

## 📦 Contexto del Proceso

El conteo de inventarios permite:

- Garantizar precisión en registros contables  
- Identificar pérdidas, robos o mermas  
- Optimizar recursos  
- Cumplir normativas fiscales  
- Mejorar planificación logística y financiera  

---

## 📋 Lineamientos del Proceso

- Usuarios sincronizados desde API corporativa.
- El corte del inventario es el último día de cada mes.
- El conteo se realiza los 3 primeros días del mes.
- Durante el conteo no se permiten movimientos en el sistema de facturación.
- Se permiten hasta 3 conteos por mes, definidos por administradores según inconsistencias detectadas.

---

## 👥 Roles del Sistema

### 1️⃣ Usuario (Responsable de bodega)

- Accede solo al formulario de registro.
- Registra inventario únicamente en bodegas asignadas.
- Diligencia cantidades según unidad de empaque.
- El sistema calcula las unidades automáticamente.
- Se registra fecha y hora del conteo.
- Debe indicar:
  - Número de conteo (1, 2 o 3)
  - Fecha de corte
  - Bodega

---

### 2️⃣ Administrador

- Acceso total al sistema.
- Gestión de usuarios.
- Puede registrar información en todas las bodegas.
- Consulta y análisis de conteos.
- Decide cierre o repetición de conteos.

---

## 👤 Gestión de Usuarios

- Creación por parte del administrador.
- Definición de:
  - Perfil (Usuario / Administrador)
  - Credenciales
  - Bodegas asociadas (puede tener varias)
- No se requiere personalización de contraseña.
- Sincronización de 100 usuarios desde:
  - API: https://randomuser.me/api/

Se debe justificar qué campos se almacenan en base de datos.

---

## 🏢 Datos Maestros

### Bodegas

| Código | Descripción | Estado |
|--------|------------|--------|
| 00009 | Cereté | Activo |
| 00014 | Central | Activo |
| 00006 | Valledupar | Activo |
| 00090 | Maicao | Inactivo |

---

### Productos

| Código | Descripción | Unidad Inventario | Unidad Empaque | Factor Conversión |
|--------|------------|------------------|----------------|-------------------|
| 4779 | Atún Tripack 80g | UND | Caja | 12 |
| 4266 | Harina Arepa 500g x24 | UND | Arroba | 24 |
| 4442 | Harina Blanca 500g x24 | UND | Arroba | 24 |

---

### Usuarios Base

| Identificación | Nombre | Bodega |
|---------------|--------|--------|
| 80299534 | Juan Esteban Arango | Cereté |
| 43997553 | Manuel F. Grajales | Valledupar, Maicao |
| 25776298 | Santiago F. Martinez | Central |

---

## 🛠 Requisitos Técnicos

### Tecnologías

- Frontend: React o Angular  
- Backend: Django o FastAPI  
- Uso de IA permitido  

---

## 🧱 Modelo de Datos

Debe permitir:

- Hasta 3 conteos por producto por mes.
- Mantener trazabilidad histórica.
- Registrar fecha y hora de creación.

---

## 🧪 Testing

- Incluir al menos una prueba unitaria.
- Validar la lógica de conversión de unidades.

---

## 🚀 Despliegue

- Contenerización con Docker.
- Entregar guía de despliegue.
- Bonus: Implementar GitHub Actions.

---

## 📦 Entregables

- Video (máximo 10 minutos) mostrando:
  - Funcionamiento por perfil
  - Arquitectura
  - Modelo de datos
  - Testing
  - Despliegue
- Link a repositorio público en GitHub.
