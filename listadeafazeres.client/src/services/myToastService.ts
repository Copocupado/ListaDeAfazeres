import { app } from "@/main";
import type { ToastMessageOptions } from "primevue/toast";
const defaultStyleClass = "backdrop-blur-md shadow-lg rounded-lg p-4";
function getBaseLifeSpan(severity: ToastMessageOptions["severity"]): number {
  switch (severity) {
    case "success":
      return 2000;
    case "info":
      return 3000;
    case "warn":
      return 4000;
    case "error":
      return 5000;
    case "secondary":
      return 3000;
    case "contrast":
      return 3000;
    default:
      console.warn(`Unhandled toast severity: ${severity}`);
      return 3000;
  }
}
function calculateToastLife(
  severity: ToastMessageOptions["severity"],
  title: string,
  body: string,
): number {
  const contentLength = title.length + body.length;
  const readingTime = contentLength * 50;
  const baseDuration = getBaseLifeSpan(severity);
  return baseDuration + readingTime;
}

export function showToast(
  severity: ToastMessageOptions["severity"],
  title: string,
  body: string | unknown,
  customStyleClass?: string,
) {
  let message: string;

  if (body instanceof Error) {
    message = body.message;
  } else if (typeof body === "string") {
    message = body;
  } else {
    message = "Erro desconhecido";
  }

  const life = calculateToastLife(severity, title, message);
  app.config.globalProperties.$toast.add({
    severity,
    summary: title,
    detail: body,
    life,
    styleClass: customStyleClass || defaultStyleClass,
  });
}
