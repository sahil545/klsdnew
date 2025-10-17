export interface IQueryParam {
  key: string;
  value: string;
}

export interface IGetDataProps {
  model: string;
  fields?: string;
  query?: IQueryParam[];
  cache?: boolean;
  unpublished?: boolean;
}

export interface IFetchRequestProps {
  method: string;
  model: string;
  fields?: string;
  query?: IQueryParam[];
  cache?: boolean;
  unpublished?: boolean;
  offset?: number;
  limit?: number;
}
