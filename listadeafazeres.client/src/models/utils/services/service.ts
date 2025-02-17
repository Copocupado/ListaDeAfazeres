class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

class Services<Model, DTO, IdType> {
  private apiPath: string;
  private createModel: ModelFactory<Model>;

  constructor(relativeApiRoute: string, createModel: ModelFactory<Model>) {
    this.apiPath = `/api/${relativeApiRoute}`;
    this.createModel = createModel;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new ServiceError(
          `HTTP error ${response.status}: ${response.statusText}. ${errorText}`
        );
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new ServiceError(`Request failed: ${error.message}`);
      }
      throw new ServiceError('An unknown error occurred.');
    }
  }

  public async fetchAll(): Promise<Model[]> {
    const data = await this.request<any[]>(this.apiPath);
    if (data == null) return [];
    return data.map((item: any) => this.createModel(item));
  }

  public async create(data: Partial<DTO>): Promise<Model> {
    const responseData = await this.request<any>(this.apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.createModel(responseData);
  }

  public async read(id: IdType): Promise<Model> {
    const data = await this.request<any>(`${this.apiPath}/${id}`);
    return this.createModel(data);
  }

  public async update(id: IdType, data: Partial<DTO>): Promise<Model> {
    const responseData = await this.request<any>(`${this.apiPath}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.createModel(responseData);
  }

  public async delete(id: IdType): Promise<void> {
    await this.request<void>(`${this.apiPath}/${id}`, {
      method: 'DELETE',
    });
  }
}

export { Services, ServiceError };
