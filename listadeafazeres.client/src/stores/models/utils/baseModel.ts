import { ApiServices } from "@/models/utils/services/apiServices";
import type { FilterCriteria } from "@/models/utils/services/filterService";
import type { SortCriteria } from "@/models/utils/services/sortServices";

export abstract class BaseStoreModel<Model, DTO, IdType> {
  private apiServices: ApiServices<Model, DTO, IdType>;
  private isFirstQuery = true;

  // The main repository is now a Map to avoid duplications.
  private mainRepository: Map<IdType, Model> = new Map();

  // A local repository that holds the current page/slice to display.
  private localRepository: Model[] = [];

  // Public properties for the filtered and sorted entities,
  // along with filter/sort criteria and total count.
  public entities: Model[] = [];
  public currentFilters: FilterCriteria | null = null;
  public currentSorts: SortCriteria | null = null;
  public totalNumberOfEntities: number = 0;

  private currentPage: number = 0;
  private pageSize: number = 0;

  constructor(relativeApiPath: string, modelFactory: ModelFactory<Model>) {
    this.apiServices = new ApiServices(relativeApiPath, modelFactory);
  }

  // Abstract methods to be implemented by derived classes.
  protected abstract defaultSortingFunction(items: Model[]): Model[];
  protected abstract applyFilters(items: Model[]): Model[];
  protected abstract applySorts(items: Model[]): Model[];
  protected abstract getModelsId(item: Model): IdType;

  // Update the public entities array based on localRepository after filtering/sorting.
  private async setEntities() {
    // Apply filtering and then sorting to the local repository.
    this.entities = this.applySorts(this.applyFilters(this.localRepository));
    if (
      this.localRepository.length < this.pageSize &&
      this.mainRepository.size < this.totalNumberOfEntities
    ) {
      await this.showPartiallyAvailableEntitiesInMainRepository();
      return;
    }
  }

  // Updates the localRepository based on pagination over the mainRepository.
  private updateListToDisplay() {
    // Convert the main repository Map to an array.
    const repoArray = Array.from(this.mainRepository.values());
    // Sort the entire repository.
    const sortedRepo = this.defaultSortingFunction(repoArray);
    // Slice out the page based on pagination.
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);
    this.setEntities();
  }

  // Fetches all entities and updates the display list.
  public async showAllAvailableEntitiesInMainRepository() {
    try {
      if (
        this.mainRepository.size < this.totalNumberOfEntities ||
        (this.mainRepository.size === 0 && this.totalNumberOfEntities === 0)
      ) {
        const fetched = await this.apiServices.fetchAll();
        // Convert the fetched array into a Map keyed by the entity's id.
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

  // Fetches a subset of entities based on pagination and updates the display list.
  public async showPartiallyAvailableEntitiesInMainRepository(
    currentPage?: number,
    pageSize?: number,
  ) {
    this.pageSize = pageSize ?? this.pageSize;
    this.currentPage = currentPage ?? this.currentPage;
    const repoArray = Array.from(this.mainRepository.values());
    const sortedRepo = this.defaultSortingFunction(repoArray);
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);

    // If the current page has fewer items than expected, fetch additional data.
    if (this.localRepository.length < this.pageSize) {
      if (this.totalNumberOfEntities !== this.mainRepository.size || this.isFirstQuery) {
        this.isFirstQuery = false;
        const pagedResult = await this.apiServices.fetchPaginated(
          this.currentPage + 1,
          this.pageSize,
        );
        if (pagedResult == null) return;
        this.totalNumberOfEntities = pagedResult.totalCount;
        // Add new items to the main repository, avoiding duplicates.
        pagedResult.items.forEach((item) => {
          const id = this.getModelsId(item);
          this.mainRepository.set(id, item);
        });
      }
    }
    this.updateListToDisplay();
  }

  // Adds a new entity to the repository and updates the display list.
  async addEntity(dto: DTO) {
    // Backup current state.
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
      // Restore backup state and rethrow error.
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      this.totalNumberOfEntities = backupTotal;
      throw e;
    }
  }

  // Updates an existing entity in the repository and updates the display list.
  async updateEntity(id: IdType, dto: DTO) {
    // Backup current state.
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
      // Restore backup state and rethrow error.
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      throw e;
    }
  }

  // Removes an entity from the repository and updates the display list.
  async removeEntity(id: IdType) {
    // Backup current state.
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];
    const backupTotal = this.totalNumberOfEntities;

    try {
      await this.apiServices.delete(id);
      this.mainRepository.delete(id);
      this.totalNumberOfEntities -= 1;
      this.updateListToDisplay();
    } catch (e) {
      // Restore backup state and rethrow error.
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      this.totalNumberOfEntities = backupTotal;
      throw e;
    }
  }

  // Fetches a single entity and adds it to the repository.
  async getEntity(id: IdType) {
    // Backup current state.
    const backupMainRepository = new Map(this.mainRepository);
    const backupLocalRepository = [...this.localRepository];

    try {
      const entity = await this.apiServices.read(id);
      this.mainRepository.set(this.getModelsId(entity), entity);
      this.updateListToDisplay();
    } catch (e) {
      // Restore backup state and rethrow error.
      this.mainRepository = backupMainRepository;
      this.localRepository = backupLocalRepository;
      throw e;
    }
  }

  // Sets the current filters and updates the display list.
  handleFilter(filterData: FilterCriteria) {
    this.currentFilters =
      filterData.dateRange || filterData.title || filterData.completionStatus ? filterData : null;
    this.updateListToDisplay();
  }

  // Sets the current sorting criteria and updates the display list.
  handleSort(sortData: SortCriteria) {
    this.currentSorts = sortData.option ? sortData : null;
    this.updateListToDisplay();
  }
}
