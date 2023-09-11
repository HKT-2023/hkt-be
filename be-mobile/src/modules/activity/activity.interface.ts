export interface IActivity {
  transactionType: string;
  transactionDescription: string;
  transactionId: string;
  content: string;
  _id: string;
  accountId: string;
  updatedAt: Date;
  createdAt: Date;
  memo: string;
  gasFee: string;
  nftName: string;
  royalty: string;
  status: boolean;
}
