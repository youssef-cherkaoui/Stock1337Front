import {Article} from './article.model';
import {Departement} from './departement.model';

export interface Stock {
  id: number;
  name: string;
  localisation: string;
  departement?: Departement;
  articles?: Article[];
}
export interface StockRequest {
  name: string;
  localisation: string;
  departementId: number;
}
