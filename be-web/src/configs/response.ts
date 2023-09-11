import { HttpStatus } from "@nestjs/common";

export interface IMetadata {
  page: number;
  limit: number;
  currentPage: number;
  count: number;
  total: number;
}

export interface IResponseToClient {
  message: string;
  statusCode: HttpStatus;
  data?: any;
  metadata?: IMetadata;
}
