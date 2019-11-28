export function trim(str: string, ch: string): string {
  return str.replace(new RegExp(`^(?:[${ch}]*)(.*?)(?:[${ch}]*)$`), '$1');
}
export function lastChar(str: string): string {
  return str && str.charAt(str.length - 1);
}
export function titleCase(str: string): string {
  return str && str.length > 0 ? str.charAt(0).toUpperCase() + str.substring(1) : str;
}
