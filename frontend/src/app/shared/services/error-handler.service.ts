import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any) {
    let message = 'Si è verificato un errore';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.snackBar.open(message, 'Chiudi', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
}
