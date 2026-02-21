# ARCHITECTURE MAP — PYMIENTA

## 1) Arquitectura objetivo
Modelo recomendado: `modular monolith` con límites de dominio claros y contratos internos por eventos.

## 2) Dominios de backend
| Dominio | Responsabilidad | Datos críticos |
|---|---|---|
| Identity | Usuarios, sesiones, MFA, RBAC | users, roles, sessions |
| Compliance | KYC/KYB, PEP/UBO, screening, alerts | cases, risk_flags, evidence |
| Ledger | Doble entrada, saldos, movimientos | accounts, entries, transactions |
| Payments ARS | CVU/fondeo/retiro local | transfers_local, payout_orders |
| Cross-border | Órdenes internacionales | fx_quotes, transfers_intl |
| Crypto | Ramp/off-ramp, wallets de referencia | crypto_orders, settlements |
| Investments | Remunerada y MEP | positions, yields, broker_orders |
| Reconciliation | Match proveedor vs ledger | recon_jobs, recon_diffs |
| Reporting | Reportes internos/regulatorios | reports, audit_exports |
| Notifications | Mensajes operativos y estados | notifications, templates |

## 3) Integraciones externas (adaptadores)
| Proveedor | Módulo | Patrón |
|---|---|---|
| Complif | Onboarding/compliance | API + Webhooks |
| SG Fintech | CVU/PSP local | API + Webhooks |
| Manteca | Remunerada + MEP | API + Webhooks |
| Lirium | Ramp/off-ramp crypto | API + Webhooks |
| Bridge | Cross-border | API + Webhooks |

Regla: cada integrador se implementa como `adapter` + `translator` + `retry/idempotency`.

## 4) Frontend y UX
### Frontend Apps
- `Client App` (empresa usuaria): onboarding, saldos, transferencias, inversiones, crypto.
- `Admin/Risk Console`: gestión de casos KYC/KYB, alertas AML, límites y aprobaciones.
- `Ops Backoffice`: conciliación, estados de transferencias, excepciones y soporte.

### UX no negociable
- Estados visibles por operación: `pendiente`, `en revisión`, `ejecutada`, `rechazada`, `revertida`.
- Trazabilidad por operación con timeline de eventos.
- Mensajes de error accionables (qué falta y cómo resolverlo).

## 5) Modelo de eventos mínimo
- `user_registered`
- `kyb_submitted`
- `kyb_approved`
- `wallet_funded`
- `transfer_requested`
- `transfer_settled`
- `crypto_order_filled`
- `reconciliation_failed`
- `case_escalated`

Todos los eventos deben guardar: `event_id`, `idempotency_key`, `source`, `timestamp`, `actor`.

## 6) Seguridad base
- MFA obligatorio para perfiles internos.
- Cifrado en tránsito (TLS) y en reposo.
- Gestión de secretos por entorno.
- Auditoría inmutable de acciones críticas.
- Principio de mínimo privilegio para operadores.

## 7) Stack recomendado (MVP escalable)
- Backend: `TypeScript + NestJS` o `Go` (elegir uno, no mezclar en MVP).
- DB transaccional: `PostgreSQL`.
- Cola/eventos: `SQS/RabbitMQ/Kafka` (arrancar simple con SQS/Rabbit).
- Frontend: `Next.js` + design system compartido.
- Infra: `AWS` con IaC (`Terraform`).
- Observabilidad: logs estructurados + métricas + tracing.

## 8) Decisiones de arquitectura para cerrar en semana 1
- Lenguaje/backend principal.
- Estrategia de multi-tenant (si aplica).
- Motor de idempotencia global.
- Política de versionado de APIs internas y externas.
- SLA objetivo por flujo (local/cross-border/crypto).
