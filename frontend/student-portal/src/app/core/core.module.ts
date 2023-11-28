import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { API_URL, environment } from 'src/environments/environment';
import { ModalComponent } from './services/modal-component/modal-component.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ModalComponent],
  imports: [CommonModule, RouterModule, MatButtonModule, ReactiveFormsModule],
  providers: [{ provide: API_URL, useValue: environment.apiUrl }],
})
export class CoreModule {}
