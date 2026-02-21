# COMPLIANCE OPERATING MODEL — PYMIENTA

## 1) Objetivo
Diseñar un modelo operativo que permita escalar onboarding y operación transaccional con trazabilidad, control de riesgo y evidencia auditable.

## 2) Flujo operativo de compliance
1. Alta de cliente empresa.
2. Recolección documental (KYB + UBO + PEP).
3. Screening automático inicial (listas/sanciones/señales).
4. Scoring y clasificación de riesgo (bajo/medio/alto).
5. Aprobación automática o derivación a analista.
6. Activación con límites transaccionales iniciales.
7. Monitoreo continuo + revisiones periódicas.

## 3) Matriz mínima por nivel de riesgo
| Nivel | Alta | Límites iniciales | Revisión |
|---|---|---|---|
| Bajo | Automática con validaciones completas | Bajos/medios | Trimestral |
| Medio | Semi-manual | Medios | Mensual |
| Alto | Manual con doble aprobación | Restringidos | Semanal |

## 4) Políticas de aceptación/rechazo inicial
### Aceptar
- Clientes con actividad verificable y documentación completa.
- Flujo de fondos trazable y coherente con perfil declarado.

### Escalar a análisis manual
- Inconsistencias documentales.
- Alertas de screening o actividad inusual.
- Volumen/proyección fuera de perfil inicial.

### Rechazar
- Documentación falsa o no verificable.
- Señales graves AML/TF no mitigables.
- Negativas a aportar evidencia de origen/destino de fondos.

## 5) Verticales sensibles (ejemplo casinos)
- Política sugerida: `default = no onboarding automático`.
- Requisitos extra:
- Licencias verificables.
- Jurisdicciones permitidas explícitas.
- Controles reforzados de source of funds.
- Aprobación de Compliance Lead + Legal.

## 6) Control transaccional continuo
- Regla de umbrales por monto/frecuencia/contraparte.
- Alertas por patrones anómalos.
- Hold preventivo con SLA de revisión.
- Bitácora de decisiones por caso (quién, cuándo, por qué).

## 7) Evidencia y auditoría
Guardar por cada cliente/operación:
- Documentación presentada y versionada.
- Resultado de screenings y score histórico.
- Logs de aprobación/rechazo.
- Soporte de reconciliación y settlement.
- Reportes mensuales exportables para auditoría.

## 8) KPIs de compliance
- Tiempo medio de onboarding.
- % onboarding automático vs manual.
- Tasa de falsos positivos.
- Casos vencidos fuera de SLA.
- % operaciones observadas/resueltas en término.

## 9) RACI sugerido
| Función | Responsable |
|---|---|
| Definir políticas AML/KYC | Compliance Lead |
| Implementar reglas y casos en sistema | Compliance Tech |
| Resolver alertas operativas | Risk Ops |
| Custodia de evidencia y reportes | Compliance Ops |
| Validación contractual regulatoria | Legal |

## 10) Plan de implementación (4 semanas)
1. Semana 1: definir políticas, niveles y checklist documental final.
2. Semana 2: integrar Complif y estados de caso en backoffice.
3. Semana 3: reglas de monitoreo + colas de revisión + SLA.
4. Semana 4: dashboard de KPIs + runbook de incidentes compliance.
