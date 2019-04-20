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
    const _this = this;
    if (_this.isNew()) {
      return _this.create();
    } else {
      return _this.update();
    }
  }

  cloneModelFields(fields: string[]) {
    return cloneFields(this, fields);
  }

  assign(obj: any) {
    const _this = this;
    cloneFields(obj, (_this.constructor as any).ASSIGN_FIELDS, _this);
  }

  assignOut(target: any = {}) {
    const _this = this;
    return cloneFields(_this, (_this.constructor as any).ASSIGN_FIELDS, target);
  }
}
