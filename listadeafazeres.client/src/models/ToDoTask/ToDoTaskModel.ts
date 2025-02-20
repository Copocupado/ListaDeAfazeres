export class ToDoTaskModel {
  constructor(
    public id: number,
    public title: string,
    public createdAt: Date,
    public completedAt: Date | null,
  ) {}
}
export function toDoTaskModelFactory(data: any): ToDoTaskModel {
  return new ToDoTaskModel(
    data.id,
    data.title,
    new Date(data.createdAt),
    data.completedAt ? new Date(data.completedAt) : null,
  );
}
export class ToDoTaskDTO {
  constructor(
    public title: string,
    public isCompleted: boolean,
  ) {}
}
