import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateToPortuguese(date: Date) {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm:ss", {
    locale: ptBR,
  });
}
