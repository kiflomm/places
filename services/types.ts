export type OfficeType = {
    id: string;
    name: string;
  };
  
export type Office = {
    id: string;
    name: string;
    type: OfficeType;
    status: string;
    isActive: boolean;
    cityId: string;
};