class ToDoTaskModel {
    constructor(
        public id: number,
        public title: string,
        public createdAt: Date,
        public completedAt: Date | null
    ) {}
}

export {
    ToDoTaskModel
}