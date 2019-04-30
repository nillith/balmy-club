import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material";
import {UserInfoDialogComponent} from "./user-info-dialog/user-info-dialog.component";

function getUserId(e: MouseEvent) {
  const {fromElement} = e;
  if (!fromElement || 'A' !== fromElement.tagName) {
    return;
  }
  return (fromElement as any).dataset.userId;
}

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(private matDialog: MatDialog) {
    // document.body.addEventListener('mouseover', function(e: MouseEvent) {
    //   const userId = getUserId(e);
    //   if (!userId) {
    //     return;
    //   }
    // });
    //
    // document.body.addEventListener('mouseout', function(e: MouseEvent) {
    //   const userId = getUserId(e);
    //   if (!userId) {
    //     return;
    //   }
    // });
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
