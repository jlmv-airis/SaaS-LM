# SaaS LM - Instrucciones del Proyecto

Este proyecto es un SaaS construido íntegramente sobre **Google Apps Script (GAS)**, utilizando **Google Sheets** como motor de base de datos. Está diseñado para la gestión de **Legal y Materialidad**.

## 🚀 Tecnologías y Herramientas

- **Runtime:** Google Apps Script (V8).
- **Desarrollo Local:** [clasp](https://github.com/google/clasp) para sincronización de código.
- **Control de Versiones:** Git + GitHub.
- **CI/CD:** GitHub Actions (configurado en `.github/workflows/deploy.yml`).
- **Linting:** ESLint con el preset de Google.
- **Frontend:** HTML/JS/CSS (dentro de archivos `.html` servidos por GAS).

## 📁 Estructura del Proyecto

```
saas-lm/
├── .clasp.json          # Configuración de clasp (Script ID, rootDir, etc.)
├── package.json         # Dependencias de desarrollo y scripts npm
├── DEVOPS-APPSCRIPT-ROLE.md # Guía detallada de flujos de trabajo y estándares
├── src/                 # Código fuente (se sincroniza con Apps Script)
│   ├── appsscript.json  # Manifiesto del proyecto Apps Script
│   ├── Code.gs          # Punto de entrada (doGet) y lógica principal
│   ├── SheetService.gs  # Capa de abstracción de datos (CRUD sobre Sheets)
│   ├── Auth.gs          # Gestión de sesiones y validación
│   ├── Projects.gs      # Lógica de negocio para Proyectos
│   ├── Operators.gs     # Lógica de negocio para Operadores
│   ├── Index.html       # Interfaz de usuario principal
│   └── ...              # Otros módulos (.gs)
└── DATA_LM/             # Documentación externa y archivos de soporte (Excel, HTML)
```

## 🛠️ Comandos de Desarrollo

| Comando | Descripción |
|---|---|
| `npm run push` | Sube los cambios locales al script de Google (`clasp push`). |
| `npm run deploy` | Crea una nueva versión y despliega el script (`clasp deploy`). |
| `npm run lint` | Ejecuta el linter para verificar la calidad del código. |
| `npm run open` | Abre el editor de Apps Script en el navegador. |

## 🏗️ Arquitectura y Convenciones

### Base de Datos (Google Sheets)
El sistema utiliza múltiples hojas en el Spreadsheet activo como tablas:
- `Config`: Parámetros globales y estado de inicialización.
- `Operators`, `Managers`, `Projects`, `Areas`: Tablas maestras de entidades.
- `LegalSteps`, `MatSteps`: Pasos de cumplimiento y materialidad.
- `Logs`: Histórico de acciones para auditoría.

*La función `ensureSheets()` en `SheetService.gs` garantiza la existencia y estructura de estas hojas.*

### Manejo de Datos
- **Batch Operations:** Se debe minimizar el uso de `SpreadsheetApp`. Siempre preferir `getValues()` y `setValues()` sobre rangos completos en lugar de iterar sobre celdas individuales.
- **CRUD:** `SheetService.gs` proporciona funciones como `getSheetData`, `appendRow`, `updateRow`, y `deleteRow` que deben ser utilizadas como capa de persistencia.

### Frontend
- Se utiliza `HtmlService` para servir `Index.html`.
- Se emplea una función `include(filename)` para modularizar el HTML (importar CSS/JS desde otros archivos `.html`).

### Estándares de Código
- **Idiomas:** Código y comentarios preferiblemente en español (según el contexto del negocio).
- **Logging:** Utilizar `console.log` con objetos JSON estructurados para integración con Stackdriver.
- **Seguridad:** No hardcodear credenciales. Usar `PropertiesService` para secretos si fuera necesario.

## 📋 Flujo de Trabajo (Git)

1. **Ramas:** `main` (producción), `staging` (QA), `develop` (desarrollo).
2. **Features:** Crear ramas `feature/<nombre>` desde `develop`.
3. **Commits:** Seguir el estándar de Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

Para más detalles sobre el rol de DevOps y el ciclo de vida, consultar [`DEVOPS-APPSCRIPT-ROLE.md`](./DEVOPS-APPSCRIPT-ROLE.md).
