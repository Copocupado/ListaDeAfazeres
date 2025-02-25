/**
 * Este arquivo define uma classe abstrata BaseStoreModel que atua como store (no padrão Pinia) para gerenciar
 * entidades em uma aplicação. Ela fornece métodos genéricos para operações CRUD, paginação, filtragem e ordenação.
 *
 * Fluxo geral:
 * - Utiliza um serviço de API (ApiServices) para realizar requisições ao backend.
 * - Mantém um repositório principal (mainRepository) em um Map para evitar duplicações.
 * - Utiliza um repositório local (localRepository) para armazenar a página atual de dados a serem exibidos.
 * - Permite aplicar filtros e ordenações, atualizando a lista de entidades a serem exibidas.
 * - Implementa backups do estado atual para que, em caso de erro, o estado seja restaurado, possibilitando atualizações
 *   otimistas (optimistic UI updates).
 * - Aplica debouncing **aos chamados de API** para evitar chamadas excessivas, garantindo que apenas a última ação
 *   seja efetivada após um delay definido.
 */

import { ApiServices } from "@/models/utils/services/apiServices";
import type { FilterCriteria } from "@/models/utils/services/filterService";
import type { SortCriteria } from "@/models/utils/services/sortServices";
import { toInteger } from "lodash";

export abstract class BaseStoreModel<Model, DTO, IdType> {
  // Serviço responsável pelas requisições à API.
  private apiServices: ApiServices<Model, DTO, IdType>;
  // Flag para indicar se é a primeira consulta de dados.
  private isFirstQuery = true;

  // Repositório principal para armazenar todas as entidades, evitando duplicações.
  private mainRepository: Map<number, Model[]> = new Map();

  // Repositório local para armazenar apenas os dados da página atual.
  private localRepository: Model[] = [];

  // Lista de entidades a serem exibidas (após filtros e ordenação).
  public entities: Model[] = [];
  // Critérios de filtragem atualmente aplicados.
  public currentFilters: FilterCriteria | null = null;
  // Critérios de ordenação atualmente aplicados.
  public currentSorts: SortCriteria | null = null;
  // Número total de entidades disponíveis.
  public totalNumberOfEntities: number = 0;

  // Controle de paginação: página atual e tamanho da página.
  private currentPage: number = 0;
  private pageSize: number = 0;

  // Construtor que inicializa o serviço de API com o caminho relativo e a fábrica de modelos.
  constructor(relativeApiPath: string, modelFactory: ModelFactory<Model>) {
    this.apiServices = new ApiServices(relativeApiPath, modelFactory);
  }

  // Métodos abstratos para serem implementados nas classes derivadas:
  // Define como ordenar os itens por padrão.
  protected abstract defaultSortingFunction(items: Model[]): Model[];
  // Aplica os filtros aos itens.
  protected abstract applyFilters(items: Model[]): Model[];
  // Aplica as ordenações aos itens.
  protected abstract applySorts(items: Model[]): Model[];
  // Retorna a chave (ID) de um item.
  protected abstract getModelsId(item: Model): IdType;

  /**
   * Função genérica de debounce para atrasar a execução de funções assíncronas.
   * Se a função for chamada repetidamente dentro do período de delay, apenas a última chamada será executada.
   */

  /**
   * Método auxiliar para executar uma ação com rollback do estado em caso de erro.
   * Recebe o estado atual como backup e, se a ação falhar, restaura o estado.
   */
  private async executeWithRollback<T>(action: () => Promise<T>): Promise<T> {
    const oldLocalRepository = [...this.localRepository];
    const totalNumberOfEntities = this.totalNumberOfEntities;
    try {
      return await action();
    } catch (e) {
      this.localRepository = oldLocalRepository;
      this.totalNumberOfEntities = totalNumberOfEntities;
      throw e;
    }
  }

  /**
   * Método auxiliar que aplica debounce **aos chamados de API** com rollback.
   * Somente a última chamada durante o delay será efetivada.
   */

  // Atualiza a lista pública de entidades aplicando filtros e ordenações no repositório local.
  private async setEntities() {
    this.entities = this.applySorts(this.applyFilters(this.localRepository));
    // Se a quantidade de itens na página atual for menor que o esperado e houver mais dados disponíveis,
    // realiza nova busca para preencher a página.
    if (
      this.localRepository.length < this.pageSize &&
      this.currentPage != Math.trunc(this.totalNumberOfEntities / this.pageSize)
    ) {
      await this.showPartiallyAvailableEntitiesInMainRepository();
      return;
    }
  }

  // Atualiza o repositório local com base na paginação e atualiza a lista de entidades a exibir.
  private updateListToDisplay() {
    this.localRepository = this.mainRepository.get(this.currentPage) ?? []; // Atualiza a lista de entidades a serem exibidas.
    this.setEntities();
  }

  // Busca e armazena todas as entidades disponíveis no repositório principal.
  public async showAllAvailableEntitiesInMainRepository() {
    try {
      // Se o repositório estiver incompleto ou vazio, busca todas as entidades.
      if (
        this.mainRepository.size < this.totalNumberOfEntities ||
        (this.mainRepository.size === 0 && this.totalNumberOfEntities === 0)
      ) {
        const fetched: Model[] = await this.apiServices.fetchAll();
        // Armazena as entidades no repositório principal utilizando o ID como chave.
        this.mainRepository = new Map<number, Model[]>([[1, fetched]]);
      }
      // Inicializa a paginação: define a página 1 e o tamanho da página igual ao total de entidades carregadas.
      this.currentPage = 1;
      this.pageSize = this.mainRepository.size;
      this.updateListToDisplay();
    } catch (error) {
      throw error;
    }
  }

  private changeMainRepositoryPageBinding(oldPageSize: number, newPageSize: number): void {
    if (oldPageSize <= 0) {
      console.error("O tamanho antigo da página deve ser maior que zero.");
      return;
    }

    const allItems = Array.from(this.mainRepository.values()).flat();

    const newMap = new Map<number, Model[]>();
    for (let i = 0, pageIndex = 0; i < allItems.length; i += newPageSize, pageIndex++) {
      newMap.set(pageIndex, allItems.slice(i, i + newPageSize));
    }

    this.mainRepository = newMap;
  }

  // Busca entidades de forma paginada, completando o repositório principal se necessário.
  public async showPartiallyAvailableEntitiesInMainRepository(
    currentPage?: number,
    pageSize?: number,
  ) {
    if (this.pageSize != pageSize) {
      this.changeMainRepositoryPageBinding(this.pageSize, pageSize ?? 5);
    }
    // Atualiza os parâmetros de paginação, se fornecidos.
    this.pageSize = pageSize ?? this.pageSize;
    this.currentPage = currentPage ?? this.currentPage;

    // Atualiza o repositório local com a página atual dos dados ordenados.
    this.localRepository = this.mainRepository.get(this.currentPage) ?? [];

    // Se os itens na página forem insuficientes, tenta buscar mais dados da API.
    if (this.localRepository.length < this.pageSize) {
      if (this.totalNumberOfEntities !== this.mainRepository.size || this.isFirstQuery) {
        this.isFirstQuery = false;
        const pagedResult = await this.apiServices.fetchPaginated(
          this.currentPage + 1,
          this.pageSize,
        );
        if (pagedResult == null) return;
        this.totalNumberOfEntities = pagedResult.totalCount;
        // Adiciona os novos itens ao repositório principal.
        this.mainRepository.set(this.currentPage, pagedResult.items);
      }
    }
    this.updateListToDisplay();
  }

  // ────────────────────────────── CRUD OPERATIONS ──────────────────────────────

  // Create a new entity and add it to the current page.
  async addEntity(dto: DTO) {
    await this.executeWithRollback(async () => {
      const newEntity = await this.apiServices.create(dto);
      const pageItems = this.mainRepository.get(1) || [];
      this.mainRepository.set(0, [...pageItems, newEntity]);
      this.totalNumberOfEntities++;
      this.changeMainRepositoryPageBinding(this.pageSize, this.pageSize);
      this.updateListToDisplay();
    });
  }

  // Update an existing entity on the current page.
  async updateEntity(id: IdType, dto: DTO) {
    await this.executeWithRollback(async () => {
      const updatedEntity = await this.apiServices.update(id, dto);
      const pageItems = this.mainRepository.get(this.currentPage) || [];
      this.mainRepository.set(
        this.currentPage,
        pageItems.map((model) => (this.getModelsId(model) === id ? updatedEntity : model)),
      );
      this.updateListToDisplay();
    });
  }

  // Remove an entity from the current page.
  async removeEntity(id: IdType) {
    await this.executeWithRollback(async () => {
      await this.apiServices.delete(id);
      const pageItems = this.mainRepository.get(this.currentPage) || [];
      this.mainRepository.set(
        this.currentPage,
        pageItems.filter((model) => this.getModelsId(model) !== id),
      );
      this.totalNumberOfEntities--;
      this.changeMainRepositoryPageBinding(this.pageSize, this.pageSize);
      this.updateListToDisplay();
    });
  }

  // Retrieve a single entity by id and update the current page accordingly.
  async getEntity(id: IdType) {
    await this.executeWithRollback(async () => {
      const entity = await this.apiServices.read(id);
      const pageItems = this.mainRepository.get(this.currentPage) || [];
      // Replace any existing model with the same id or add the entity if not present.
      const updatedPageItems = [
        ...pageItems.filter((model) => this.getModelsId(model) !== id),
        entity,
      ];
      this.mainRepository.set(this.currentPage, updatedPageItems);
      this.updateListToDisplay();
    });
  }

  // Aplica filtros aos dados e atualiza a lista a ser exibida (não aplica debounce aqui, pois não é um chamado de API).
  handleFilter(filterData: FilterCriteria) {
    this.currentFilters =
      filterData.dateRange || filterData.title || filterData.completionStatus ? filterData : null;
    this.updateListToDisplay();
  }

  // Aplica a ordenação aos dados e atualiza a lista a ser exibida (não aplica debounce aqui, pois não é um chamado de API).
  handleSort(sortData: SortCriteria) {
    this.currentSorts = sortData.option ? sortData : null;
    this.updateListToDisplay();
  }
}
