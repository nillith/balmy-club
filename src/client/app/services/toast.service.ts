import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(public snackBar: MatSnackBar) {
  }

  showToast(msg: string, duration = 2000) {
    if (!msg) {
      return;
    }
    const config = new MatSnackBarConfig();
    config.verticalPosition = 'bottom';
    config.horizontalPosition = 'center';
    config.duration = duration;
    this.snackBar.open(msg, undefined, config);
  }
}
