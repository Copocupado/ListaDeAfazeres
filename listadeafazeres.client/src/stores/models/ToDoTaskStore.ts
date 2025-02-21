/**
 * Esta classe implementa a store de tarefas (ToDoTaskStore) estendendo a classe abstrata BaseStoreModel.
 *
 * Overview:
 * - Gerencia a entidade ToDoTaskModel e suas operações CRUD, paginação, filtragem e ordenação.
 * - Utiliza a classe BaseStoreModel para compartilhar lógica comum de gerenciamento de dados.
 * - Define como ordenar as tarefas (defaultSortingFunction) com base na data de criação, em ordem decrescente.
 * - Aplica filtros (applyFilters) aos itens com base em data, título e status de conclusão.
 * - Aplica ordenação (applySorts) aos itens utilizando o serviço de ordenação.
 * - Define como extrair o ID de uma tarefa (getModelsId).
 *
 * Essa implementação é um exemplo prático de como estender a BaseStoreModel para um caso específico, neste caso, uma lista de afazeres.
 */

import { ToDoTaskDTO, ToDoTaskModel } from "@/models/ToDoTask/ToDoTaskModel";
import { BaseStoreModel } from "./utils/baseModel";
import { filterItems } from "@/models/utils/services/filterService";
import { sortItems } from "@/models/utils/services/sortServices";

export class ToDoTaskStore extends BaseStoreModel<ToDoTaskModel, ToDoTaskDTO, number> {
  // Construtor que inicializa a store de tarefas, passando o endpoint "ToDoTask" e uma função de fábrica para criar instâncias de ToDoTaskModel.
  constructor() {
    super(
      "ToDoTask",
      (data: any) => new ToDoTaskModel(data.id, data.title, data.createdAt, data.completedAt),
    );
  }

  // Função de ordenação padrão que ordena as tarefas pela data de criação, da mais recente para a mais antiga.
  protected defaultSortingFunction(items: ToDoTaskModel[]): ToDoTaskModel[] {
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  // Aplica filtros aos itens com base nos critérios definidos na propriedade currentFilters.
  // - Filtra por intervalo de datas se definido.
  // - Filtra por título, verificando se o título inclui o texto informado.
  // - Filtra pelo status de conclusão, distinguindo entre concluídas e não concluídas.
  protected applyFilters(items: ToDoTaskModel[]): ToDoTaskModel[] {
    let filtered = items;
    if (this.currentFilters != null) {
      if (this.currentFilters.dateRange && this.currentFilters.dateRange.length === 2) {
        filtered = filterItems(
          filtered,
          "createdAt",
          "greaterThan",
          this.currentFilters.dateRange[0],
        );
        filtered = filterItems(filtered, "createdAt", "lessThan", this.currentFilters.dateRange[1]);
      }
      if (this.currentFilters.title && this.currentFilters.title.trim() !== "") {
        filtered = filterItems(filtered, "title", "includes", this.currentFilters.title);
      }
      if (this.currentFilters.completionStatus) {
        if (this.currentFilters.completionStatus === "completed") {
          filtered = filtered.filter((task) => task.completedAt !== null);
        } else if (this.currentFilters.completionStatus === "uncompleted") {
          filtered = filtered.filter((task) => task.completedAt === null);
        }
      }
    }
    return filtered;
  }

  // Aplica ordenação aos itens com base na propriedade currentSorts.
  // Se houver uma opção de ordenação definida, utiliza a função sortItems para ordenar os itens pelo título.
  protected applySorts(items: ToDoTaskModel[]): ToDoTaskModel[] {
    let sortedItems = items;
    if (this.currentSorts != null) {
      sortedItems = sortItems(items, "title", this.currentSorts.option ?? undefined);
    }
    return sortedItems;
  }

  // Retorna o identificador único (ID) de uma tarefa.
  protected getModelsId(item: ToDoTaskModel): number {
    return item.id;
  }
}
