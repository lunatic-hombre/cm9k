export interface MessageFilter {
  filter(msg: string): Promise<string>;
}
