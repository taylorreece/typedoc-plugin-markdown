export function escapeString(str: string) {
  return str
    .replace(/>/g, '\\>')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\|/g, '\\|');
}
