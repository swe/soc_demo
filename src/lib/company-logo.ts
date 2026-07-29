export const COMPANY_LOGO_STORAGE_KEY = "company-logo";
export const COMPANY_LOGO_CHANGE_EVENT = "company-logo-change";

export const COMPANY_LOGO_MAX_BYTES = 1024 * 1024;
export const COMPANY_LOGO_ACCEPT =
  "image/png,image/jpeg,image/webp,image/svg+xml,image/gif";

export function readCompanyLogo(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(COMPANY_LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeCompanyLogo(dataUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMPANY_LOGO_STORAGE_KEY, dataUrl);
  window.dispatchEvent(
    new CustomEvent<string | null>(COMPANY_LOGO_CHANGE_EVENT, {
      detail: dataUrl,
    }),
  );
}

export function clearCompanyLogo() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent<string | null>(COMPANY_LOGO_CHANGE_EVENT, {
      detail: null,
    }),
  );
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
