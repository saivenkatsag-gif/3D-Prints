export type CartItem = {
  lineId: string;          // productId + chosen options, so identical configs merge
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;       // price for the chosen size
  qty: number;
  colour?: string;
  size?: string;
  text?: string;
  font?: string;
  textColour?: string;
  notes?: string;
  referenceImageUrl?: string;
};

export type Customer = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
};
