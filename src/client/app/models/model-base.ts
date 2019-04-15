import {HttpClient} from "@angular/common/http";
import {cloneFields} from "../../../shared/utils";

export abstract class ModelBase {
  static ASSIGN_FIELDS: string[] = [];

  id?: string;

  constructor(protected readonly http: HttpClient) {

  }

  isNew() {
    return !this.id;
  }

  protected abstract async create(): Promise<void>;

  protected abstract async update(): Promise<void>;

  async save(): Promise<void> {
    const self = this;
    if (self.isNew()) {
      return self.create();
    } else {
      return self.update();
    }
  }

  cloneModelFields(fields: string[]) {
    return cloneFields(this, fields);
  }

  assign(obj: any) {
    const self = this;
    cloneFields(obj, (self.constructor as any).ASSIGN_FIELDS, self);
  }

  assignOut(target: any = {}) {
    const self = this;
    return cloneFields(self, (self.constructor as any).ASSIGN_FIELDS, target);
  }
}
