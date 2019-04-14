import {assert} from 'chai';
import {jsonStringifyByFields, makeFieldMaps, ModelBase} from "./model-base";

class ModelBaseSpec extends ModelBase {

}

describe('ModelBase', () => {
  it('should create string field name from symbol', () => {
    const a = Symbol('a');
    const fields = makeFieldMaps([a, 'b']);
    assert.strictEqual(fields[0].from, a);
    assert.strictEqual(fields[0].to, 'a');
    assert.strictEqual(fields[1].from, 'b');
    assert.strictEqual(fields[1].to, 'b');
  });

  it('should throw if result in duplicate key', () => {
    const a = Symbol('a');
    assert.throw(() => {
      makeFieldMaps([a, 'a']);
    });
  });

  it('should throw if symbol have no description', () => {
    const a = Symbol();
    assert.throw(() => {
      makeFieldMaps([a]);
    });
  });

  it('should only stringify specified fields', () => {
    const a = Symbol('a');
    const fields = makeFieldMaps([a, 'b']);
    const obj = {
      [a]: '$a',
      a: 'a',
      b: 'b',
      c: 'c',
    };
    const clone = JSON.parse(jsonStringifyByFields(obj, fields));
    assert.strictEqual(Object.keys(clone).length, 2);
    assert.strictEqual(obj[a], clone.a);
    assert.strictEqual(obj.b, clone.b);
  });

  it('should return true for newly create obj', () => {
    const model = new ModelBaseSpec();
    assert.isTrue(model.isNew());
  });

  it('should throw if no $toJsonFields set when stringify', () => {
    const model = new ModelBaseSpec();
    assert.throw(() => {
      JSON.stringify(model);
    });
  });

  it('should throw when to string', () => {
    const model = new ModelBaseSpec();
    assert.throw(() => {
      const t = model + '';
    });
    assert.throw(() => {
      model.toString();
    });
  });
});
