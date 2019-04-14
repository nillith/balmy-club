import {HttpClient} from "@angular/common/http";
import {cloneFields} from "../../../shared/utils";

export abstract class ModelBase {
  id?: string;

  constructor(protected readonly http: HttpClient) {

  }

  isNew() {
    return !this.id;
  }

  toJSON() {
    throw Error("Not Allowed");
  }

  toString() {
    throw Error("Not Allowed");
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

  cloneFields(fields: string[]) {
    return cloneFields(this, fields);
  }
}
