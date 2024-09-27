import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css']
})
export class TaskManagerComponent {

  taskForm: FormGroup;

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4)]],
      deadline: ['', Validators.required],
      status: [false],
      persons: this.fb.array([], this.atLeastOnePersonValidator)
    });
  }

  get persons() {
    return this.taskForm.get('persons') as FormArray;
  }

  atLeastOnePersonValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const personsArray = control as FormArray;
    return personsArray.length > 0 ? null : { 'noPersons': true };
  }

  ngOnInit(): void {
    this.taskForm.statusChanges.subscribe((status) => {
      console.log('Estado del formulario:', status);
    });
  }

  numberOnlyValidator = (): ValidatorFn => {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const isValid = /^[0-9]*$/.test(value);
      return isValid ? null : { 'invalidNumber': true };
    };
  }

  addPerson() {
    const personGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      age: ['', [Validators.required, Validators.min(18), this.numberOnlyValidator()]],
      skills: this.fb.array([this.fb.control('', Validators.required)])
    });
    this.persons.push(personGroup);
    this.persons.updateValueAndValidity();
  }

  addSkill(personIndex: number) {
    const skills = this.persons.at(personIndex).get('skills') as FormArray;
    skills.push(this.fb.control('', Validators.required));
  }

  removePerson(index: number) {
    this.persons.removeAt(index);
    this.taskForm.get('persons')?.updateValueAndValidity();
  }

  removeSkill(personIndex: number, skillIndex: number) {
    const skills = this.persons.at(personIndex).get('skills') as FormArray;
    skills.removeAt(skillIndex);
  }

  submitTask() {
    console.log('ejecuta boton', this.taskForm.value);
    if (this.taskForm.valid) {

      const capitalizedTitle = this.capitalize(this.taskForm.value.title);
      const capitalizedPersons = this.taskForm.value.persons.map((person: { name: string; age: number; skills: string[] }) => ({
        ...person,
        name: this.capitalize(person.name),
        skills: person.skills.map(skill => this.capitalize(skill))
      }));

      this.taskService.addTask({
        title: capitalizedTitle,
        persons: capitalizedPersons,
        deadline: this.taskForm.value.deadline,
        completed: this.taskForm.value.status
      });

      this.taskForm.reset();
    }
  }

  capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }


  getSkillsControl(personIndex: number) {
    return this.taskForm.get(['persons', personIndex, 'skills']) as FormArray;
  }

}
