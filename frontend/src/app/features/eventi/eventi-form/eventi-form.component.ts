import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { EventiService, Evento } from '../../../core/services/eventi.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

@Component({
  selector: 'app-eventi-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  template: `
    <div class="eventi-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            isEditMode ? 'Modifica Evento' : 'Nuovo Evento'
          }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="eventoForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titolo</mat-label>
              <input matInput formControlName="titolo" required />
              <mat-error *ngIf="eventoForm.get('titolo')?.hasError('required')">
                Il titolo è obbligatorio
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrizione</mat-label>
              <textarea
                matInput
                formControlName="descrizione"
                rows="4"
                required
              ></textarea>
              <mat-error
                *ngIf="eventoForm.get('descrizione')?.hasError('required')"
              >
                La descrizione è obbligatoria
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Data e Ora</mat-label>
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
              <mat-error *ngIf="eventoForm.get('data')?.hasError('required')">
                La data è obbligatoria
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Luogo</mat-label>
              <input matInput formControlName="luogo" required />
              <mat-error *ngIf="eventoForm.get('luogo')?.hasError('required')">
                Il luogo è obbligatorio
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Numero Posti</mat-label>
              <input
                matInput
                type="number"
                formControlName="postiDisponibili"
                required
                min="1"
              />
              <mat-error
                *ngIf="eventoForm.get('postiDisponibili')?.hasError('required')"
              >
                Il numero di posti è obbligatorio
              </mat-error>
              <mat-error
                *ngIf="eventoForm.get('postiDisponibili')?.hasError('min')"
              >
                Il numero di posti deve essere almeno 1
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">
                Annulla
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="eventoForm.invalid"
              >
                {{ isEditMode ? 'Salva Modifiche' : 'Crea Evento' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .eventi-form-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
      }
    `,
  ],
})
export class EventiFormComponent implements OnInit {
  eventoForm: FormGroup;
  isEditMode = false;
  eventoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventiService: EventiService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private errorHandler: ErrorHandlerService
  ) {
    this.eventoForm = this.fb.group({
      titolo: ['', Validators.required],
      descrizione: ['', Validators.required],
      data: ['', Validators.required],
      luogo: ['', Validators.required],
      postiDisponibili: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventoId;

    if (this.isEditMode && this.eventoId) {
      this.loadingService.show();
      this.eventiService.getEvento(this.eventoId).subscribe({
        next: (evento) => {
          const dataEvento = new Date(evento.data);
          this.eventoForm.patchValue({
            ...evento,
            data: dataEvento,
          });
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.loadingService.hide();
        },
      });
    }
  }

  onSubmit() {
    if (this.eventoForm.invalid) return;

    const formValue = this.eventoForm.value;
    const eventoData: Evento = {
      ...formValue,
      data: formValue.data.toISOString(),
    };

    this.loadingService.show();
    const request =
      this.isEditMode && this.eventoId
        ? this.eventiService.updateEvento(this.eventoId, eventoData)
        : this.eventiService.createEvento(eventoData);

    request.subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/eventi']);
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }

  onCancel() {
    this.router.navigate(['/eventi']);
  }
}
