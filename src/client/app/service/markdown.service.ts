import {Injectable} from '@angular/core';
import * as MarkdownIt from 'markdown-it';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private renderer = new MarkdownIt({
    html: false
  });

  constructor() {
  }

  render(value: string) {
    return this.renderer.render(value);
  }
}
