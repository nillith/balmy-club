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
    const _this = this;
    _this.pending = true;
    setTimeout(async () => {
      const elapsed = Date.now() - _this.checkpoint;
      const delta = _this.delay - elapsed;
      if (delta < deviation) {
        try {
          if (Boolean(_this.isOn) !== Boolean(_this.snapshotState)) {
            const targetResult = _this.isOn;
            if (_this.isOn) {
              await _this.onAction();
            } else {
              await _this.offAction();
            }
            _this.snapshotState = targetResult;
            _this.isOn = targetResult;
          }
        } catch (e) {
          console.log(e);
          _this.isOn = _this.snapshotState;
        } finally {
          _this.pending = false;
        }
      } else {
        _this.startPendingTask(delta);
      }
    }, de);
  }

  switch() {
    const _this = this;
    _this.checkpoint = Date.now();
    _this.isOn = !_this.isOn;
    if (_this.pending) {
      return;
    }
    _this.startPendingTask(_this.delay);
  }
}
