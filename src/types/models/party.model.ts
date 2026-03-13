export interface Party {
  readonly id: number;
  name: string;
  logo: string;
  description?: string;
  foundedDate?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
