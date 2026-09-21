export interface Company {
  name: string;
  legalStatus: string;
  businessType: string;
  additionalBusiness: string[];
  ceo: string;
  registeredAddress: string;
  employees: string;
  gstRegistrationDate: string;
  turnover: string;
  gstNumber: string;
  iec: string;
  mission: string;
  vision: string;
}

export interface Market {
  name: string;
  region: string;
}

export interface Brand {
  name: string;
  storeLink: string;
}
