export type Field = { key: keyof Company; label: string };
export interface Company {
  id: number;
  name: string;
  country: string;
  email: string;
  date: string;
  ceo: string;
  website: string;
  logo: string;
}
