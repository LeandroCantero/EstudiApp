export interface Credit {
  id: string;
  userId: string;
  category: string;
  activity: string;
  credits: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditDto {
  category: string;
  activity: string;
  credits: number;
}
