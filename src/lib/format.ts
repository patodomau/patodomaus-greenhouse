export function formatGold(value: number | null) {
  if (value == null) {
    return "n/d";
  }

  const normalized = value < 100 ? roundNumber(value, 2) : Math.round(value);
  return `${Number(normalized).toLocaleString("pt-BR")} gp`;
}

export function formatNumber(value: number | null) {
  if (value == null) {
    return "n/d";
  }

  return Number(value).toLocaleString("pt-BR");
}

export function formatTimestamp(value: string | null) {
  if (!value) {
    return "n/d";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function roundNumber(value: number | null, digits = 2) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}
