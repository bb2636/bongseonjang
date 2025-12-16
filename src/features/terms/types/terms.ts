export type TermsType = 'SERVICE';

export interface TermsContent {
  id: number;
  type: TermsType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
