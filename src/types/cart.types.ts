export interface CartItem {
  sku: string;
  name: string;
  presentationLabel: string;
  unitPrice: number | null;
  quantity: number;
}
