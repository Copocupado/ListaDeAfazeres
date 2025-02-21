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
import debounce from "lodash/debounce";

export abstract class BaseStoreModel<Model, DTO, IdType> {
  // Serviço responsável pelas requisições à API.
  private apiServices: ApiServices<Model, DTO, IdType>;
  // Flag para indicar se é a primeira consulta de dados.
  private isFirstQuery = true;

  // Repositório principal para armazenar todas as entidades, evitando duplicações.
  private mainRepository: Map<IdType, Model> = new Map();

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
  private async debounce<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number,
  ): Promise<T> {
    return debounce(fn, delay) as unknown as T;
  }

  /**
   * Método auxiliar para executar uma ação com rollback do estado em caso de erro.
   * Recebe o estado atual como backup e, se a ação falhar, restaura o estado.
   */
  private async executeWithRollback<T>(
    action: () => Promise<T>,
    backup: {
      mainRepository: Map<IdType, Model>;
      localRepository: Model[];
      totalNumberOfEntities: number;
    },
  ): Promise<T> {
    try {
      return await action();
    } catch (e) {
      // Restaura o estado anterior em caso de erro.
      this.mainRepository = backup.mainRepository;
      this.localRepository = backup.localRepository;
      this.totalNumberOfEntities = backup.totalNumberOfEntities;
      throw e;
    }
  }

  /**
   * Método auxiliar que aplica debounce **aos chamados de API** com rollback.
   * Somente a última chamada durante o delay será efetivada.
   */
  private async debouncedExecuteWithRollback<T>(
    action: () => Promise<T>,
    backup: {
      mainRepository: Map<IdType, Model>;
      localRepository: Model[];
      totalNumberOfEntities: number;
    },
    delay: number = 1000,
  ): Promise<T> {
    // Cria uma versão debounced da função de execução com rollback.
    const debouncedAction = await this.debounce(
      () => this.executeWithRollback(action, backup),
      delay,
    );
    return await debouncedAction();
  }

  // Atualiza a lista pública de entidades aplicando filtros e ordenações no repositório local.
  private async setEntities() {
    this.entities = this.applySorts(this.applyFilters(this.localRepository));
    // Se a quantidade de itens na página atual for menor que o esperado e houver mais dados disponíveis,
    // realiza nova busca para preencher a página.
    if (
      this.localRepository.length < this.pageSize &&
      this.mainRepository.size < this.totalNumberOfEntities
    ) {
      await this.showPartiallyAvailableEntitiesInMainRepository();
      return;
    }
  }

  // Atualiza o repositório local com base na paginação e atualiza a lista de entidades a exibir.
  private updateListToDisplay() {
    // Converte o repositório principal (Map) em array.
    const repoArray = Array.from(this.mainRepository.values());
    // Ordena o array usando a função de ordenação padrão.
    const sortedRepo = this.defaultSortingFunction(repoArray);
    // Seleciona a página atual com base nos índices calculados.
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);
    // Atualiza a lista de entidades a serem exibidas.
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
        const fetched = await this.apiServices.fetchAll();
        // Armazena as entidades no repositório principal utilizando o ID como chave.
        this.mainRepository = new Map(fetched.map((item) => [this.getModelsId(item), item]));
      }
      // Inicializa a paginação: define a página 1 e o tamanho da página igual ao total de entidades carregadas.
      this.currentPage = 1;
      this.pageSize = this.mainRepository.size;
      this.updateListToDisplay();
    } catch (error) {
      throw error;
    }
  }

  // Getters para cálculo dos índices de paginação.
  private get startAt(): number {
    return this.currentPage * this.pageSize;
  }
  private get endAt(): number {
    return this.startAt + this.pageSize;
  }

  // Busca entidades de forma paginada, completando o repositório principal se necessário.
  public async showPartiallyAvailableEntitiesInMainRepository(
    currentPage?: number,
    pageSize?: number,
  ) {
    // Atualiza os parâmetros de paginação, se fornecidos.
    this.pageSize = pageSize ?? this.pageSize;
    this.currentPage = currentPage ?? this.currentPage;

    // Atualiza o repositório local com a página atual dos dados ordenados.
    const repoArray = Array.from(this.mainRepository.values());
    const sortedRepo = this.defaultSortingFunction(repoArray);
    this.localRepository = sortedRepo.slice(this.startAt, this.endAt);

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
        pagedResult.items.forEach((item) => {
          const id = this.getModelsId(item);
          this.mainRepository.set(id, item);
        });
      }
    }
    this.updateListToDisplay();
  }

  // Adiciona uma nova entidade com atualização otimista, debouncing aplicado ao chamado de API e rollback em caso de erro.
  async addEntity(dto: DTO) {
    const backup = {
      mainRepository: new Map(this.mainRepository),
      localRepository: [...this.localRepository],
      totalNumberOfEntities: this.totalNumberOfEntities,
    };

    await this.debouncedExecuteWithRollback(async () => {
      const newEntity = await this.apiServices.create(dto);
      const id = this.getModelsId(newEntity);
      this.mainRepository.set(id, newEntity);
      this.totalNumberOfEntities += 1;
      this.updateListToDisplay();
    }, backup);
  }

  // Atualiza uma entidade existente com atualização otimista, debouncing aplicado ao chamado de API e rollback em caso de erro.
  async updateEntity(id: IdType, dto: DTO) {
    const backup = {
      mainRepository: new Map(this.mainRepository),
      localRepository: [...this.localRepository],
      totalNumberOfEntities: this.totalNumberOfEntities,
    };

    await this.debouncedExecuteWithRollback(async () => {
      const updatedEntity = await this.apiServices.update(id, dto);
      if (this.mainRepository.has(id)) {
        this.mainRepository.set(id, updatedEntity);
        this.updateListToDisplay();
      } else {
        throw new Error(`Entity with id ${id} not found in the repository.`);
      }
    }, backup);
  }

  // Remove uma entidade pelo ID com atualização otimista, debouncing aplicado ao chamado de API e rollback em caso de erro.
  async removeEntity(id: IdType) {
    const backup = {
      mainRepository: new Map(this.mainRepository),
      localRepository: [...this.localRepository],
      totalNumberOfEntities: this.totalNumberOfEntities,
    };

    await this.debouncedExecuteWithRollback(async () => {
      await this.apiServices.delete(id);
      this.mainRepository.delete(id);
      this.totalNumberOfEntities -= 1;
      this.updateListToDisplay();
    }, backup);
  }

  // Busca uma entidade pelo ID e atualiza o repositório, com debouncing aplicado ao chamado de API e rollback em caso de erro.
  async getEntity(id: IdType) {
    const backup = {
      mainRepository: new Map(this.mainRepository),
      localRepository: [...this.localRepository],
      totalNumberOfEntities: this.totalNumberOfEntities,
    };

    await this.debouncedExecuteWithRollback(async () => {
      const entity = await this.apiServices.read(id);
      this.mainRepository.set(this.getModelsId(entity), entity);
      this.updateListToDisplay();
    }, backup);
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
