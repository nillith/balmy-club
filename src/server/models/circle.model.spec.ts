import {assert} from 'chai';
import {CircleModel, CirclePacker} from "./circle.model";
import {isValidStringId, makeInstance} from "../../shared/utils";

describe('CircleModel', () => {
  it('should return instance of CirclePacker', async () => {
    const pack = await CircleModel.getAllCircleForUser(1);
    assert.instanceOf(pack, CirclePacker);
  });

  it('should obfuscate id', () => {
    const data = {
      circles: [
        {
          id: 1,
          name: 'oeu',
          users: [
            {
              id: 1,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            },
            {
              id: 2,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            }
          ]
        },
        {
          id: 2,
          name: 'oeu',
          users: [
            {
              id: 1,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            },
            {
              id: 2,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            }
          ]
        }
      ]
    };
    makeInstance(data, CirclePacker);

    const circles = (data as CirclePacker).getOutboundData();
    assert.isArray(circles);
    assert.isAtLeast(circles.length, 1);
    assert.strictEqual(circles.length, data.circles.length);

    for (const c of circles) {
      assert.isTrue(isValidStringId(c.id));
      for (const u of c.users) {
        assert.isTrue(isValidStringId(u.id));
      }
    }
  });
});
