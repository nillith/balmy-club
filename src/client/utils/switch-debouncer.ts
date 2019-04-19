export type NullaryAsyncAction = () => Promise<void>;
const deviation = 20;

export class SwitchDebouncer {
  private checkpoint = 0;
  private pending = false;
  private snapshotState: boolean;

  constructor(public isOn: boolean, private onAction: NullaryAsyncAction, private offAction: NullaryAsyncAction, private delay: number = 233) {
    this.snapshotState = isOn;
  }

  private startPendingTask(de: number) {
    const self = this;
    self.pending = true;
    setTimeout(async () => {
      const elapsed = Date.now() - self.checkpoint;
      const delta = self.delay - elapsed;
      if (delta < deviation) {
        try {
          if (Boolean(self.isOn) !== Boolean(self.snapshotState)) {
            const targetResult = self.isOn;
            if (self.isOn) {
              await self.onAction();
            } else {
              await self.offAction();
            }
            self.snapshotState = targetResult;
            self.isOn = targetResult;
          }
        } catch (e) {
          console.log(e);
          self.isOn = self.snapshotState;
        } finally {
          self.pending = false;
        }
      } else {
        self.startPendingTask(delta);
      }
    }, de);
  }

  switch() {
    const self = this;
    self.checkpoint = Date.now();
    self.isOn = !self.isOn;
    if (self.pending) {
      return;
    }
    self.startPendingTask(self.delay);
  }
}
