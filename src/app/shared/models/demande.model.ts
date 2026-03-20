import {User} from './user.model';
import {Article} from './article.model';

export interface Demande {
  id: number;
  article?: Article;
  quantityRequired: number;
  dateTime: string;
  statut: StatutDemande;
  causeRefus?: CauseRefus;
  user?: User;
}

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

export enum CauseRefus {
  RUPTURE_STOCK = 'RUPTURE_STOCK',
  QUANTITE_INSUFFISANTE = 'QUANTITE_INSUFFISANTE',
  ARTICLE_INEXISTANT = 'ARTICLE_INEXISTANT',
  DEMANDE_INCORRECTE = 'DEMANDE_INCORRECTE'
}
