export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  active: boolean;
}

export interface ProductCategory {
  name: string;
  description: string;
}
