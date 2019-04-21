import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {IService} from "./services/i.service";

export const createAnchor = function() {
  return {
    __parentCount: 0,
    __previousSiblingCount: 0,
    get parentElement() {
      if (this.__parentCount > 30) {
        return null;
      }
      ++this.__parentCount;
      return this;
    },
    get previousSibling() {
      if (this.__previousSiblingCount > 30) {
        return null;
      }
      ++this.__previousSiblingCount;
      return this;
    },
    getBoundingClientRect() {
      return {
        x: 5,
        y: 549,
        width: 910,
        height: 212,
        top: 549,
        right: 915,
        bottom: 761,
        left: 5
      };
    }
  };
};

export const anchor = {
  provide: MAT_DIALOG_DATA,
  useFactory() {
    return {
      anchor: createAnchor(),
      contextUsers: []
    };
  }
};


const createMatDialogRef = function() {
  return {
    updatePosition() {
    }
  };
};

export const matDialogRef = {
  provide: MatDialogRef,
  useFactory: createMatDialogRef
};




