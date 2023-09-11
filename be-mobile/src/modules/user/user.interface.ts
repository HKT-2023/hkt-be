export interface IRankingPoint {
  _id: string;
  userId: string;
  point: number;
  rank: number;
}

export interface IUserRankingPoint extends IRankingPoint {
  userImage: string;
  userName: string;
}

