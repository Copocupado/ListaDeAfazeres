import { app } from '@/main';
import type { ToastMessageOptions } from 'primevue/toast';


const defaultLifeTime = 3000;


const defaultStyleClass = 'backdrop-blur-md shadow-lg rounded-lg p-4';


export function showInfoToast(title = 'Information', body = 'Here is some info', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'info',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}


export function showSuccessToast(title = 'Success', body = 'Operation completed successfully', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'success',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showWarnToast(title = 'Warning', body = 'Please check your inputs', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'warn',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showErrorToast(title = 'Error', body = 'An error occurred', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'error',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showSecondaryToast(title = 'Notice', body = 'Additional details', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'secondary',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showContrastToast(title = 'Contrast', body = 'Contrast details', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'contrast',
    summary: title,
    detail: body,
    life: defaultLifeTime,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showStickyToast(title = 'Sticky', body = 'This message will remain until dismissed', customStyleClass?: string) {
  app.config.globalProperties.$toast.add({
    severity: 'info',
    summary: title,
    detail: body,
    styleClass: customStyleClass || defaultStyleClass,
  });
}

export function showCustomToast(options: {
  severity?: ToastMessageOptions["severity"];
  title?: string;
  body?: string;
  life?: number;
  sticky?: boolean;
  styleClass?: string;
} = {}) {
  app.config.globalProperties.$toast.add({
    severity: options.severity || 'info',
    summary: options.title || 'Info',
    detail: options.body || 'Default message',
    life: options.life || defaultLifeTime,
    styleClass: options.styleClass || defaultStyleClass,
  });
}
