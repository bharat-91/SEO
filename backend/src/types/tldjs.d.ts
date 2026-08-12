declare module 'tldjs' {
  export interface ParsedDomain {
    tld: string | null;
    domain: string | null;
    subdomain: string | null;
    hostname: string;
  }

  export function parse(hostname: string): ParsedDomain;
}
