import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

@service(#{ title: "Calendar API" })
@info(#{ version: "1.0.0" })
@server("http://localhost:8081", "Local development server")
namespace CalendarService;

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

/** Тип события (длительность встречи), который публикует владелец календаря. */
model EventType {
  /** Уникальный идентификатор, напр. `evt_abc123`. */
  id: string;

  /** Название типа события. */
  @maxLength(100)
  title: string;

  /** Необязательное описание. */
  @maxLength(500)
  description?: string;

  /** Длительность встречи в минутах. */
  duration: 15 | 30 | 45 | 60 | 90 | 120;
}

/** Тело запроса для создания/обновления типа события. */
model CreateEventType {
  @maxLength(100)
  title: string;

  @maxLength(500)
  description?: string;

  duration: 15 | 30 | 45 | 60 | 90 | 120;
}

/** Бронирование слота гостем. */
model Booking {
  /** Уникальный идентификатор, напр. `bok_abc123`. */
  id: string;

  /** Идентификатор типа события. */
  eventTypeId: string;

  /** Имя гостя. */
  @maxLength(100)
  guestName: string;

  /** Email гостя. */
  @format("email")
  guestEmail: string;

  /** Начало встречи (UTC, ISO 8601). */
  startTime: utcDateTime;

  /** Конец встречи (UTC, ISO 8601), вычисляется из длительности. */
  endTime: utcDateTime;

  /** Момент создания брони (UTC, ISO 8601). */
  createdAt: utcDateTime;
}

/** Тело запроса для создания брони. */
model CreateBooking {
  eventTypeId: string;

  @maxLength(100)
  guestName: string;

  @format("email")
  guestEmail: string;

  /** Начало встречи (UTC, ISO 8601). */
  startTime: utcDateTime;
}

/** Временной слот в сетке доступности. */
model TimeSlot {
  /** Начало слота (UTC, ISO 8601). */
  start: utcDateTime;

  /** Конец слота (UTC, ISO 8601). */
  end: utcDateTime;

  /** Свободен ли слот. */
  isAvailable: boolean;
}

/** Унифицированный формат ошибки. */
@error
model ApiError {
  /** Машиночитаемый код, напр. `NOT_FOUND`, `CONFLICT`, `VALIDATION_ERROR`. */
  code: string;

  /** Человекочитаемое сообщение. */
  message: string;
}

model NotFoundError {
  @statusCode statusCode: 404;
  code: string;
  message: string;
}

model ValidationError {
  @statusCode statusCode: 400;
  code: string;
  message: string;
}

model ConflictError {
  @statusCode statusCode: 409;
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

@route("/api/event-types")
@tag("EventTypes")
interface EventTypes {
  /** Список всех типов событий. */
  @get list(): EventType[];

  /** Получить тип события по id. */
  @get read(@path id: string): EventType | NotFoundError;

  /** Создать тип события. */
  @post create(@body body: CreateEventType): {
    @statusCode statusCode: 201;
    @body body: EventType;
  } | ValidationError;

  /** Обновить тип события. */
  @put update(@path id: string, @body body: CreateEventType):
    | EventType
    | NotFoundError
    | ValidationError;

  /** Удалить тип события. */
  @delete delete(@path id: string): {
    @statusCode statusCode: 204;
  } | NotFoundError;
}

@route("/api/availability")
@tag("Availability")
interface Availability {
  /** Сетка слотов доступности по типу события за период. */
  @get list(
    @query eventTypeId: string,
    @query from: utcDateTime,
    @query to: utcDateTime,
  ): TimeSlot[] | ValidationError;
}

@route("/api/bookings")
@tag("Bookings")
interface Bookings {
  /** Список всех бронирований. */
  @get list(): Booking[];

  /** Получить бронирование по id. */
  @get read(@path id: string): Booking | NotFoundError;

  /** Создать бронирование. Конфликт слота возвращает 409. */
  @post create(@body body: CreateBooking): {
    @statusCode statusCode: 201;
    @body body: Booking;
  } | ValidationError | ConflictError;

  /** Удалить бронирование. */
  @delete delete(@path id: string): {
    @statusCode statusCode: 204;
  } | NotFoundError;
}
