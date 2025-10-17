import {
  IQueryParam,
  IFetchRequestProps,
  IGetDataProps,
} from "./interfaces";
import { METHOD, ENDPOINT, MODEL, QUERY_PARSER } from "./constants";

class FetchRequest {
  private endpoint: string;

  constructor() {
    this.endpoint = ENDPOINT.BUILDER;
  }

  async fetchRequest({
    method,
    model,
    fields = "",
    query = [],
    cache = true,
    unpublished = false,
    offset = 0,
    limit = 100,
  }: IFetchRequestProps) {
    try {
      let queryString = "";
      query?.map((each: IQueryParam) => {
        queryString += `&${each.key}=${each.value}`;
      });
      const response = await fetch(
        `${this.endpoint}/${model}?apiKey=${process.env.NEXT_PUBLIC_BUILDER_API_KEY}${queryString}&fields=${fields}&includeUnpublished=${unpublished}&limit=${limit}&offset=${offset}`,
        {
          method,
          cache: cache ? "default" : "no-cache",
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  async getData({
    model,
    fields = "",
    query = [],
    cache = true,
    unpublished = false,
  }: IGetDataProps) {
    try {
      const response = await this.fetchRequest({
        method: METHOD.GET,
        model,
        fields,
        query,
        cache,
        unpublished,
      });
      const content = await response.json();
      return content;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  async getPageByUrl(urlPath: string) {
    try {
      const response = await this.fetchRequest({
        method: METHOD.GET,
        model: MODEL.PAGE,
        query: [
          {
            key: QUERY_PARSER.URLPATH,
            value: urlPath,
          },
        ],
        cache: false,
      });
      const content = await response.json();
      return content;
    } catch (error) {
      console.error("Error fetching page:", error);
      throw error;
    }
  }
}

export default new FetchRequest();
