import { ApiServices } from "@/models/utils/services/apiServices";
import type { FilterCriteria } from "@/models/utils/services/filterService";
import type { SortCriteria } from "@/models/utils/services/sortServices";
import { computed, ref, type Ref } from "vue";

export abstract class BaseStoreModel<Model, DTO, IdType> {
  private apiServices: ApiServices<Model, DTO, IdType>;
  private isFirstQuery = true;
  private mainRepository: Model[] = [];

  // Instead of a manually-updated entities ref, we use a computed property.
  // listToDisplayToUser contains just the current page's data.
  public listToDisplayToUser = ref<Model[]>([]) as Ref<Model[]>;
  public currentFilters = ref<FilterCriteria | null>(null);
  public currentSorts = ref<SortCriteria | null>(null);

  private penes = ref(true);

  // computed entities applies filtering and sorting to listToDisplayToUser
  public entities = computed(() => {
    if (this.penes.value == true || this.penes.value == false) {
      const filtered = this.applyFilters(this.listToDisplayToUser.value);
      return this.applySorts(filtered);
    }
  });

  protected startAt: number = 0;
  protected endAt: number = 0;
  public totalNumberOfEntities: number = 0;

  constructor(relativeApiPath: string, modelFacory: ModelFactory<Model>) {
    this.apiServices = new ApiServices(relativeApiPath, modelFacory);
  }

  // Derived classes must implement their own logic.
  protected abstract defaultSortingFunction(items: Model[]): Model[];
  protected abstract applyFilters(items: Model[]): Model[];
  protected abstract applySorts(items: Model[]): Model[];
  protected abstract getModelsId(item: Model): IdType;

  // Updates the local slice (the page content) from the main repository.
  private updateListToDisplay() {
    const sortedRepo = this.defaultSortingFunction(this.mainRepository);
    const updatedList = sortedRepo.slice(this.startAt, this.endAt);
    this.listToDisplayToUser.value = Array.from(updatedList);
    this.penes.value = false;
  }

  public async showAllAvailableEntitiesInMainRepository() {
    try {
      if (
        this.mainRepository.length < this.totalNumberOfEntities ||
        (this.mainRepository.length === 0 && this.totalNumberOfEntities === 0)
      ) {
        this.mainRepository = await this.apiServices.fetchAll();
      }
      this.startAt = 0;
      this.endAt = this.mainRepository.length;
      this.updateListToDisplay();
    } catch (error) {
      console.error("Error fetching all available entities:", error);
    }
  }

  public async showPartiallyAvailableEntitiesInMainRepository(
    currentPage: number,
    pageSize: number,
  ) {
    this.startAt = currentPage * pageSize;
    this.endAt = this.startAt + pageSize;
    this.updateListToDisplay();

    // If we have fewer items than the expected page size, fetch additional data.
    if (this.listToDisplayToUser.value.length < pageSize) {
      if (this.totalNumberOfEntities !== this.mainRepository.length || this.isFirstQuery) {
        this.isFirstQuery = false;
        const pagedResult = await this.apiServices.fetchPaginated(currentPage + 1, pageSize);
        if (pagedResult == null) return;
        this.totalNumberOfEntities = pagedResult.totalCount;
        this.mainRepository = this.mainRepository.concat(pagedResult.items);
        this.updateListToDisplay();
      }
    }
  }

  async addEntity(dto: DTO) {
    try {
      const newEntity = await this.apiServices.create(dto);
      this.mainRepository.push(newEntity);
      this.updateListToDisplay();
    } catch (e) {
      console.error("Error adding task", e);
    }
  }

  async updateEntity(id: IdType, dto: DTO) {
    try {
      const updatedEntity = await this.apiServices.update(id, dto);
      const index = this.mainRepository.findIndex((entity) => this.getModelsId(entity) === id);
      if (index !== -1) {
        this.mainRepository[index] = updatedEntity;
        this.updateListToDisplay();
      } else {
        console.error(`Entity with id ${id} not found in the repository.`);
      }
    } catch (e) {
      console.error("Error updating task", e);
    }
  }

  async removeEntity(id: IdType) {
    try {
      await this.apiServices.delete(id);
      this.mainRepository = this.mainRepository.filter((item) => this.getModelsId(item) != id);
      this.updateListToDisplay();
    } catch (e) {
      console.error("Error removing task", e);
    }
  }

  async getTask(id: IdType) {
    try {
      const entity = await this.apiServices.read(id);
      this.mainRepository.push(entity);
      this.updateListToDisplay();
    } catch (e) {
      console.error("Error getting task", e);
    }
  }

  handleFilter(filterData: FilterCriteria) {
    this.currentFilters.value =
      filterData.dateRange || filterData.title || filterData.completionStatus ? filterData : null;
    // Update local list so that computed entities reflect the new filter.
    this.updateListToDisplay();
  }

  handleSort(sortData: SortCriteria) {
    this.currentSorts.value = sortData.option ? sortData : null;
    this.updateListToDisplay();
  }
}
