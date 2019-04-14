import './init';


console.assert = function(v: boolean, msg?: string) {
  if (!v) {
    throw Error(msg || "MyAssertion failed!");
  }
};
