import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userLink'
})
export class UserLinkPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return `u/${value && value.id}`;
  }

}
