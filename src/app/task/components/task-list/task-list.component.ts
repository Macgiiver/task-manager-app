import { Component, OnInit } from '@angular/core';
import { Task } from '../interface/task.interfaces';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})

export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filterStatus: 'all' | 'completed' | 'pending' = 'all'
  searchTerm: string = '';
  filteredTasks: Task[] = [];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskService.tasks$.subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.filterTasks();
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesTitle = task.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'completed' && task.completed) ||
        (this.filterStatus === 'pending' && !task.completed);
      return matchesTitle && matchesStatus;
    });
  }

  ngOnChanges(): void {
    this.filterTasks();
  }
}
