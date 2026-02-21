# ROADMAP 90/180 — PYMIENTA

## 1) Objetivo de negocio
Construir una plataforma fintech B2B/B2B2C operable con foco en:
- Flujos locales ARS (CVU/PSP).
- Cross-border (Bridge).
- Ramp/off-ramp crypto (Lirium).
- Cuenta remunerada + MEP (Manteca).
- Onboarding y compliance (Complif).

## 2) Principios operativos
- El `ledger` interno es la fuente de verdad.
- Cada proveedor entra por adaptador desacoplado.
- Todo evento crítico debe auditarse y reconciliarse.
- No lanzar feature sin controles de riesgo/compliance mínimos.

## 3) Roadmap 0-90 días (ejecución)
| Iniciativa | Owner sugerido | Prioridad | Semana objetivo | KPI de éxito |
|---|---|---|---|---|
| Definir arquitectura objetivo y modelo de dominios | CTO/Product Tech | P0 | 1-2 | Blueprint aprobado |
| Implementar Auth + RBAC + MFA para app y backoffice | Backend Lead | P0 | 2-4 | 100% usuarios internos con MFA |
| Implementar Core Ledger (doble entrada) | Backend Lead | P0 | 2-6 | 100% operaciones nuevas en ledger |
| Integración Complif (onboarding/KYC/KYB) | Compliance Tech | P0 | 4-8 | Tasa de onboarding automatizado >70% |
| Integración SG Fintech (CVU/fondeo/retiro ARS) | Payments Lead | P0 | 5-9 | Primer flujo ARS E2E en prod controlada |
| Backoffice de casos (KYC, alertas, rechazos) | Fullstack Lead | P1 | 6-10 | SLA de resolución <24h |
| Reconciliación automática v1 (SG + ledger) | Ops Tech | P0 | 8-12 | >95% conciliación T+1 automática |
| UX de onboarding + home transaccional | Product Design | P1 | 6-12 | Activación (alta a primera operación) <48h |

## 4) Roadmap 90-180 días (escala)
| Iniciativa | Owner sugerido | Prioridad | Mes objetivo | KPI de éxito |
|---|---|---|---|---|
| Integración Manteca (remunerada + MEP) | Investments Lead | P0 | 4-5 | Primer cliente operando flujo MEP |
| Integración Lirium (ramp/off-ramp) | Crypto Lead | P0 | 4-5 | Volumen mensual crypto inicial activo |
| Integración Bridge (cross-border productizado) | Cross-border Lead | P0 | 4-6 | Tiempo de operación internacional <24h |
| Motor de límites/riesgo dinámico por cliente | Risk Lead | P1 | 5-6 | Reducción de rechazos manuales >30% |
| Reporting regulatorio + auditoría exportable | Compliance Lead | P0 | 5-6 | Reportes mensuales sin retrabajo manual |
| Observabilidad completa (APM, alertas, runbooks) | SRE/Platform | P1 | 5-6 | MTTR <60 min en incidentes críticos |

## 5) Dependencias críticas externas
- Credenciales sandbox + prod por proveedor.
- Documentación técnica privada (webhooks, errores, rate limits, SLA).
- Definición contractual de responsabilidades (reversas, contracargos, disputas).

## 6) Cadencia de gestión recomendada
- Weekly exec: estado P0, bloqueos y decisiones.
- Weekly product-tech: avance por dominio y deuda técnica.
- Monthly steering: KPIs, runway, riesgos regulatorios.

## 7) Riesgos principales
- Dependencia de terceros sin fallback.
- Falta de reconciliación temprana.
- Cuellos de botella manuales en compliance.
- Alcance excesivo sin priorización P0/P1.
