import { Pipe, PipeTransform } from '@angular/core';
import {DEFAULT_AVATAR_URL} from "../../../constants";

@Pipe({
  name: 'avatarUrl'
})
export class AvatarUrlPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return (value && value.avatarUrl) || DEFAULT_AVATAR_URL;
  }

}
