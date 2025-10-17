export enum METHOD {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum MODEL {
  PAGE = "page",
}

export enum QUERY_PARSER {
  URLPATH = "userAttributes.urlPath",
  SLUG = "query.data.slug",
}

export const ENDPOINT = {
  BUILDER: "https://cdn.builder.io/api/v3/content",
};
