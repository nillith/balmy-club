export const makeBackdropTransparent = function(elem: any) {
  try {
    elem
      .parentElement
      .parentElement
      .parentElement
      .previousSibling
      .style
      .background = 'transparent';
  } catch (e) {
    // swallow
  }
};

export class DataStorage {
  constructor(private userId: string) {
  }

  private generateKey(key: string) {
    return `${this.userId}:${key}`;
  }

  saveString(key: string, data: string) {
    return localStorage.setItem(this.generateKey(key), data);
  }

  loadString(key: string): string {
    return localStorage.getItem(this.generateKey(key));
  }

  saveObject(key: string, obj: any) {
    if (!key || !obj) {
      return;
    }
    return this.saveString(key, JSON.stringify(obj));
  }

  loadObject(key: string): any {
    if (!key) {
      return;
    }
    const data = this.loadString(key);
    if (data) {
      return JSON.parse(data);
    }
  }

  clear() {
    localStorage.clear();
  }
}
