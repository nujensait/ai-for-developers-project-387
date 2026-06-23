# 📅 Календарь — Frontend

React-приложение сервиса бронирования времени «Календарь».
Работает поверх backend-API (Symfony) и строго следует API-контракту (Design First).

## 🧱 Стек

- **React 18** + **TypeScript**
- **Vite** — сборка и dev-сервер
- **React Router v6** — маршрутизация
- **TanStack Query** (react-query) — запросы, кэш, инвалидация
- **Tailwind CSS** + компоненты в стиле **shadcn/ui** (Radix UI)
- **date-fns** — работа с датами
- **react-day-picker** — календарь выбора даты
- **sonner** — тосты

## 🚀 Запуск

Требуется **Node.js 22**. Backend должен быть доступен на `http://localhost:8081`.

```bash
cd frontend
npm install
npm run dev
```

Приложение: **http://localhost:5173**

### Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | dev-сервер с hot-reload (порт 5173) |
| `npm run build` | проверка типов (`tsc --noEmit`) + production-сборка в `dist/` |
| `npm run preview` | локальный предпросмотр собранного `dist/` |
| `npm run lint` | проверка типов без сборки |

## ⚙️ Переменные окружения

Файл `.env` (см. `.env.example`):

```env
VITE_API_URL=http://localhost:8081
```

`VITE_API_URL` — базовый URL backend-API. Если не задан, используется `http://localhost:8081`.

## 🐳 Docker (dev)

`Dockerfile.dev` запускает Vite dev-сервер с hot-reload. Через корневой `docker-compose.yml`:

```bash
# из корня проекта
docker-compose up -d            # backend + frontend
# либо только фронтенд
docker-compose up -d frontend
```

Из браузера фронтенд обращается к backend по `VITE_API_URL` (по умолчанию хостовый порт `8081`).

## 🗺️ Страницы

| Маршрут | Назначение |
|---------|------------|
| `/` | Список типов событий, кнопка «Записаться» |
| `/booking/:eventTypeId` | Выбор даты (14 дней) → слоты (30 мин, 09:00–21:00 UTC) → форма гостя → подтверждение |
| `/admin` | Таблица бронирований + CRUD типов событий, отмена брони |

## 🔌 Используемые эндпоинты API

| Метод | Эндпоинт |
|-------|----------|
| `GET` | `/api/event-types` |
| `POST` | `/api/event-types` |
| `PUT` | `/api/event-types/{id}` |
| `DELETE` | `/api/event-types/{id}` |
| `GET` | `/api/availability?eventTypeId=&from=&to=` |
| `GET` | `/api/bookings` |
| `POST` | `/api/bookings` |
| `DELETE` | `/api/bookings/{id}` |

Ошибки backend (`{ code, message }`) разбираются в `ApiError`; конфликт слота (`409`)
показывает тост и предлагает выбрать другое время.

## 📂 Структура

```
frontend/
├── public/                 # статика (иконка)
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn/ui: button, card, dialog, input, table, calendar, ...
│   │   ├── layout/         # Header, Layout
│   │   ├── BookingForm.tsx
│   │   ├── EventTypeCard.tsx
│   │   ├── EventTypeFormDialog.tsx
│   │   ├── SlotPicker.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── ErrorBoundary.tsx / ErrorState.tsx / Spinner.tsx
│   ├── hooks/api.ts        # React Query хуки
│   ├── lib/                # api.ts, queryClient.ts, datetime.ts, validation.ts, utils.ts
│   ├── pages/              # HomePage, BookingPage, AdminPage
│   ├── types/api.ts        # типы API-контракта
│   ├── App.tsx / main.tsx / index.css
├── .env / .env.example
├── Dockerfile.dev
├── vite.config.ts / tailwind.config.js / tsconfig*.json
└── package.json
```

## 🕐 О времени (UTC)

Слоты доступности и времена бронирований отображаются в **UTC** — значения читаются
напрямую из ISO-строк API. Это сохраняет сетку рабочих часов 09:00–21:00 неизменной
независимо от часового пояса браузера и соответствует UTC-логике backend.

## 📝 Лицензия

MIT © Hexlet
