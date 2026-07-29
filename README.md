# Heimdall SOC

**Всё из ваших инструментов. Одна консоль. С первого взгляда.**

Heimdall — консоль аналитиков и руководства от [Svalbard Security](https://svalbard.ca/). Она **собирает и оркестрирует** телеметрию и действия из инструментов, которые у вас уже есть — Splunk, Microsoft Sentinel, Microsoft Defender, CrowdStrike Falcon, Okta, MDO, Proofpoint и других — чтобы SOC видел картину по всей среде и реагировал, не прыгая между порталами.

---

## Чем является Heimdall

| Heimdall **это** | Heimdall **это не** |
|---|---|
| Мультивендорный **консолидатор SOC** | С нуля построенный SIEM или озеро логов |
| Единый цикл: triage → investigate → contain → case → board | EDR / агент на конечных точках |
| Оболочка оркестрации поверх коннекторов | Замена Defender, Falcon, Splunk или Sentinel |
| Одна организация (один tenant) | Мультитенант / MSSP |
| Compliance, связанный с IR, рядом с расследованием | Непрерывный GRC уровня Vanta |

**Обещание:** нормализовать алерты, активы, кейсы и действия реагирования из апстрим-сенсоров в одну консоль с учётом ролей. Апстрим-инструменты остаются системой записи телеметрии и нативного containment; Heimdall владеет **историей аналитика** и кросс-инструментальной оркестрацией.

---

## Быстрый старт

```bash
pnpm install
pnpm run dev
```

Демо-вход: `ava.reed@svalbard.ca` / `demodemo123`

После входа используйте **View as…** в шапке, чтобы переключать персоны SOC (CISO, Tier-1, Legal и т.д.). Это **ACL по должности для демо**, а не смена организации.

**Стек:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · nuqs · TipTap · XYFlow · MapLibre · Recharts · pnpm ≥ 11.17 · Node ≥ 22

---

## Как устроена консоль сейчас

Этот репозиторий — высокодетальная **демо-консоль**. Плоскость данных по умолчанию — **mock**; продакшен-бэкенд не нужен.

```text
Страницы App Router (тонкие)
  → src/components/* centers (UI)
    → src/lib/mock-api/* клиенты (типизированные контракты)
      → session / in-memory stores (+ часть чеков в localStorage)
```

| Слой | Путь | Роль |
|---|---|---|
| Маршруты | `src/app/(admin)/**` | Тонкие обёртки страниц |
| UI | `src/components/**` | Продуктовые поверхности |
| Mock API | `src/lib/mock-api/**` | Источник истины для UI-контрактов |
| Адаптеры | `src/lib/api-adapters/**` | Переключатель `mock` \| `live` (`plane.ts`) |
| Персоны | `src/lib/soc-roles.ts` | ACL навигации + домашние пути |
| Источники | `src/lib/source-registry.ts` | Семейства телеметрии для Overview / Investigate |

Мутирующие вызовы возвращают **`ActionReceipt`** и обычно пишут в **аудит-лог**. Containment в mock-режиме может сохранять чеки в `localStorage`.

```bash
# .env.local — для локальных демо оставляйте mock
HEIMDALL_DATA_PLANE=mock
# HEIMDALL_DATA_PLANE=live
# HEIMDALL_API_BASE_URL=https://api.example.com
# AI_GATEWAY_API_KEY=...   # опциональный путь Assist через Next BFF
```

При `live` адаптеры ходят в `HEIMDALL_API_BASE_URL` + `/api/v1/...`. UI по-прежнему импортирует `*Api` из `src/lib/mock-api` — реализации меняются за клиентами без переписывания экранов.

### Единый UI (модули)

Все модульные экраны используют общие примитивы из `src/components/soc/`:

- **StatsStrip** — KPI-полоса в шапке модуля (число колонок = число метрик)
- **Panel / PanelHeading** — единая поверхность карточек
- **OverviewSplit / PanelGrid** — строки overview без «пустых» ячеек сетки

Паттерны зафиксированы в `.interface-design/system.md`.

---

## Целевая архитектура бэкенда

**Реальный бэкенд в этом репозитории не реализуется.** Ниже — дизайн отдельного сервиса Heimdall API, чтобы клиенты в [`src/lib/mock-api/`](src/lib/mock-api/) при `HEIMDALL_DATA_PLANE=live` ходили на `HEIMDALL_API_BASE_URL` + `/api/v1/...` без переписывания React-центров. Контракты типов: [`src/lib/mock-api/types.ts`](src/lib/mock-api/types.ts) и доменные файлы рядом.

### Правила продукта → следствия для бэкенда

| Правило | Следствие |
|---|---|
| Одна организация (не MSSP) | Нет `tenantId` в API/UI. Один клиент = один контур данных |
| Консолидатор, не SIEM/EDR | Не храним озеро логов. Fan-out в Splunk/Sentinel/…; у себя — алерты, кейсы, активы, runs |
| Vendor SDK только на сервере | Секреты в vault; браузер видит статус коннекторов и `ActionReceipt` |
| Каталог SOAR из коннекторов | Actions = capabilities **подключённых и здоровых** интеграций, не статичный JSON во фронте |
| Плейбуки = контент | Стартовые пакеты Svalbard + builder клиента + (опц.) черновик Assist |

### Топология

```text
                 Heimdall Console (Next.js)
                          │  HTTPS
                 Heimdall API  /api/v1   (≥2 реплики, stateless)
                    │         │         │
              PostgreSQL   Redis/Queue  Object store (evidence, экспорты)
                    │         │
                    └──── Connector + playbook workers ──▶ Secrets vault
                                      │
                 Splunk · Sentinel · Defender · Falcon · Okta · MDO · SNOW · …
```

Потоки:

1. **Ingest** — worker → нормализация → `alerts` → (опц.) correlation.
2. **Contain / notify / itsm** — API или шаг playbook → очередь → worker + vault → upstream → `action_receipts` + `audit_events`.
3. **Playbook run** — engine читает graph → ветки / retry / SLA → approvals при `requires_approval`.
4. **Investigate** — трансляция QL → fan-out по `sourceIds` → нормализованные hits (без локального озера).
5. **Assist** — retrieval по alerts/incidents/assets/runs (+ опц. LLM); contain только через каталог + approval.

### Инстансы на одного клиента

Рекомендация на старте: **выделенный контур на клиента** (проще security, residency, blast radius). Shared SaaS с `org_id` — позже; MSSP — non-goal.

| Компонент | Prod на клиента | Dev/staging |
|---|---|---|
| API (`heimdall-api`) | **≥ 2** за LB | 1 |
| Connector workers (ingest + act) | **2–4+** (от EPS и числа коннекторов) | 1 |
| Playbook engine worker | **≥ 2** | 1 |
| PostgreSQL | **1 primary** (+ replica HA) | 1 |
| Redis / очередь | **1** кластер на контур | 1 |
| Object storage | **1** bucket | 1 / MinIO |
| Secrets vault | **1** на окружение | 1 |
| Assist / LLM gateway | **0–1** (или внешний; fallback = heuristic) | опционально |

Не делать отдельную БД/сервис «на каждый коннектор» или «на каждый плейбук».

### Каталог SOAR и плейбуки

**Каталог действий (бэкенд):**

1. Коннектор в коде объявляет capabilities (`ingest` \| `contain` \| `notify` \| `itsm` \| `enrich` \| …) и actions (`isolate_host`, `purge_mailbox`, …) с `requiresApproval` и JSON Schema параметров.
2. При `POST /integrations/connect` сохраняются endpoint, field map, `credentials_ref` (в vault).
3. `GET /actions` = объединение actions всех **enabled + healthy** коннекторов.
4. Builder UI показывает только этот каталог. Нет исполнителя → действие недоступно.
5. Рост каталога = новые/глубже коннекторы, не ручные строки во фронте.

Минимум коннекторов для MVP ingest + contain: `int-splunk-core`, `int-sentinel-workspace`, `int-defender-endpoint`, `int-crowdstrike-falcon`, `int-okta-workforce`, `int-mdo-email` / `int-proofpoint`, `int-servicenow` / `int-jira-secops`. Полный список UI: `src/lib/source-registry.ts` + admin integrations.

**Плейбуки (контент, не «скачать с интернета»):**

| Источник | Кто | Как |
|---|---|---|
| Стартовые пакеты | Svalbard | 10–20 золотых графов, связаны с KB procedures |
| Builder | SOC eng клиента | Шаги ссылаются на `action_id` из каталога; версионирование в БД |
| Assist | Модель → человек | Черновик из инцидента/Attack Story → review → publish; contain без approval запрещён |

### Схема PostgreSQL (ядро)

Одна БД на контур клиента. Сырые full-fidelity логи SIEM **не** храним — только `raw_ref` / deep-link / нормализованный hit. Object store: evidence и экспорты по ключу `incident_id/…`.

```text
-- Identity / admin
users, teams, team_members
api_keys, scim_state, break_glass_sessions
audit_events          -- каждый ActionReceipt + war-room @mentions
retention_policies

-- Integrations
integrations          -- catalog_id, endpoint, status, scopes, field_map, credentials_ref
connector_health

-- SOC ops
alerts, incidents, incident_alerts, incident_war_room, incident_evidence
correlation_links

-- Assets / exposure (нормализованный кэш)
devices, identities, ueba_anomalies
vuln_findings, cspm_findings, dlp_findings, phishing_messages
ti_indicators, detection_rules

-- Automation
playbook_definitions, playbook_versions
playbook_runs, playbook_run_steps, playbook_approvals
action_receipts

-- Прочее
investigate_saved, itsm_links, itsm_sync_events
```

Индексы минимум: `alerts(status, severity, created_at)`, `incidents(status, priority)`, `action_receipts(at)`, `audit_events(at)`, `playbook_runs(status)`, `integrations(status)`.

### Общие контракты ответа

```ts
type ActionOutcome = "ok" | "simulated" | "failed";

type ActionReceipt = {
  id: string;
  at: string; // ISO-8601
  outcome: ActionOutcome;
  message: string;
  connectorId?: string;
  connectorName?: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
  externalRef?: string; // id в Defender / Falcon / Splunk / …
};

type ListResult<T> = { items: T[]; total: number };

type AccessRole = "Owner" | "Admin" | "Analyst" | "Responder" | "Viewer";
type SocJobRole =
  | "c_level" | "ciso" | "soc_manager"
  | "analyst_t1" | "analyst_t2" | "analyst_t3"
  | "legal_procurement";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  accessRole: AccessRole;
  jobRole: SocJobRole;
  teamIds: string[];
};

type ConnectorCapability = "ingest" | "contain" | "notify" | "itsm" | "enrich";

type ConnectIntegrationInput = {
  integrationId: string;
  endpoint: string;
  healthUrl?: string;
  scopes: Array<"read" | "contain" | string>;
  fieldMap: Record<string, string>;
  credentialsRef: string; // vault / OAuth — сырые секреты в UI не отдаём
};
```

Мутации возвращают `ActionReceipt` и пишут в `audit_events`. Демо сегодня: `localStorage` `soc.auth.session`. В проде: OIDC + JWT/cookie; `accessRole` enforced на сервере.

### API endpoints (`/api/v1`)

База: `{HEIMDALL_API_BASE_URL}/api/v1`. Списки — `ListResult<T>`, ошибки — HTTP 4xx/5xx + тело с `message`. Уже есть BFF-заготовки в репо: `assist/triage`, `investigate/query`, `response/actions`.

#### Auth / session

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/auth/login` | OIDC / session (prod); демо — вне scope |
| `POST` | `/auth/logout` | Завершение сессии |
| `GET` | `/auth/me` | Текущий `SessionUser` |

#### Alerts · `alertsApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/alerts` | Список (+ фильтры query) |
| `GET` | `/alerts/{id}` | Деталь |
| `PATCH` | `/alerts` | Bulk patch (status, assignee, …) → receipt |
| `POST` | `/alerts/escalate` | Создать / привязать incident из alert ids |

#### Incidents · `incidentsApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/incidents` | Список |
| `GET` | `/incidents/{id}` | Деталь (war room, story, evidence meta) |
| `PATCH` | `/incidents` | Bulk patch |
| `POST` | `/incidents/from-alerts` | Создать кейс из алертов |
| `POST` | `/incidents/{id}/war-room` | Сообщение (+ @mentions → audit) |
| `POST` | `/incidents/{id}/evidence` | Мета evidence (+ upload в object store) |
| `POST` | `/incidents/{id}/disrupt` | Пакет contain через коннекторы |

#### Correlation · `correlationApi`

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/correlation/propose` | Кандидаты + confidence |
| `POST` | `/correlation/link` | Связать alerts → incident |
| `POST` | `/correlation/merge` | Слить кейсы |
| `POST` | `/correlation/split` | Отколоть alerts в новый кейс |
| `GET` | `/correlation/links` | История связей |
| `POST` | `/correlation/links/{id}/undo` | Откат связи |

#### Investigate · `investigateApi`

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/investigate/query` | Fan-out QL/SPL/KQL → events + stats + receipt |
| `GET` | `/investigate/saved` | Сохранённые фокусы |
| `POST` | `/investigate/saved` | Сохранить запрос |
| `GET` | `/investigate/history` | История запусков |

Тело query: `{ query, sourceIds[], timeRange }`. Heimdall **не** заменяет SIEM-озеро.

#### Response · `responseApi`

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/response/actions` | Одно действие contain/remediate |

Тело: `{ action, targetType, targetId, connectorId, incidentId? }` → `ActionReceipt` с `externalRef`. `action` из каталога (`isolate-host`, `disable-identity`, `purge-mailbox`, …).

#### Actions (SOAR catalog) · `actionCatalogApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/actions` | Каталог из healthy-коннекторов (+ `version`) |
| `GET` | `/actions/{id}` | Одна запись |
| `GET` | `/actions?family=contain` | Фильтр по family |

#### Playbooks · `playbooksApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/playbooks` | Определения |
| `GET` | `/playbooks/{id}` | Graph + meta |
| `PUT` | `/playbooks/{id}` | Сохранить graph (новая version) |
| `POST` | `/playbooks/{id}/runs` | Старт run (alert/incident trigger) |
| `GET` | `/playbooks/runs/{runId}` | Статус run / steps |
| `POST` | `/playbooks/runs/{runId}/steps/{stepId}/retry` | Retry шага |
| `GET` | `/playbooks/approvals` | Очередь dual-control |
| `POST` | `/playbooks/approvals/{id}/approve` | Approve |
| `POST` | `/playbooks/approvals/{id}/reject` | Reject |

#### Phishing · `phishingApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/phishing/messages` | Очередь |
| `GET` | `/phishing/messages/{id}` | Деталь |
| `POST` | `/phishing/messages` | Ingest / user-reported |
| `POST` | `/phishing/messages/{id}/verdict` | Вердикт |
| `POST` | `/phishing/messages/{id}/remediate` | Purge / block / revoke |
| `POST` | `/phishing/messages/{id}/link-incident` | Привязка к кейсу |
| `POST` | `/phishing/messages/{id}/open-incident` | Открыть кейс |

#### ITSM · `itsmApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/itsm/links` | Связки тикетов (`?incidentId=`) |
| `POST` | `/itsm/tickets` | Create в SNOW/Jira |
| `POST` | `/itsm/links` | Link существующего |
| `POST` | `/itsm/links/{id}/sync-push` | Push полей |
| `POST` | `/itsm/links/{id}/sync-pull` | Pull полей |
| `PATCH` | `/itsm/links/{id}` | Обновить meta |
| `GET` | `/itsm/sync-events` | Журнал синка |

#### Assets · `assetsApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/assets/devices` | Инвентарь устройств |
| `GET` | `/assets/identities` | Инвентарь identities (+ UEBA summary) |
| `PATCH` | `/assets/devices/{id}` | Patch |
| `PATCH` | `/assets/identities/{id}` | Patch |

#### Vulns / CSPM / Data security

| Метод | Путь | Клиент | Назначение |
|---|---|---|---|
| `GET` | `/vulns` | `vulnsApi` | Findings |
| `GET` | `/vulns/{id}` | | Деталь / by CVE |
| `PATCH` | `/vulns/{id}` | | Статус / owner |
| `POST` | `/vulns/{id}/open-incident` | | Открыть кейс |
| `GET` | `/cloud-posture/findings` | `cloudPostureApi` | CSPM |
| `PATCH` | `/cloud-posture/findings/{id}` | | Patch / remediate |
| `POST` | `/cloud-posture/findings/{id}/open-incident` | | Открыть кейс |
| `GET` | `/data-security/findings` | `dataSecurityApi` | DLP/CASB |
| `GET` | `/data-security/policies` | | Политики |
| `GET` | `/data-security/saas-apps` | | SaaS inventory |
| `GET` | `/data-security/timeline` | | Exfil timeline |
| `PATCH` | `/data-security/findings/{id}` | | Patch |
| `POST` | `/data-security/findings/{id}/open-incident` | | Открыть кейс |

#### Detections · `detectionsApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/detections` | Rules |
| `GET` | `/detections/{id}` | Деталь |
| `PATCH` | `/detections/{id}` | Body / status |
| `POST` | `/detections/{id}/clone` | Clone |
| `POST` | `/detections/{id}/test` | Test vs corpus |
| `POST` | `/detections/{id}/deploy/stage` | Stage |
| `POST` | `/detections/{id}/deploy/validate` | Validate |
| `POST` | `/detections/{id}/deploy/push` | Push |
| `POST` | `/detections/{id}/deploy/rollback` | Rollback |
| `POST` | `/detections/packs/import` | Marketplace pack → rules |
| `POST` | `/detections/{id}/promote-hunt` | Promote → hunt |

#### Threat intelligence · `tiApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/ti/indicators` | IOCs |
| `GET` | `/ti/feeds` | Feeds |
| `PATCH` | `/ti/feeds/{id}` | pause / status |
| `GET` | `/ti/taxii/collections` | TAXII |
| `POST` | `/ti/stix/import` | Import bundle |
| `POST` | `/ti/taxii/collections/{id}/sync` | Sync → indicators |

(Actors, dark-web, ASM — те же префиксы `/ti/...` по мере выноса из UI-stores.)

#### Compliance · `complianceApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/compliance/controls` | Контроли |
| `GET` | `/compliance/findings` | Findings |
| `GET` | `/compliance/probes` | Continuous probes |
| `GET` | `/compliance/collectors` | Collectors |
| `PATCH` | `/compliance/controls/{id}` | Patch |
| `PATCH` | `/compliance/findings/{id}` | Patch |
| `POST` | `/compliance/retest` | Retest ids |
| `POST` | `/compliance/evidence/request` | Запрос evidence |
| `POST` | `/compliance/collectors/run` | Run collectors |
| `POST` | `/compliance/probes/{id}/run` | Run probe |
| `POST` | `/compliance/auditor-packs/export` | Export pack |

#### Assist · `assistApi`

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/assist/triage` | План triage (heuristic \| model) |
| `POST` | `/assist/investigate` | Multi-hop plan + story draft + contain recs |
| `POST` | `/assist/apply-attack-story` | Применить draft к incident |
| `POST` | `/assist/run-recommended-contain` | Contain из recs (через response + approvals) |

Режим `model` опционален; без ключей — `heuristic`.

#### Integrations · `integrationsApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/integrations` | Каталог + статус |
| `GET` | `/integrations/{id}/config` | Config (без секретов) |
| `GET` | `/integrations/activity` | Activity / health timeline |
| `POST` | `/integrations/connect` | Connect (`ConnectIntegrationInput`) |
| `POST` | `/integrations/{id}/sync` | Sync now |
| `POST` | `/integrations/{id}/disconnect` | Disconnect |
| `PATCH` | `/integrations/{id}/health` | Health sample (internal/worker) |
| `POST` | `/integrations/idp/configure` | IdP configure |

#### Admin / enterprise · `adminEnterpriseApi`

| Метод | Путь | Назначение |
|---|---|---|
| `GET/PUT` | `/admin/retention` | Политики retention |
| `GET` | `/admin/api-keys` | Список |
| `POST` | `/admin/api-keys` | Mint |
| `POST` | `/admin/api-keys/{id}/revoke` | Revoke |
| `GET` | `/admin/scim` | SCIM status |
| `POST` | `/admin/scim/refresh` | Refresh |
| `GET` | `/admin/break-glass` | Sessions |
| `POST` | `/admin/break-glass` | Start |
| `POST` | `/admin/break-glass/{id}/end` | End |

#### Прочее

| Метод | Путь | Клиент | Назначение |
|---|---|---|---|
| `GET` | `/audit` | `auditApi` | Immutable audit |
| `GET` | `/metrics/soc-performance` | (сейчас на клиенте) | MTTA/MTTC/FP/ROI |
| `GET` | `/on-call/schedule` | `onCallApi` | Расписание |
| `POST` | `/on-call/page` | | Page on-call |
| `GET/POST` | `/trainings…` | `trainingsApi` | LMS enroll/complete/sync |
| `GET/POST` | `/purple-team/…` | будущий клиент | BAS campaigns + drift |

### Чеклист до `HEIMDALL_DATA_PLANE=live`

- [ ] OIDC (Entra/Okta), серверные сессии, enforcement `accessRole`, опционально SCIM
- [ ] Контур клиента: ≥2 API, workers, Postgres (+ replica), Redis, object store, vault
- [ ] Durable stores: alerts, incidents, evidence, playbook runs, audit
- [ ] Connector workers: ingest + contain/notify/itsm с `externalRef`
- [ ] Каталог `GET /actions` из capabilities коннекторов
- [ ] Playbook engine: durable runs, ветки, retry, SLA, approvals
- [ ] Investigate façade: трансляция в SPL/KQL/… по `sourceIds`
- [ ] Assist grounding (+ опц. LLM); fallback heuristic
- [ ] ITSM bi-directional sync + политика конфликтов
- [ ] Каждый `ActionReceipt` + war-room `@mentions` → immutable audit
- [ ] Retention / residency enforced на сервере
- [ ] Секреты никогда в браузер

---

## Демо-сценарий (для покупателя)

На каждом шаге подчёркивайте **across your tools**:

1. Вход → **View as… CISO**.
2. **Overview** — полоса ingest (Splunk/Defender/Falcon/…), unified risk, SOC performance.
3. **Alerts** — корреляция (confidence) → link/merge → escalate в кейс.
4. Кросс-источниковый кейс → **Attack Story** → Assist multi-hop → apply draft → **Run disruption** (через коннекторы Defender/Falcon/Okta).
5. **Mailbox security** — user-reported / BEC → remediate через MDO/Proofpoint.
6. **Automation → Approvals** — approve/reject containment; ветки + SLA.
7. Панель **ITSM** инцидента — ServiceNow/Jira create + sync push/pull.
8. **Investigate** — чипы мульти-источников (включая NDR/firewall/DNS); pivot по entity.
9. Marketplace **Detections**; **Purple team** BAS; покрытие **MITRE**.
10. Полный suite **Vulnerabilities**; **Data security** DLP/CASB → open incident.
11. Корреляция **Dark web / ASM**; evidence packs **Compliance**; **TI** STIX/TAXII.
12. **Admin → Enterprise** retention / API keys / SCIM / break-glass (демо).
13. **/on-call** — критическая очередь → approve contain / ответ в war-room.
14. **View as… C-Level** → скачать board pack.

---

## Явные non-goals

- Мультитенант / MSSP
- Замена Splunk, Sentinel, Falcon или Defender как сенсоров или озёр
- Живые vendor SDK в браузере
- Непрерывные GRC-коллекторы глубины Vanta (только probe stubs + evidence packs)
- Доставка продакшен-бэкенда внутри этого frontend-репозитория (сначала документ; реализация позже)

---

## Лицензия / вендор

Heimdall · [Svalbard Security](https://svalbard.ca/)
