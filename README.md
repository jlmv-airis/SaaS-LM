# SaaS LM

SaaS construido en Google Apps Script sobre Google Sheets.

## Stack

- **Runtime:** Google Apps Script (V8)
- **Desarrollo local:** clasp
- **CI/CD:** GitHub Actions
- **Testing:** Jest + gas-local
- **Control de versiones:** Git + GitHub

## Estructura del proyecto

```
saas-lm/
├── .clasp.json
├── .claspignore
├── package.json
├── src/
│   ├── main.js
│   ├── services/
│   ├── utils/
│   ├── models/
│   ├── ui/
│   └── config/
├── tests/
└── dist/
```

## Entornos

| Entorno | Rama | Script ID |
|---|---|---|
| Development | develop | ... |
| Staging | staging | ... |
| Production | main | ... |

Ver [`DEVOPS-APPSCRIPT-ROLE.md`](./DEVOPS-APPSCRIPT-ROLE.md) para el flujo completo de trabajo DevOps.
