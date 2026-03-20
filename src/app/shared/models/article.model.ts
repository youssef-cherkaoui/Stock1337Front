import {Stock} from './stock.model';
import {Departement} from './departement.model';


export interface Article {
  id : number;
  name : string;
  description : string;
  quantity : number;
  minThreshold : number;
  stock? : Stock;
  departement? : Departement;
}

export interface ArticleRequest {
  name: string;
  description: string;
  quantity: number;
  minThreshold: number;
  stockId: number;
  departementId: number;
}
