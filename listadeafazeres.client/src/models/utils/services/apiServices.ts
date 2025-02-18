class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

interface ApiParameters {
  urlParams?: string;
  options?: RequestInit;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
class ApiServices<Model, DTO, IdType> {
  private apiPath: string;
  private createModel: ModelFactory<Model>;

  constructor(relativeApiRoute: string, createModel: ModelFactory<Model>) {
    this.apiPath = `/api/${relativeApiRoute}`;
    this.createModel = createModel;
  }

  private async request<T>(apiParameters?: ApiParameters): Promise<T> {
    try {
      const finalApiUrl = apiParameters?.urlParams
        ? `${this.apiPath}/${apiParameters.urlParams}`
        : this.apiPath;

      console.log(finalApiUrl);
      const finalOptions = apiParameters?.options;

      const response = await fetch(finalApiUrl, finalOptions);

      if (!response.ok) {
        const errorText = await response.text();

        throw new ServiceError(
          `HTTP error ${response.status}: ${response.statusText}. ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        const regex = /(\{.*\})/;
        const match = error.message.match(regex);
        if (match && match[0]) {
          const jsonPart = JSON.parse(match[0]);

          throw new ServiceError(`Chamada falhou: ${jsonPart.message}`);
        } else {
          throw new ServiceError(`Chamada falhou: ${error.message}`);
        }
      } else {
        throw new ServiceError("Um erro desconhecido ocorreu!");
      }
    }
  }

  public async fetchAll(): Promise<Model[]> {
    const data = await this.request<any[]>();
    if (data == null) return [];
    return data.map((item: any) => this.createModel(item));
  }

  public async create(data: Partial<DTO>): Promise<Model> {
    const apiParams: ApiParameters = {
      urlParams: undefined,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    };
    const responseData = await this.request<any>(apiParams);
    return this.createModel(responseData);
  }

  public async read(id: IdType): Promise<Model> {
    const apiParams: ApiParameters = {
      urlParams: `/${id}`,
    };

    const data = await this.request<any>(apiParams);
    return this.createModel(data);
  }

  public async update(id: IdType, data: Partial<DTO>): Promise<Model> {
    const apiParams: ApiParameters = {
      urlParams: `/${id}`,
      options: {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    };
    const responseData = await this.request<any>(apiParams);
    return this.createModel(responseData);
  }

  public async delete(id: IdType): Promise<void> {
    const apiParams: ApiParameters = {
      urlParams: `/${id}`,
      options: {
        method: "DELETE",
      },
    };
    await this.request<void>(apiParams);
  }
}

export { ApiServices, ServiceError };
