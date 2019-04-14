import {assert} from 'chai';
import {noop, timeOfDay, utcTimestamp} from "./utils";




describe('Utils', () => {
  it('should be callable', () => {
    assert.doesNotThrow(() => {
      noop();
    });
  });
  it('should return timestamp', async () => {
    assert.match(utcTimestamp().toString(), /^[0-9]{10}$/);

  });
  it('should return time of day', async () => {
    assert.match(timeOfDay(), /^[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}$/);
  });
});
