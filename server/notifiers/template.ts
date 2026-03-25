import type { NotifyPayload } from "./types";

export function renderTemplate(template: string, payload: NotifyPayload): string {
  const { monitor, result } = payload;
  const status = result.isUp ? "RECOVERED" : "DOWN";

  const vars: Record<string, string> = {
    "monitor.name": monitor.name,
    "monitor.url": monitor.url,
    "monitor.method": monitor.method,
    status,
    statusCode: result.statusCode?.toString() ?? "N/A",
    responseTime: result.responseTime ? `${result.responseTime}ms` : "N/A",
    error: result.errorMessage ?? "",
    timestamp: new Date().toISOString(),
  };

  return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (_, key: string) => {
    const trimmed = key.trim();
    return vars[trimmed] ?? `{{${trimmed}}}`;
  });
}

export const DEFAULT_TEMPLATE =
  "[{{status}}] {{monitor.name}}\nURL: {{monitor.url}}\nStatus: {{statusCode}} | Response: {{responseTime}}\n{{error}}";
