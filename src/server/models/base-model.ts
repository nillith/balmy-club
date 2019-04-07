import {$safeFields} from '../constants/symbols';
import {cloneFields} from "../utils/index";

export abstract class BaseModel {
  static from(user: object) {
    if (!user) {
      throw Error('Invalid argument!');
    }
    return Object.setPrototypeOf(user, this.prototype);
  }

  toJSON() {
    return JSON.stringify(cloneFields(this, this.constructor[$safeFields]));
  }
}
