export type TermsType = 'SERVICE' | 'PRIVACY_POLICY' | 'PURCHASE_POLICY';

export interface TermsContent {
  id: number;
  type: TermsType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
