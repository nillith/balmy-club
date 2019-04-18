import {assert} from 'chai';
import {ActivityRecord, assertValidRawActivity, RawActivity} from "./activity.model";
import {Activity} from "../../shared/interf";
import {utcTimestamp} from "../../shared/utils";

const createValidActivity = function(): RawActivity {
  return {
    subjectId: 1,
    objectId: 1,
    objectType: Activity.ObjectTypes.Post,
    actionType: Activity.ContentActions.Create,
    timestamp: utcTimestamp(),
  };
};

const fields = ['subjectId', 'objectId', 'objectType', 'actionType', 'timestamp', 'contextId', 'contextType',];

const cloneActivity = function(activity: RawActivity): RawActivity {
  const result: any = {};
  for (const f of fields) {
    result[f] = activity[f];
  }
  assertValidRawActivity(result);
  return result;
};

const assertShadowEqual = function(obj1: any, obj2: any) {
  const keys = Object.keys(obj1 as object);
  for (const key of keys) {
    assert.strictEqual(obj1[key], obj2[key]);
  }
};

describe('ActivityModel', () => {
  let validActivity;
  beforeEach(() => {
    assert.doesNotThrow(() => {
      validActivity = createValidActivity();
      cloneActivity(validActivity);
    });
  });

  afterEach(() => {
    validActivity = undefined;
  });

  const assertThrowInvalidFieldsValues = function(fields: [string, any][]) {
    const valid = createValidActivity() as any;
    for (const [name, value] of fields) {
      valid[name] = value;
    }
    let clone: any = null;
    assert.throw(() => {
      clone = cloneActivity(valid);
      assertShadowEqual(clone, valid);
    });
    if (clone) {
      assertShadowEqual(clone, valid);
    }
  };


  const assertThrowInvalidFieldValue = function(name: string, value: any) {
    assertThrowInvalidFieldsValues([[name, value]]);
  };

  const assertThrowInvalidId = function(name: string) {
    const invalidIds = [null, undefined, 0, 'blah'];
    for (const v of invalidIds) {
      assertThrowInvalidFieldValue(name, v);
    }
  };

  it('should throw for invalid id', () => {
    assertThrowInvalidId('subjectId');
    assertThrowInvalidId('objectId');
  });

  it('should throw for invalid timestamp', () => {
    assertThrowInvalidFieldValue('timestamp', 0);
    assertThrowInvalidFieldValue('timestamp', 1);
    assertThrowInvalidFieldValue('timestamp', '2011-0-0');
    assertThrowInvalidFieldValue('timestamp', 'aaaaa');
  });

  const assertThrowInvalidAction = function(objectType?: number, actionType?: number) {
    assertThrowInvalidFieldsValues([
      ['objectType', objectType],
      ['actionType', actionType],
    ]);
  };

  it('should throw for invalid action', () => {
    assertThrowInvalidAction(Activity.ObjectTypes.Post, Activity.UserActions.Block);
    assertThrowInvalidAction(Activity.ObjectTypes.Post, Activity.UserActions.UnBlock);
    assertThrowInvalidAction(Activity.ObjectTypes.Post, Activity.UserActions.Circle);
    assertThrowInvalidAction(Activity.ObjectTypes.Post, Activity.UserActions.UnCircle);
    assertThrowInvalidAction(Activity.ObjectTypes.Post, Activity.UserActions.Mention);

    assertThrowInvalidAction(Activity.ObjectTypes.Comment, Activity.UserActions.Block);
    assertThrowInvalidAction(Activity.ObjectTypes.Comment, Activity.UserActions.UnBlock);
    assertThrowInvalidAction(Activity.ObjectTypes.Comment, Activity.UserActions.Circle);
    assertThrowInvalidAction(Activity.ObjectTypes.Comment, Activity.UserActions.UnCircle);
    assertThrowInvalidAction(Activity.ObjectTypes.Comment, Activity.UserActions.Mention);

    assertThrowInvalidAction(Activity.ObjectTypes.User, Activity.ContentActions.PlusOne);
    assertThrowInvalidAction(Activity.ObjectTypes.User, Activity.ContentActions.UnPlusOne);
    assertThrowInvalidAction(Activity.ObjectTypes.User, Activity.ContentActions.Create);
    assertThrowInvalidAction(Activity.ObjectTypes.User, Activity.ContentActions.Delete);
    assertThrowInvalidAction(Activity.ObjectTypes.User, Activity.ContentActions.Edit);
  });

  const assertThrowInvalidActivity = function(objectType?: number, actionType?: number, contextType?: number) {
    assert.isTrue(Activity.isValidAction(objectType, actionType));
    assertThrowInvalidFieldsValues([
      ['objectType', objectType],
      ['actionType', actionType],
      ['contextType', contextType],
    ]);
  };

  it('should throw for invalid activity', () => {
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.Block, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.Block, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.UnBlock, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.UnBlock, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.Circle, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.Circle, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.UnCircle, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.User, Activity.UserActions.UnCircle, Activity.ContextTypes.Comment);


    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.PlusOne, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.PlusOne, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.UnPlusOne, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.UnPlusOne, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Create, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Create, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Delete, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Delete, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Edit, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Comment, Activity.ContentActions.Edit, Activity.ContextTypes.Comment);

    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.PlusOne, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.PlusOne, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.UnPlusOne, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.UnPlusOne, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Create, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Create, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Delete, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Delete, Activity.ContextTypes.Comment);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Edit, Activity.ContextTypes.Post);
    assertThrowInvalidActivity(Activity.ObjectTypes.Post, Activity.ContentActions.Edit, Activity.ContextTypes.Comment);
  });
});
