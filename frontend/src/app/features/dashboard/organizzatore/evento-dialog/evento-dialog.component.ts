import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Evento } from '../../../../core/services/evento.service';

@Component({
  selector: 'app-evento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifica Evento' : 'Nuovo Evento' }}</h2>
    <form [formGroup]="eventoForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titolo</mat-label>
          <input matInput formControlName="titolo" required />
          <mat-error *ngIf="eventoForm.get('titolo')?.hasError('required')"
            >Titolo è obbligatorio</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrizione</mat-label>
          <textarea
            matInput
            formControlName="descrizione"
            rows="3"
            required
          ></textarea>
          <mat-error *ngIf="eventoForm.get('descrizione')?.hasError('required')"
            >Descrizione è obbligatoria</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="data"
            required
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="eventoForm.get('data')?.hasError('required')"
            >Data è obbligatoria</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Luogo</mat-label>
          <input matInput formControlName="luogo" required />
          <mat-error *ngIf="eventoForm.get('luogo')?.hasError('required')"
            >Luogo è obbligatorio</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Posti Disponibili</mat-label>
          <input
            matInput
            type="number"
            formControlName="postiDisponibili"
            required
            min="1"
          />
          <mat-error
            *ngIf="eventoForm.get('postiDisponibili')?.hasError('required')"
            >Posti disponibili è obbligatorio</mat-error
          >
          <mat-error *ngIf="eventoForm.get('postiDisponibili')?.hasError('min')"
            >Deve essere almeno 1</mat-error
          >
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Annulla</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="eventoForm.invalid"
        >
          {{ data ? 'Salva' : 'Crea' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 1em;
      }
      mat-dialog-content {
        min-width: 400px;
      }
    `,
  ],
})
export class EventoDialogComponent {
  eventoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Evento | null
  ) {
    this.eventoForm = this.fb.group({
      titolo: [data?.titolo || '', Validators.required],
      descrizione: [data?.descrizione || '', Validators.required],
      data: [data?.data ? new Date(data.data) : null, Validators.required],
      luogo: [data?.luogo || '', Validators.required],
      postiDisponibili: [
        data?.postiDisponibili || 1,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  onSubmit() {
    if (this.eventoForm.valid) {
      const formValue = this.eventoForm.value;
      const evento: Partial<Evento> = {
        ...formValue,
        data: formValue.data.toISOString(),
      };
      this.dialogRef.close(evento);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
