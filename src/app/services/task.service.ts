import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../task/components/interface/task.interfaces';


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor() { }

  private tasks = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasks.asObservable();

  addTask(task: Task) {
    const currentTasks = this.tasks.value;
    this.tasks.next([...currentTasks, task]);
  }

  updateTasks(tasks: Task[]) {
    this.tasks.next(tasks);
  }
}
