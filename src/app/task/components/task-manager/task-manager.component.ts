import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import 'moment-timezone';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css']
})
export class TaskManagerComponent {

  taskForm: FormGroup;
  currentDeadline: string | null = null;

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
    this.taskForm.get('deadline')?.valueChanges.subscribe((value) => {
      this.currentDeadline = value;
      this.checkDeadlineValidity(this.currentDeadline);
    })

  }

  checkDeadlineValidity(deadline: string | null) {
    if (deadline) {
      const selectedDate = moment.tz(deadline, 'America/Bogota');
      const currentDate = moment.tz(new Date(), 'America/Bogota');

      if (selectedDate.isBefore(currentDate, 'day')) {
        const formattedDate = selectedDate.format('DD/MM/YYYY');
        Swal.fire({
          title: '¡Fecha No Vigente!',
          text: `La fecha: ${formattedDate}. no es valida.`,
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        this.taskForm.get('deadline')?.setValue(null);
      }
    }
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
    if (this.taskForm.valid) {
      const hasEmptySkills = this.persons.controls.some((person) => {
        const skillsArray = person.get('skills') as FormArray;
        return skillsArray.length === 0 || skillsArray.controls.every(skill => skill.value.trim() === '');
      });
      if (hasEmptySkills) {
        Swal.fire({
          title: '¡No Existen Habilidades!',
          text: `La pesona que agregas debe tener al menos 1 habilidad.`,
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
      console.log('data', this.taskForm.value);
      const capitalizedTitle = this.capitalize(this.taskForm.value.title);
      const capitalizedPersons = this.taskForm.value.persons.map((person: { name: string; age: number; skills: string[] }) => ({
        ...person,
        name: this.capitalize(person.name),
        skills: person.skills.map(skill => this.capitalize(skill))
      }));

      const hasDuplicates = this.checkForDuplicateNames(capitalizedPersons);
      if (hasDuplicates) {
        return;
      }

      this.taskService.addTask({
        title: capitalizedTitle,
        persons: capitalizedPersons,
        deadline: this.taskForm.value.deadline,
        completed: this.taskForm.value.status
      });

      this.showAlert(environment.alerts.success.title, environment.alerts.success.message);

      this.taskForm.reset();
      this.taskForm.setControl('persons', this.fb.array([]));
    }
  }


  capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }


  checkForDuplicateNames(persons: { name: string; age: number; skills: string[] }[]): boolean {
    const nameSet = new Set<string>();
    const duplicates = new Set<string>();

    for (const person of persons) {
      if (nameSet.has(person.name)) {
        duplicates.add(person.name);
      } else {
        nameSet.add(person.name);
      }
    }

    if (duplicates.size > 0) {
      this.showDuplicateAlert(Array.from(duplicates));
      return true;
    }

    return false;
  }

  showDuplicateAlert(duplicateNames: string[]) {
    const namesList = duplicateNames.join(', ');
    Swal.fire({
      title: '¡Nombres Duplicados!',
      text: `Los siguientes nombres ya están registrados: ${namesList}. Por favor, utiliza nombres diferentes.`,
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  }


  getSkillsControl(personIndex: number) {
    return this.taskForm.get(['persons', personIndex, 'skills']) as FormArray;
  }

  showAlert(title: string, message: string) {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }



}
