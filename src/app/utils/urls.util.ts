import {lastChar, trim} from './strings.util';

export function path(...args: any[]): string {
  const result = args.filter(a => a).map(a => a && trim(a + '', '/')).join('/');
  return result + (lastChar(result) === '/' ? '/' : '');
}

export function isRelative(url: string): boolean {
  return !(url.startsWith('http') || url.startsWith("/"));
}
