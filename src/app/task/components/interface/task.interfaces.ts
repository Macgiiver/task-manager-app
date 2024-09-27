export interface Task {
    title: string;
    deadline: Date;
    completed: boolean;
    persons: Person[];
}

export interface Person {
    name: string;
    age: number;
    skills: string[];
}
