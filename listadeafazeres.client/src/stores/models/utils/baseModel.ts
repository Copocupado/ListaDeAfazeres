import { ApiServices } from "@/models/utils/services/apiServices";
import type { FilterCriteria } from "@/models/utils/services/filterService";
import type { SortCriteria } from "@/models/utils/services/sortServices";

export abstract class BaseStoreModel<Model, DTO, IdType> {
  private apiServices: ApiServices<Model, DTO, IdType>;
  private isFirstQuery = true;

  private mainRepository: Map<IdType, Model> = new Map();

  private localRepository: Model[] = [];

  public entities: Model[] = [];
  public currentFilters: FilterCriteria | null = null;
  public currentSorts: SortCriteria | null = null;
  public totalNumberOfEntities: number = 0;

  private currentPage: number = 0;
  private pageSize: number = 0;

  constructor(relativeApiPath: string, modelFactory: ModelFactory<Model>) {
    this.apiServices = new ApiServices(relativeApiPath, modelFactory);
  }

  protected abstract defaultSortingFunction(items: Model[]): Model[];
  protected abstract applyFilters(items: Model[]): Model[];
  protected abstract applySorts(items: Model[]): Model[];
  protected abstract getModelsId(item: Model): IdType;

  private async setEntities() {
    this.entities = this.applySorts(this.applyFilters(this.localRepository));
    if (
      this.localRepository.length < this.pageSize &&
      this.mainRepository.size < this.totalNumberOfEntities
    ) {
      await this.showPartiallyAvailableEntitiesInMainRepository();
      return;
    }
  }

  private updateListToDisplay() {
    const repoArray = Array.from(this.mainRepository.values());
    const sortedRepo = this.defaultSortingFunction(repoArray);
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);
    this.setEntities();
  }

  public async showAllAvailableEntitiesInMainRepository() {
    try {
      if (
        this.mainRepository.size < this.totalNumberOfEntities ||
        (this.mainRepository.size === 0 && this.totalNumberOfEntities === 0)
      ) {
        const fetched = await this.apiServices.fetchAll();
        this.mainRepository = new Map(fetched.map((item) => [this.getModelsId(item), item]));
      }
      this.currentPage = 1;
      this.pageSize = this.mainRepository.size;
      this.updateListToDisplay();
    } catch (error) {
      throw error;
    }
  }

  private get startAt(): number {
    return this.currentPage * this.pageSize;
  }
  private get endAt(): number {
    return this.startAt + this.pageSize;
  }

  public async showPartiallyAvailableEntitiesInMainRepository(
    currentPage?: number,
    pageSize?: number,
  ) {
    this.pageSize = pageSize ?? this.pageSize;
    this.currentPage = currentPage ?? this.currentPage;
    const repoArray = Array.from(this.mainRepository.values());
    const sortedRepo = this.defaultSortingFunction(repoArray);
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);

    if (this.localRepository.length < this.pageSize) {
      if (this.totalNumberOfEntities !== this.mainRepository.size || this.isFirstQuery) {
        this.isFirstQuery = false;
        const pagedResult = await this.apiServices.fetchPaginated(
          this.currentPage + 1,
          this.pageSize,
        );
        if (pagedResult == null) return;
        this.totalNumberOfEntities = pagedResult.totalCount;
        pagedResult.items.forEach((item) => {
          const id = this.getModelsId(item);
          this.mainRepository.set(id, item);
        });
      }
    }
    this.updateListToDisplay();
  }

  async addEntity(dto: DTO) {
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];
    const backupTotal = this.totalNumberOfEntities;

    try {
      const newEntity = await this.apiServices.create(dto);
      const id = this.getModelsId(newEntity);
      this.mainRepository.set(id, newEntity);
      this.totalNumberOfEntities += 1;
      this.updateListToDisplay();
    } catch (e) {
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      this.totalNumberOfEntities = backupTotal;
      throw e;
    }
  }

  async updateEntity(id: IdType, dto: DTO) {
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];

    try {
      const updatedEntity = await this.apiServices.update(id, dto);
      if (this.mainRepository.has(id)) {
        this.mainRepository.set(id, updatedEntity);
        this.updateListToDisplay();
      } else {
        throw new Error(`Entity with id ${id} not found in the repository.`);
      }
    } catch (e) {
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      throw e;
    }
  }

  async removeEntity(id: IdType) {
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];
    const backupTotal = this.totalNumberOfEntities;

    try {
      await this.apiServices.delete(id);
      this.mainRepository.delete(id);
      this.totalNumberOfEntities -= 1;
      this.updateListToDisplay();
    } catch (e) {
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      this.totalNumberOfEntities = backupTotal;
      throw e;
    }
  }

  async getEntity(id: IdType) {
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];

    try {
      const entity = await this.apiServices.read(id);
      this.mainRepository.set(this.getModelsId(entity), entity);
      this.updateListToDisplay();
    } catch (e) {
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      throw e;
    }
  }

  handleFilter(filterData: FilterCriteria) {
    this.currentFilters =
      filterData.dateRange || filterData.title || filterData.completionStatus ? filterData : null;
    this.updateListToDisplay();
  }

  handleSort(sortData: SortCriteria) {
    this.currentSorts = sortData.option ? sortData : null;
    this.updateListToDisplay();
  }
}
