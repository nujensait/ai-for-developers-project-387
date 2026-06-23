const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export interface GuestFormErrors {
  guestName?: string;
  guestEmail?: string;
}

export function validateGuest(values: {
  guestName: string;
  guestEmail: string;
}): GuestFormErrors {
  const errors: GuestFormErrors = {};
  if (!values.guestName.trim()) {
    errors.guestName = 'Укажите имя';
  } else if (values.guestName.trim().length > 100) {
    errors.guestName = 'Не более 100 символов';
  }
  if (!values.guestEmail.trim()) {
    errors.guestEmail = 'Укажите email';
  } else if (!isValidEmail(values.guestEmail)) {
    errors.guestEmail = 'Некорректный email';
  }
  return errors;
}
