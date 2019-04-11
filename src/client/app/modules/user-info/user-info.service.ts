import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material";
import {UserInfoDialogComponent} from "./user-info-dialog/user-info-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(private matDialog: MatDialog) {
    document.body.addEventListener('mouseover', function(e: MouseEvent) {
      const {fromElement} = e;
      if (!fromElement) {
        return;
      }
      switch (fromElement.tagName) {
        case "P":
          console.log(document.elementFromPoint(e.clientX, e.clientY));
          break;
        case "A":
          console.log(fromElement.tagName);
          console.log(e);
      }

      document.body.addEventListener('mouseout', function() {
        const {fromElement} = e;
        if (!fromElement) {
          return;
        }
        switch (fromElement.tagName) {
          case "P":
            console.log(document.elementFromPoint(e.clientX, e.clientY));
            break;
          case "A":
            console.log(fromElement.tagName);
            console.log(e);
        }
      });
    });
  }


  private listenToEvents() {
    const {body} = document;
    body.addEventListener('mouseover', function() {

    });
  }

  private popupInfo() {
    this.matDialog.open(UserInfoDialogComponent);
  }
}
