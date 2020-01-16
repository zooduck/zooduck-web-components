// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"QVnC":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"HB6R":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.style = function (options) {
  var transitionSpeedInMillis = options.transitionSpeed;
  return "\n        :host {\n            display: block;\n            visibility: hidden;\n            overflow: hidden;\n            touch-action: pan-y;\n            cursor: pointer;\n        }\n        :host(.--ready) {\n            visibility: visible;\n        }\n        ::slotted([slot=slides]) {\n            display: flex;\n            align-items: flex-start;\n        }\n        ::slotted([slot=slides]) {\n            transition: all ".concat(transitionSpeedInMillis, "ms;\n        }\n        :host(.--touch-active) ::slotted([slot=slides]) {\n            transition: none;\n        }\n        :host(.--no-animate) ::slotted([slot=slides]) {\n            transition: none;\n        }\n    ");
};
},{}],"vlYQ":[function(require,module,exports) {
Number.prototype.toPositive = function () {
  return this < 0 ? this * -1 : this;
};
},{}],"AG7A":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.isTap = function (lastPointerdownEvent, pointerupEvent) {
  var maxInterval = 250;
  var maxDistance = 10;
  var distance = lastPointerdownEvent.clientX - pointerupEvent.clientX;
  var positiveDistance = distance < 0 ? distance * -1 : distance;

  if (positiveDistance > maxDistance) {
    return false;
  }

  return pointerupEvent.timeStamp - lastPointerdownEvent.timeStamp < maxInterval;
};
},{}],"SRTL":[function(require,module,exports) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var PointerEventDetails =
/*#__PURE__*/
function () {
  function PointerEventDetails() {
    _classCallCheck(this, PointerEventDetails);
  }

  _createClass(PointerEventDetails, [{
    key: "fromMouse",
    value: function fromMouse(e) {
      var clientX = e.clientX,
          clientY = e.clientY,
          timeStamp = e.timeStamp;
      var pointerEventDetails = {
        event: e,
        clientX: clientX,
        clientY: clientY,
        timeStamp: timeStamp
      };
      return pointerEventDetails;
    }
  }, {
    key: "fromPointer",
    value: function fromPointer(e) {
      var clientX = e.clientX,
          clientY = e.clientY,
          timeStamp = e.timeStamp;
      var pointerEventDetails = {
        event: e,
        clientX: clientX,
        clientY: clientY,
        timeStamp: timeStamp
      };
      return pointerEventDetails;
    }
  }, {
    key: "fromTouch",
    value: function fromTouch(e) {
      var _e$changedTouches$ = e.changedTouches[0],
          clientX = _e$changedTouches$.clientX,
          clientY = _e$changedTouches$.clientY;
      var timeStamp = e.timeStamp;
      var pointerEventDetails = {
        event: e,
        clientX: clientX,
        clientY: clientY,
        timeStamp: timeStamp
      };
      return pointerEventDetails;
    }
  }]);

  return PointerEventDetails;
}();

exports.PointerEventDetails = PointerEventDetails;
},{}],"pzcK":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.wait = function () {
  var delayInMillis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new Promise(function (res) {
    return setTimeout(res, delayInMillis);
  });
};
},{}],"s2T4":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var is_tap_1 = require("./is-tap");

exports.isTap = is_tap_1.isTap;

var pointer_event_details_1 = require("./pointer-event-details");

exports.PointerEventDetails = pointer_event_details_1.PointerEventDetails;
exports.EventDetails = pointer_event_details_1.EventDetails;

var wait_1 = require("./wait");

exports.wait = wait_1.wait;
},{"./is-tap":"AG7A","./pointer-event-details":"SRTL","./wait":"pzcK"}],"tZiM":[function(require,module,exports) {
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var zooduck_carousel_style_1 = require("./zooduck-carousel.style");

require("./prototype/Number/to-positive");

var index_1 = require("../utils/index"); // eslint-disable-line no-unused-vars


var tagName = 'zooduck-carousel';

var requiredSlotMissingError = function requiredSlotMissingError(slotName) {
  return "\n".concat(tagName, " failed to render. No slotted content for \"").concat(slotName, "\" was found.\n-----------------------------------\nSlotted content can be added like:\n-----------------------------------\n<").concat(tagName, ">\n    <div slot=\"slides\">\n        <div>SLIDE_ONE_CONTENT</div>\n        <div>SLIDE_TWO_CONTENT</div>\n        ...\n    </div>\n<\\").concat(tagName, ">\n-----------------------------------\n    ").trim();
};

var HTMLZooduckCarouselElement =
/*#__PURE__*/
function (_HTMLElement) {
  _inherits(HTMLZooduckCarouselElement, _HTMLElement);

  function HTMLZooduckCarouselElement() {
    var _this;

    _classCallCheck(this, HTMLZooduckCarouselElement);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLZooduckCarouselElement).call(this));

    _this._imageIntersectionObserverCallback = function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var imageToLoad = _this._imagesToLoad.find(function (img) {
            return entry.target == img;
          });

          if (!imageToLoad) {
            return;
          }

          var imageLoader = new Image();

          imageLoader.onload = function () {
            imageToLoad.src = imageToLoad.dataset.src;

            var imagesToLoadIndex = _this._imagesToLoad.findIndex(function (img) {
              return imageToLoad === img;
            });

            _this._imagesToLoad.splice(imagesToLoadIndex, 1);
          };

          imageLoader.src = imageToLoad.dataset.src;
        }
      });
    };

    _this._currentOffsetX = 0;
    _this._minPixelsMovementRequiredToRegisterMove = 10;
    _this._imageIntersectionObserver = new IntersectionObserver(_this._imageIntersectionObserverCallback, {
      root: null,
      threshold: [.1]
    });
    _this._imagesToLoad = [];
    _this._loading = 'lazy';
    _this._maxOffsetX = 0;
    _this._pointerEventDetails = new index_1.PointerEventDetails();
    _this._pointerEvents = {
      pointerdown: []
    };
    _this._slides = [];
    _this._touchMoveInProgress = false;
    _this._touchMoveData = {
      initialDirection: null,
      distanceX: 0,
      distanceY: 0
    };
    _this._touchStartData = {
      timeStamp: 0,
      clientX: 0,
      clientY: 0
    };
    _this._transitionSpeedInMillis = 250;

    _this.attachShadow({
      mode: 'open'
    });

    var styleEl = document.createElement('style');
    styleEl.textContent = zooduck_carousel_style_1.style({
      transitionSpeed: _this._transitionSpeedInMillis
    });
    var slideSelectorsSlot = document.createElement('slot');
    slideSelectorsSlot.name = 'slide-selectors';
    var slidesSlot = document.createElement('slot');
    slidesSlot.name = 'slides';

    _this.shadowRoot.appendChild(styleEl);

    _this.shadowRoot.appendChild(slideSelectorsSlot);

    _this.shadowRoot.appendChild(slidesSlot);

    _this._registerEvents();

    return _this;
  }

  _createClass(HTMLZooduckCarouselElement, [{
    key: "_getMaxNegativeOffsetX",
    value: function _getMaxNegativeOffsetX() {
      var slides = this._slides.slice(0, -1);

      var maxNegativeOffsetX = 0;
      slides.forEach(function (slide) {
        return maxNegativeOffsetX -= slide.el.offsetWidth;
      });
      return maxNegativeOffsetX;
    }
  }, {
    key: "_getPlaceholder",
    value: function _getPlaceholder() {
      var canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      var placeholder = canvas.toDataURL('image/png');
      return placeholder;
    }
  }, {
    key: "_getPrecedingSlideWidths",
    value: function _getPrecedingSlideWidths(nextSlide) {
      var precedingSlides = this._slides.filter(function (slide) {
        return slide.index < nextSlide.index;
      });

      if (!precedingSlides.length) {
        return 0;
      }

      var precedingSlideWidths = precedingSlides.map(function (slide) {
        return slide.el.offsetWidth;
      }).reduce(function (total, offsetWidth) {
        return total + offsetWidth;
      });
      return precedingSlideWidths;
    }
  }, {
    key: "_getRandomRGBA",
    value: function _getRandomRGBA() {
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);
      var a = .62;
      return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")");
    }
  }, {
    key: "_getSlideSelectorsHeight",
    value: function _getSlideSelectorsHeight() {
      var slideSelectorsHeight = this._slideSelectors ? this._slideSelectors.offsetHeight : 0;
      return slideSelectorsHeight;
    }
  }, {
    key: "_isDoubleTap",
    value: function _isDoubleTap(lastTwoPointerdownTimeStamps) {
      if (lastTwoPointerdownTimeStamps.length < 2) {
        return false;
      }

      var secondToLastPointerdownTime = lastTwoPointerdownTimeStamps[0];
      var lastPointerdownTime = lastTwoPointerdownTimeStamps[1];
      var maxTimeBetweenPointerDown = 250;
      return lastPointerdownTime - secondToLastPointerdownTime < maxTimeBetweenPointerDown;
    }
  }, {
    key: "_isSwipeValid",
    value: function _isSwipeValid(distanceX) {
      var minTravel = 50;
      var isSwipeValid = distanceX.toPositive() > minTravel;
      return isSwipeValid;
    }
  }, {
    key: "_isTouchMoveRecognised",
    value: function _isTouchMoveRecognised() {
      var totalPixelsTravelled = this._touchMoveData.distanceX.toPositive() + this._touchMoveData.distanceY.toPositive();

      return totalPixelsTravelled > this._minPixelsMovementRequiredToRegisterMove;
    }
  }, {
    key: "_lazyLoad",
    value: function _lazyLoad(img) {
      img.dataset.src = img.src; // If we set the src to '' the browser will display a broken image icon

      img.src = this._getPlaceholder();

      this._imagesToLoad.push(img); // IntersectionObserver needs something to observe
      // (1px should be good enough - using 10px to be safe)


      img.style.minWidth = '10px';
      img.style.minHeight = '10px';

      this._imageIntersectionObserver.observe(img);

      console.log('observing');
    }
  }, {
    key: "_onCurrentSlideChange",
    value: function _onCurrentSlideChange() {
      this.dispatchEvent(new CustomEvent('slidechange', {
        detail: {
          currentSlide: this._currentSlide
        }
      }));
    }
  }, {
    key: "_onResize",
    value: function _onResize() {
      this._slideIntoView(this._currentSlide, false);
    }
  }, {
    key: "_onSwipeLeft",
    value: function _onSwipeLeft() {
      var nextSlide = this._slides[this._currentSlide.index + 1];

      if (!nextSlide) {
        return;
      }

      this._setCurrentSlide(nextSlide.index);

      this._slideIntoView(nextSlide);
    }
  }, {
    key: "_onSwipeRight",
    value: function _onSwipeRight() {
      var nextSlide = this._slides[this._currentSlide.index - 1];

      if (!nextSlide) {
        return;
      }

      this._setCurrentSlide(nextSlide.index);

      this._slideIntoView(nextSlide);
    }
  }, {
    key: "_onTouchStart",
    value: function _onTouchStart(eventDetails) {
      var _this2 = this;

      var clientX = eventDetails.clientX,
          clientY = eventDetails.clientY;

      if ('PointerEvent' in window) {
        this.addEventListener('pointermove', function (e) {
          var eventDetails = _this2._pointerEventDetails.fromPointer(e);

          _this2._onTouchMove(eventDetails);
        });
      } else if ('TouchEvent' in window) {
        this.addEventListener('touchmove', function (e) {
          var eventDetails = _this2._pointerEventDetails.fromTouch(e);

          _this2._onTouchMove(eventDetails);
        });
      } else {
        this.addEventListener('mousemove', function (e) {
          var eventDetails = _this2._pointerEventDetails.fromMouse(e);

          _this2._onTouchMove(eventDetails);
        });
      }

      this._pointerEvents.pointerdown.push(eventDetails);

      this._touchStartData = {
        timeStamp: new Date().getTime(),
        clientX: clientX,
        clientY: clientY
      };
      this._touchMoveData.initialDirection = null;
      this._touchMoveData.distanceX = 0;
      this._touchMoveData.distanceY = 0;
      this._touchActive = true;
    }
  }, {
    key: "_onTouchMove",
    value: function _onTouchMove(eventDetails) {
      var e = eventDetails.event,
          clientX = eventDetails.clientX,
          clientY = eventDetails.clientY;
      e.preventDefault();

      if (!this._touchActive) {
        return;
      }

      var initialDirection = this._touchMoveData.initialDirection;
      this._touchMoveData.distanceX = this._touchStartData.clientX - clientX;
      this._touchMoveData.distanceY = this._touchStartData.clientY - clientY;

      if (!this._isTouchMoveRecognised() && !initialDirection) {
        return;
      }

      if (!initialDirection) {
        this._setInitialTouchMoveDirection();
      }

      if (this._touchMoveData.initialDirection === 'vertical') {
        this._setTouchActive(false);

        this._slideIntoView(this._currentSlide);

        return;
      }

      this._touchMoveInProgress = true;

      this._setTouchActive(true);

      var swipeDistance = clientX - this._touchStartData.clientX;
      var currentX = parseInt((swipeDistance + this._currentOffsetX).toString(), 10);

      this._slideTo(currentX);
    }
  }, {
    key: "_onTouchCancel",
    value: function _onTouchCancel(eventDetails) {
      var e = eventDetails.event;
      e.preventDefault();
      this.removeEventListener('pointermove', this._onTouchMove);
      this.removeEventListener('touchmove', this._onTouchMove);
      this.removeEventListener('mousemove', this._onTouchMove);

      if (this._touchMoveInProgress) {
        this._setTouchActive(false);

        this._slideIntoView(this._currentSlide);
      }
    }
  }, {
    key: "_onTouchEnd",
    value: function _onTouchEnd(eventDetails) {
      return __awaiter(this, void 0, void 0,
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var e, lastTwoPointerdownTimeStamps, distanceX, direction;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                e = eventDetails.event;
                e.preventDefault();

                this._setTouchActive(false);

                this.removeEventListener('pointermove', this._onTouchMove);
                this.removeEventListener('touchmove', this._onTouchMove);
                this.removeEventListener('mousemove', this._onTouchMove);
                lastTwoPointerdownTimeStamps = this._pointerEvents.pointerdown.slice(-2).map(function (eventDetails) {
                  var timeStamp = eventDetails.timeStamp;
                  return timeStamp;
                });

                if (this._isDoubleTap(lastTwoPointerdownTimeStamps)) {
                  this.scrollIntoView({
                    behavior: 'smooth'
                  });
                }

                distanceX = this._touchMoveData.distanceX;

                if (this._isSwipeValid(distanceX)) {
                  _context.next = 12;
                  break;
                }

                this._slideIntoView(this._currentSlide);

                return _context.abrupt("return");

              case 12:
                direction = distanceX < 0 ? 'right' : 'left';

                if (direction === 'left') {
                  this._onSwipeLeft();
                }

                if (direction === 'right') {
                  this._onSwipeRight();
                }

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
    }
  }, {
    key: "_registerEvents",
    value: function _registerEvents() {
      window.addEventListener('resize', this._onResize.bind(this));

      if ('PointerEvent' in window) {
        this._registerPointerEvents();
      } else if ('TouchEvent' in window) {
        this._registerTouchEvents();
      } else {
        this._registerMouseEvents();
      }
    }
  }, {
    key: "_registerMouseEvents",
    value: function _registerMouseEvents() {
      var _this3 = this;

      this.addEventListener('mousedown', function (e) {
        var eventDetails = _this3._pointerEventDetails.fromMouse(e);

        _this3._onTouchStart(eventDetails);
      });
      this.addEventListener('mouseup', function (e) {
        var eventDetails = _this3._pointerEventDetails.fromMouse(e);

        _this3._onTouchEnd(eventDetails);
      });
      this.addEventListener('mouseleave', function (e) {
        var eventDetails = _this3._pointerEventDetails.fromMouse(e);

        _this3._onTouchCancel(eventDetails);
      });
    }
  }, {
    key: "_registerPointerEvents",
    value: function _registerPointerEvents() {
      var _this4 = this;

      this.addEventListener('pointerdown', function (e) {
        var eventDetails = _this4._pointerEventDetails.fromPointer(e);

        _this4._onTouchStart(eventDetails);
      });
      this.addEventListener('pointerup', function (e) {
        var eventDetails = _this4._pointerEventDetails.fromPointer(e);

        _this4._onTouchEnd(eventDetails);
      });
      this.addEventListener('pointercancel', function (e) {
        var eventDetails = _this4._pointerEventDetails.fromPointer(e);

        _this4._onTouchCancel(eventDetails);
      });
    }
  }, {
    key: "_registerTouchEvents",
    value: function _registerTouchEvents() {
      var _this5 = this;

      this.addEventListener('touchstart', function (e) {
        var eventDetails = _this5._pointerEventDetails.fromTouch(e);

        _this5._onTouchStart(eventDetails);
      });
      this.addEventListener('touchend', function (e) {
        var eventDetails = _this5._pointerEventDetails.fromTouch(e);

        _this5._onTouchEnd(eventDetails);
      });
      this.addEventListener('touchcancel', function (e) {
        var eventDetails = _this5._pointerEventDetails.fromTouch(e);

        _this5._onTouchCancel(eventDetails);
      });
    }
  }, {
    key: "_setCarouselHeightToSlideHeight",
    value: function _setCarouselHeightToSlideHeight() {
      // If the carousel is 100% width and the current slide exceeds the window.innerHeight
      // then the slide widths will each be reduced by a factor of the browser's scrollbar width
      this.style.height = "".concat(this._currentSlide.el.offsetHeight + this._getSlideSelectorsHeight(), "px");
    }
  }, {
    key: "_setContainerStyle",
    value: function _setContainerStyle() {
      var _this6 = this;

      Array.from(this._container.children).forEach(function (slide) {
        _this6._setSlideStyle(slide);
      });
      return Promise.resolve();
    }
  }, {
    key: "_setCurrentSlide",
    value: function _setCurrentSlide(slideIndex) {
      var requestedSlide = this._slides[slideIndex];

      if (!requestedSlide || requestedSlide === this._currentSlide) {
        return;
      }

      this._currentSlide = this._slides[slideIndex];

      this._onCurrentSlideChange();
    }
  }, {
    key: "_setInitialTouchMoveDirection",
    value: function _setInitialTouchMoveDirection() {
      var _this$_touchMoveData = this._touchMoveData,
          distanceX = _this$_touchMoveData.distanceX,
          distanceY = _this$_touchMoveData.distanceY;
      this._touchMoveData.initialDirection = distanceX.toPositive() < distanceY.toPositive() ? 'vertical' : 'horizontal';
    }
  }, {
    key: "_setSlideStyle",
    value: function _setSlideStyle(slide) {
      var slideStyles = {
        'box-sizing': 'border-box',
        width: '100%',
        overflow: 'hidden',
        'flex-shrink': '0'
      };
      Object.keys(slideStyles).forEach(function (prop) {
        slide.style[prop] = slideStyles[prop];
      });
    }
  }, {
    key: "_setTouchActive",
    value: function _setTouchActive(bool) {
      this._touchActive = bool;

      switch (bool) {
        case true:
          this.classList.add('--touch-active');
          break;

        case false:
          this._touchMoveInProgress = false;
          this.classList.remove('--touch-active');
          break;

        default: // do nothing

      }
    }
  }, {
    key: "_slideIntoView",
    value: function _slideIntoView(slide) {
      var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var offsetX = this._getPrecedingSlideWidths(slide) * -1;

      if (!animate) {
        this.classList.add('--no-animate');
      }

      this._slideTo(offsetX);

      this._currentOffsetX = offsetX;
    }
  }, {
    key: "_slideTo",
    value: function _slideTo(offsetX) {
      return __awaiter(this, void 0, void 0,
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var maxNegativeOffsetX, translateX;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                maxNegativeOffsetX = this._getMaxNegativeOffsetX();
                translateX = offsetX > this._maxOffsetX ? 0 : offsetX < maxNegativeOffsetX ? maxNegativeOffsetX : offsetX;
                this._container.style.transform = "translateX(".concat(translateX, "px)");

                this._setCarouselHeightToSlideHeight();

                if (this._touchActive) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 7;
                return index_1.wait(this._transitionSpeedInMillis);

              case 7:
                this.classList.remove('--no-animate');

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
    }
  }, {
    key: "_syncAttr",
    value: function _syncAttr(name, val) {
      this.setAttribute(name, val);
    }
  }, {
    key: "updateCarouselHeight",
    value: function updateCarouselHeight() {
      this._setCarouselHeightToSlideHeight();
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      return __awaiter(this, void 0, void 0,
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _this7 = this;

        var requiredSlottedContent, slideSelectorsSlot, currentslideAttrAsIndex;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return index_1.wait(0);

              case 2:
                // without this timeout, puppeteer tests will fail (with requiredSlotMissingError)
                requiredSlottedContent = this.querySelector('[slot=slides]');

                if (!(!requiredSlottedContent || !requiredSlottedContent.children.length)) {
                  _context3.next = 5;
                  break;
                }

                throw Error(requiredSlotMissingError('slides'));

              case 5:
                this._slides = Array.from(requiredSlottedContent.children).map(function (slide, i) {
                  return {
                    id: i + 1,
                    index: i,
                    el: slide
                  };
                }); // Optional "slide-selectors" slot

                slideSelectorsSlot = this.querySelector('[slot=slide-selectors]');

                if (slideSelectorsSlot) {
                  Array.from(this.querySelector('[slot=slide-selectors]').children).map(function (item, i) {
                    item.addEventListener('pointerup', function (e) {
                      e.preventDefault();

                      if (_this7._touchMoveInProgress) {
                        return;
                      }

                      _this7._setCurrentSlide(i);

                      _this7._setTouchActive(false);

                      _this7._slideIntoView(_this7._currentSlide, false);
                    });
                  });
                  this._slideSelectors = slideSelectorsSlot;
                }

                this._container = requiredSlottedContent;
                currentslideAttrAsIndex = parseInt(this._currentslide, 10) - 1;

                this._setCurrentSlide(currentslideAttrAsIndex || 0);

                setTimeout(function () {
                  // Timeout neccessary or this._setContainerStyle() will be called
                  // before the element has loaded.
                  // ---------------------------------------------------------------------------------
                  // According to MDN: The connectedCallback lifecycle callback is invoked each time
                  // the custom element is appended into a document-connected element. This will
                  // happen each time the node is moved, and may happen before the element's contents
                  // have been fully parsed.
                  // ----------------------------------------------------------------------------------
                  _this7._setContainerStyle();

                  _this7._slideIntoView(_this7._currentSlide, false);

                  var images = Array.from(_this7._container.querySelectorAll('img'));
                  images.forEach(function (img) {
                    img.style.backgroundColor = _this7._getRandomRGBA();

                    if (_this7._loading === 'eager') {
                      return;
                    }

                    _this7._lazyLoad(img);
                  });

                  _this7.classList.add('--ready');

                  _this7.dispatchEvent(new CustomEvent('load'));
                });

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(name, _oldVal, newVal) {
      if (this[name] === newVal) {
        return;
      }

      this[name] = newVal;
    }
  }, {
    key: "currentslide",
    set: function set(slideNumber) {
      if (this._currentslide == slideNumber) {
        // non-strict == is intentional
        return;
      }

      this._currentslide = slideNumber.toString();

      this._syncAttr('currentslide', slideNumber);

      var slideIndex = parseInt(slideNumber, 10) - 1;
      var requestedSlide = this._slides[slideIndex];

      if (!requestedSlide) {
        return;
      }

      this._setCurrentSlide(requestedSlide.index);

      this._slideIntoView(requestedSlide, false);
    },
    get: function get() {
      return this._currentslide;
    }
  }, {
    key: "loading",
    set: function set(val) {
      this._loading = val;

      this._syncAttr('loading', val);
    },
    get: function get() {
      return this._loading;
    }
  }], [{
    key: "observedAttributes",
    get: function get() {
      return ['currentslide', 'loading'];
    }
  }]);

  return HTMLZooduckCarouselElement;
}(_wrapNativeSuper(HTMLElement));

exports.HTMLZooduckCarouselElement = HTMLZooduckCarouselElement;
customElements.define(tagName, HTMLZooduckCarouselElement);
},{"./zooduck-carousel.style":"HB6R","./prototype/Number/to-positive":"vlYQ","../utils/index":"s2T4"}],"HBTe":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* ====================================================== */

/* Font Awesome icons used in compliance with the
/* Creative Commons Attribution 4.0 International license */

/* https://fontawesome.com/license */

/* ====================================================== */

exports.fontAwesomeIcons = {
  'fa-eye': '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" class="svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>',
  'fa-eye-slash': '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash" class="svg-inline--fa fa-eye-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path></svg>',
  'fa-times': '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>'
};
},{}],"BUZM":[function(require,module,exports) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var index_1 = require("./icons/index");

exports.buildCanvas = function (height) {
  var canvas = document.createElement('canvas');
  canvas.height = height;
  return canvas;
};

exports.buildIconSlot = function (slot, icon) {
  var iconSlotEl = document.createElement('slot');
  iconSlotEl.name = slot;
  var svgIconTemplateString = index_1.fontAwesomeIcons[icon];
  var svgIcon = document.createRange().createContextualFragment(svgIconTemplateString);
  iconSlotEl.appendChild(svgIcon);
  return iconSlotEl;
};

exports.buildInput = function () {
  var input = document.createElement('input');
  input.type = 'text';
  return input;
};

exports.buildInputLabelContainer = function () {
  var containerEl = document.createElement('div');
  containerEl.classList.add('input-label-container');
  return containerEl;
};

exports.buildLabel = function () {
  var labelEl = document.createElement('div');
  labelEl.classList.add('label');
  return labelEl;
};

var CanvasEvents =
/*#__PURE__*/
function () {
  function CanvasEvents(canvas) {
    _classCallCheck(this, CanvasEvents);

    this._canDraw = false;
    this._lineWidth = 3;
    this._signatureInkColorDefault = '#222';
    this._canvas = canvas;
  }

  _createClass(CanvasEvents, [{
    key: "_eventType",
    value: function _eventType(e) {
      return e.constructor.name;
    }
  }, {
    key: "_getEventCoords",
    value: function _getEventCoords(e) {
      var x = this._eventType(e) === 'TouchEvent' ? e.touches[0].clientX - this._domRect.x : e.clientX - this._domRect.x;
      var y = this._eventType(e) === 'TouchEvent' ? e.touches[0].clientY - this._domRect.y : e.clientY - this._domRect.y;
      return {
        x: x,
        y: y
      };
    }
  }, {
    key: "_isTouchInCanvas",
    value: function _isTouchInCanvas(eventCoords) {
      if (eventCoords.x < 0 || eventCoords.y < 0 || eventCoords.x > this._domRect.width || eventCoords.y > this._domRect.height) {
        return false;
      }

      return true;
    }
  }, {
    key: "onTouchStart",
    value: function onTouchStart(e) {
      if (this._eventType(e) !== 'MouseEvent' && this._eventType(e) !== 'TouchEvent') {
        return;
      }

      this._canDraw = true;
      this._domRect = this._canvas.getBoundingClientRect();

      var eventCoords = this._getEventCoords(e);

      this._context = this._canvas.getContext('2d');
      this._context.lineWidth = this._lineWidth;
      this._context.lineCap = 'round';

      if (this._signatureInkColor) {
        this._context.strokeStyle = this._signatureInkColor;
      } else {
        this._context.strokeStyle = this._signatureInkColorDefault;
      }

      this._context.beginPath();

      this._context.moveTo(eventCoords.x, eventCoords.y);

      this._context.lineTo(eventCoords.x, eventCoords.y);

      this._context.stroke();
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      if (this._canDraw) {
        var eventCoords = this._getEventCoords(e);

        if (!this._isTouchInCanvas(eventCoords)) {
          this._canDraw = false;
          return;
        }

        this._context.lineTo(eventCoords.x, eventCoords.y);

        this._context.stroke();

        this._context.beginPath();

        this._context.moveTo(eventCoords.x, eventCoords.y);
      }
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd() {
      if (!this._canDraw) {
        return;
      }

      this._canDraw = false;
      this._imageData = this._canvas.toDataURL();
    }
  }, {
    key: "clearImageData",
    value: function clearImageData() {
      this._imageData = '';
    }
  }, {
    key: "imageData",
    get: function get() {
      return this._imageData;
    }
  }, {
    key: "signatureInkColor",
    set: function set(color) {
      this._signatureInkColor = color;
    }
  }]);

  return CanvasEvents;
}();

exports.CanvasEvents = CanvasEvents;
},{"./icons/index":"HBTe"}],"kAh0":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.style = "\n/**\n * @var --zooduck-input-font-family: The `font-family` style of the element. Defaults to `'Roboto', sans-serif`.\n * @var --zooduck-input-font-size: The `font-size` style of the element. Defaults to `19px`.\n * @var --zooduck-input-font-weight: The `font-weight` style of the element. Defaults to `inherit`.\n * @var --zooduck-input-font-style: The `font-style` style of the element. Defaults to `inherit`.\n * @var --zooduck-input-width: The `width` style of the element. Defaults to `auto`.\n * @var --zooduck-input-border-style: The `border-style` style of the element. Defaults to `solid`.\n * @var --zooduck-input-border-color: The `border-color` style of the element. Defaults to `var(--gray)`.\n * @var --zooduck-input-border-width: The `border-width` style of the element. Defaults to `1px`.\n * @var --zooduck-input-background-color: The `background-color` style of the element. Defaults to `#fff`.\n * @var --zooduck-input-disabled-background-color: The `background-color` style of the element when its `disabled` attribute is set. Defaults to `#eee`.\n * @var --zooduck-input-color: The `color` style of the element's input. Defaults to `var(--black)`.\n * @var --zooduck-input-label-color: The `color` style of the element's label. Defaults to `var(--gray)`.\n * @var --zooduck-input-icon-color: The `color` style of the icon slots. Defaults to `var(--zooduck-input-label-color, var(--gray))`.\n * @var --zooduck-input-icon-padding: The `padding` style of icon slots. Defaults to `0 20px`.\n * @var --zooduck-input-signature-border-color: The `border-color` style of the signature canvas. Defaults to `#eee`.\n */\n\n:host {\n    --gray: #bbb;\n    --black: #222;\n    --disabled: #eee;\n\n    position: relative;\n    display: flex;\n    width: var(--zooduck-input-width, auto);\n    border-style: var(--zooduck-input-border-style, solid);\n    border-color: var(--zooduck-input-border-color, var(--gray));\n    border-width: var(--zooduck-input-border-width, 1px);\n    background-color: var(--zooduck-input-background-color, #fff);\n\n    font-family: var(--zooduck-input-font-family, 'Roboto', sans-serif);\n    font-size: var(--zooduck-input-font-size, 19px);\n    font-weight: var(--zooduck-input-font-weight, inherit);\n    font-style: var(--zooduck-input-font-style, inherit);\n}\n:host([disabled]),\n:host([disabled]) input {\n    background-color: var(--zooduck-input-disabled-background-color, var(--disabled));\n}\n.input-label-container {\n    display: flex;\n    flex-grow: 1;\n}\n.label {\n    display: none;\n}\n:host(.--has-valid-label) .label {\n    display: block;\n    user-select: none;\n    position: absolute;\n    pointer-events: none;\n    color: var(--zooduck-input-label-color, var(--gray));\n    text-align: left;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    width: calc(100% - 10px);\n    overflow: hidden;\n    left: 10px;\n    top: 50%;\n    transform-origin: left top;\n    transform: translateY(-50%);\n    transition: all .25s;\n}\n:host([required]) .label:after {\n    content: \"*\";\n}\n:host(.--active) .label,\n:host(.--has-content) .label,\n:host([type=signature]) .label {\n    top: 5px;\n    transform: translateY(0) scale(.8);\n}\n:host(.--has-left-icon) .label {\n    left: 0;\n}\ninput {\n    width: 100%;\n    border: none;\n    outline: none;\n    flex-grow: 1;\n    padding: 10px;\n    font-family: var(--zooduck-input-font-family, inherit);\n    font-size: var(--zooduck-input-font-size, 19px);\n    font-weight: var(--zooduck-input-font-weight, inherit);\n    font-style: var(--zooduck-input-font-style, inherit);\n    background-color: var(--zooduck-input-background-color, #fff);\n    color: var(--zooduck-input-color, var(--black));\n}\n:host(.--has-left-icon) input {\n    padding-left: 0;\n}\ncanvas {\n   display: none;\n}\n:host([type=signature]) input {\n    display: none;\n}\n:host([type=signature]) canvas {\n    display: block;\n    margin-top: calc(var(--zooduck-input-font-size, 19px) + 15px);\n    border-style: dashed;\n    border-color: var(--zooduck-input-signature-border-color, #eee);\n    border-width: 6px 6px 0 0;\n}\n:host(.--has-valid-label) input {\n    padding-top: calc(var(--zooduck-input-font-size, 19px) + 5px);\n}\n::slotted(*),\nslot > * {\n    padding: var(--zooduck-input-icon-padding, 0 20px);\n}\nslot[hidden] {\n    display: none !important;\n}\nslot[name*=icon] {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: var(--zooduck-input-font-size, 19px);\n    color: var(--zooduck-input-icon-color, var(--zooduck-input-label-color, var(--gray)));\n}\nslot[name*=icon] svg {\n    height: var(--zooduck-input-font-size, 19px);\n}\nslot[name^=right-icon] {\n    cursor: pointer;\n    display: none;\n}\n:host(:not([type=password])) slot[name=right-icon-clear-input] {\n    display: flex;\n}\n:host([type=password]:not(.--show-password)) slot[name=right-icon-show-password] {\n    display: flex;\n}\n:host([type=password].--show-password) slot[name=right-icon-hide-password] {\n    display: flex;\n}\n.--zooduck-input-filter-hidden {\n    display: none;\n}\n";
},{}],"YxNP":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.globalStyle = "\n.--zooduck-input-filter-hidden {\n    display: none;\n}\n";
},{}],"Y4ya":[function(require,module,exports) {
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var utils = __importStar(require("./zooduck-input-utils"));

var zooduck_input_style_1 = require("./zooduck-input.style");

var zooduck_input_global_style_1 = require("./zooduck-input.global-style");

var HTMLZooduckInputElement =
/*#__PURE__*/
function (_HTMLElement) {
  _inherits(HTMLZooduckInputElement, _HTMLElement);

  function HTMLZooduckInputElement() {
    var _this;

    _classCallCheck(this, HTMLZooduckInputElement);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLZooduckInputElement).call(this));
    _this._booleanAttrs = ['autofocus', 'disabled', 'noicons', 'readonly', 'required'];
    _this._camelCaseProps = {
      noicons: 'noIcons',
      readonly: 'readOnly',
      signatureinkcolor: 'signatureInkColor'
    };
    _this._canvasHeight = 90;
    _this._keyupEnterEvent = 'keyup:enter';
    _this._filterEventName = 'zooduck-input:filter';
    _this._filterHiddenClass = '--zooduck-input-filter-hidden';
    _this._filterMinChars = 2;
    _this._filterTagsName = 'zooduck-input-tags';
    _this._sharedAttrs = ['autocomplete', 'autofocus', 'disabled', 'name', 'placeholder', 'readonly', 'required', 'type', 'value'];
    _this._signatureInkColor = '#222';
    _this._supportedTypes = ['email', 'password', 'tel', 'text', 'url'];
    _this._customTypes = ['filter', 'signature'];

    _this._addInputLabelContainer = function () {
      _this._inputLabelContainer.appendChild(_this._input);

      _this._inputLabelContainer.appendChild(_this._canvas);

      _this._inputLabelContainer.appendChild(_this._labelEl);

      _this.root.appendChild(_this._inputLabelContainer);
    };

    _this._addSlots = function () {
      _this.root.insertBefore(_this._leftIconSlot, _this._inputLabelContainer);

      _this.root.appendChild(_this._clearInputIconSlot);

      _this.root.appendChild(_this._showPasswordIconSlot);

      _this.root.appendChild(_this._hidePasswordIconSlot);

      _this._setHasLeftIconSlotModifierClass();
    };

    _this._applyFilter = function () {
      if (_this._type !== 'filter') {
        return;
      }

      var sections = Array.from(document.querySelectorAll("[".concat(_this._filterTagsName, "]")));

      var allTags = _this._getAllFilterTags(sections);

      var matchingTags = _this._getMatchingTags(allTags);

      var matchingSections = _this._getMatchingSections(sections, matchingTags);

      sections.forEach(function (section) {
        if (!matchingSections.includes(section)) {
          section.classList.add(_this._filterHiddenClass);
        } else {
          section.classList.remove(_this._filterHiddenClass);
        }
      });
      var filterValid = matchingTags.length != allTags.length;

      if (filterValid) {
        _this.dispatchEvent(new CustomEvent(_this._filterEventName, {
          detail: {
            tags: allTags,
            matchingTags: matchingTags,
            matchingElements: matchingSections
          }
        }));

        window.scrollTo(0, 0);
      }
    };

    _this._value = '';
    _this._label = '';
    _this._placeholder = '';

    var shadow = _this.attachShadow({
      mode: 'open'
    });

    var style = document.createElement('style');
    shadow.appendChild(style);
    _this._inputLabelContainer = utils.buildInputLabelContainer();
    _this._input = utils.buildInput();
    _this._canvas = utils.buildCanvas(_this._canvasHeight);
    _this._canvasEvents = new utils.CanvasEvents(_this._canvas);
    _this._labelEl = utils.buildLabel();
    _this._leftIconSlot = document.createElement('slot');

    _this._leftIconSlot.setAttribute('name', 'left-icon');

    _this._clearInputIconSlot = utils.buildIconSlot('right-icon-clear-input', 'fa-times');
    _this._showPasswordIconSlot = utils.buildIconSlot('right-icon-show-password', 'fa-eye');
    _this._hidePasswordIconSlot = utils.buildIconSlot('right-icon-hide-password', 'fa-eye-slash');
    return _this;
  }

  _createClass(HTMLZooduckInputElement, [{
    key: "_addCanvasEvents",
    value: function _addCanvasEvents() {
      var _this2 = this;

      this._canvas.addEventListener('mousedown', function (e) {
        return _this2._canvasEvents.onTouchStart(e);
      });

      this._canvas.addEventListener('mousemove', function (e) {
        return _this2._canvasEvents.onTouchMove(e);
      });

      this._canvas.addEventListener('mouseup', function () {
        return _this2._canvasOnTouchEnd();
      });

      this._canvas.addEventListener('mouseout', function () {
        return _this2._canvasOnTouchEnd();
      });

      this._canvas.addEventListener('touchstart', function (e) {
        return _this2._canvasEvents.onTouchStart(e);
      });

      this._canvas.addEventListener('touchmove', function (e) {
        return _this2._canvasEvents.onTouchMove(e);
      });

      this._canvas.addEventListener('touchcancel', function () {
        return _this2._canvasOnTouchEnd();
      });

      this._canvas.addEventListener('touchend', function () {
        return _this2._canvasOnTouchEnd();
      });
    }
  }, {
    key: "_addEvents",
    value: function _addEvents() {
      var _this3 = this;

      window.addEventListener('resize', function () {
        _this3._updateCanvasWidth();
      });

      this._addCanvasEvents();

      this.addEventListener('click', function () {
        _this3._input.focus();
      });

      this._input.addEventListener('focus', function () {
        _this3.classList.add('--active');

        if (_this3._placeholder) {
          _this3._input.setAttribute('placeholder', _this3._placeholder);
        }
      });

      this._input.addEventListener('blur', function () {
        _this3.classList.remove('--active');

        if (_this3._placeholder && _this3._label) {
          _this3._input.removeAttribute('placeholder');
        }
      });

      this._input.addEventListener('input', function () {
        _this3.value = _this3._input.value;

        _this3._updateValue();
      });

      this._input.addEventListener('keyup', function (e) {
        var isEnterKey = e.code === 'Enter' || e.key === 'Enter' || e.keyCode === 13 || e.which === 13;

        if (isEnterKey) {
          _this3.dispatchEvent(new CustomEvent(_this3._keyupEnterEvent, {
            detail: {
              value: _this3._input.value
            }
          }));
        }
      });

      this._leftIconSlot.addEventListener('mousedown', function (e) {
        e.preventDefault();
      });

      [this._clearInputIconSlot, this._showPasswordIconSlot, this._hidePasswordIconSlot].forEach(function (slot) {
        slot.addEventListener('mousedown', function (e) {
          return e.preventDefault();
        });
      });

      this._clearInputIconSlot.addEventListener('click', function () {
        _this3.value = '';

        if (_this3.type === 'signature') {
          _this3._clearCanvas();
        } else {
          _this3._input.focus();
        }
      });

      this._showPasswordIconSlot.addEventListener('click', function () {
        _this3._input.type = 'text';

        _this3._input.focus();

        _this3.classList.add('--show-password');
      });

      this._hidePasswordIconSlot.addEventListener('click', function () {
        _this3._input.type = 'password';

        _this3._input.focus();

        _this3.classList.remove('--show-password');
      });
    }
  }, {
    key: "_addFonts",
    value: function _addFonts() {
      var style = document.createElement('style');
      style.innerText = '@import url("https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i&display=swap")';
      this.appendChild(style);
    }
  }, {
    key: "_canvasOnTouchEnd",
    value: function _canvasOnTouchEnd() {
      this._canvasEvents.onTouchEnd();

      this.value = this._canvasEvents.imageData;
    }
  }, {
    key: "_clearCanvas",
    value: function _clearCanvas() {
      var context = this._canvas.getContext('2d');

      context.clearRect(0, 0, this._canvas.width, this._canvas.height);

      this._canvasEvents.clearImageData();
    }
  }, {
    key: "_getAllFilterTags",
    value: function _getAllFilterTags(sections) {
      var _this4 = this;

      var allTags = [];
      sections.forEach(function (section) {
        var tags = section.getAttribute(_this4._filterTagsName).split(' ').filter(function (tag) {
          return !allTags.includes(tag);
        });
        allTags = allTags.concat(tags);
      });
      return allTags;
    }
  }, {
    key: "_getMatchingSections",
    value: function _getMatchingSections(sections, matchingTags) {
      var _this5 = this;

      var matchingSections = matchingTags.length ? sections.filter(function (section) {
        var tags = section.getAttribute(_this5._filterTagsName);
        var matchingTagsPattern = new RegExp("(".concat(matchingTags.join('|'), ")"));
        return tags.search(matchingTagsPattern) !== -1;
      }) : [];
      return matchingSections;
    }
  }, {
    key: "_getMatchingTags",
    value: function _getMatchingTags(allTags) {
      var _this6 = this;

      return allTags.filter(function (tag) {
        var inputValuePattern = new RegExp("(".concat(_this6._input.value.split(' ').filter(function (val) {
          return val.trim().length >= _this6._filterMinChars;
        }).join('|'), ")"));
        return inputValuePattern.test(tag) || new RegExp(tag).test(_this6._input.value);
      });
    }
  }, {
    key: "_isBooleanAttr",
    value: function _isBooleanAttr(attr) {
      return this._booleanAttrs.includes(attr);
    }
  }, {
    key: "_setHasLeftIconSlotModifierClass",
    value: function _setHasLeftIconSlotModifierClass() {
      if (!this._leftIconSlot.assignedNodes) {
        return;
      }

      if (this._leftIconSlot.assignedNodes.length) {
        this.classList.add('--has-left-icon');
      }
    }
  }, {
    key: "_setup",
    value: function _setup() {
      this._addInputLabelContainer();

      this._addSlots();

      this._addEvents();

      this._addFonts();

      this._updateStyle();

      this._updateCanvasWidth();
    }
  }, {
    key: "_syncBooleanAttribute",
    value: function _syncBooleanAttribute(attr, val) {
      if (val && !this.hasAttribute(attr)) {
        this.setAttribute(attr, '');
      } else if (!val && this.hasAttribute(attr)) {
        this.removeAttribute(attr);
      }

      if (val) {
        this._updateRawInput(attr, '');
      } else {
        this._sharedAttrs.includes(attr) && this._input.removeAttribute(attr);
      }
    }
  }, {
    key: "_syncStringAttribute",
    value: function _syncStringAttribute(attr, val) {
      if (val === null || val === undefined) {
        /**
         * This is an **intentional deviation** from the default behaviour of attributes / properties.
         * It will **REMOVE** the attribute if you set the property for that attribute to **null**.
         * This is in parallel with the **attributeChangedCallback** lifecycle callback that returns
         * a value of **null** when an attribute is removed.
         *
         * See below for an example of the (ridiculous) default behaviour @17-10-2019.
         *
         * Example
         * ```
         * <input placeholder="placeholder" />
         * <script>
         * const input = document.querySelector('input');
         * input.placeholder = null;
         * </script>
         * ```
         *
         * Result
         * ```
         * <input placeholder="null" />
         * ```
         */
        this.removeAttribute(attr);
        this._sharedAttrs.includes(attr) && this._input.removeAttribute(attr);
        return;
      }

      if (typeof val !== 'string') {
        val = JSON.stringify(val);
      }

      if (!this.hasAttribute(attr) || this.getAttribute(attr) !== val) {
        this.setAttribute(attr, val);
      }

      this._updateRawInput(attr, val);
    }
  }, {
    key: "_updateCanvasWidth",
    value: function _updateCanvasWidth() {
      this._canvas.width = 0;
      this._canvas.width = this._inputLabelContainer.offsetWidth;
    }
  }, {
    key: "_updateHasValidLabelClass",
    value: function _updateHasValidLabelClass() {
      if (this._label) {
        this.classList.add('--has-valid-label');
      } else {
        this.classList.remove('--has-valid-label');
      }
    }
  }, {
    key: "_updateIconSlotsDisplay",
    value: function _updateIconSlotsDisplay(options) {
      [this._leftIconSlot, this._clearInputIconSlot, this._showPasswordIconSlot, this._hidePasswordIconSlot].forEach(function (slot) {
        slot.hidden = !options.showSlots;
      });
    }
  }, {
    key: "_updateLabel",
    value: function _updateLabel() {
      this._syncStringAttribute('label', this._label);

      if (typeof this._label === 'string') {
        this._labelEl.innerHTML = this._label;
      }

      if (!this._label && this._placeholder) {
        this._syncStringAttribute('placeholder', this._placeholder);
      }

      if (this._label && this._placeholder) {
        this._input.removeAttribute('placeholder');
      }

      this._updateHasValidLabelClass();
    }
  }, {
    key: "_updateNoIcons",
    value: function _updateNoIcons() {
      this._syncBooleanAttribute('noicons', this._noIcons);

      if (this._noIcons) {
        this._updateIconSlotsDisplay({
          showSlots: false
        });
      } else {
        this._updateIconSlotsDisplay({
          showSlots: true
        });
      }
    }
  }, {
    key: "_updatePlaceholder",
    value: function _updatePlaceholder() {
      this._syncStringAttribute('placeholder', this._placeholder);
    }
  }, {
    key: "_updateRawInput",
    value: function _updateRawInput(attr, val) {
      if (attr === 'placeholder' && this._label) {
        return;
      }

      if (attr === 'type') {
        this._supportedTypes.includes(val) ? this._input.setAttribute(attr, val) : this._input.removeAttribute(attr);
      } else {
        this._sharedAttrs.includes(attr) && this._input.setAttribute(attr, val);
      }
    }
  }, {
    key: "_updateStyle",
    value: function _updateStyle() {
      var styleEl = this.shadowRoot.querySelector('style');
      styleEl.textContent = zooduck_input_style_1.style;
      var globalStyleEl = document.createElement('style');
      globalStyleEl.textContent = zooduck_input_global_style_1.globalStyle;
      document.head.appendChild(globalStyleEl);
    }
  }, {
    key: "_updateType",
    value: function _updateType() {
      this._syncStringAttribute('type', this._type);

      this._value = '';

      this._clearCanvas();

      this.classList.remove('--show-password');
    }
  }, {
    key: "_updateValue",
    value: function _updateValue() {
      this._syncStringAttribute('value', this._value);

      if (this._value) {
        this.classList.add('--has-content');
      } else {
        this.classList.remove('--has-content');
      }

      this._applyFilter();
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      return __awaiter(this, void 0, void 0,
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.isConnected) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                this._setup();

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(name, _oldVal, newVal) {
      var prop = this._camelCaseProps[name] || name;

      if (this[prop] === newVal) {
        return;
      }

      if (this._isBooleanAttr(name)) {
        this[prop] = this.hasAttribute(name);
      } else {
        this[prop] = newVal;
      }
    }
  }, {
    key: "autocomplete",
    get: function get() {
      return this._autocomplete;
    },
    set: function set(val) {
      this._autocomplete = val;

      this._syncStringAttribute('autocomplete', this.autocomplete);
    }
  }, {
    key: "autofocus",
    get: function get() {
      return this._autofocus;
    },
    set: function set(val) {
      this._autofocus = val;

      this._syncBooleanAttribute('autofocus', this.autofocus);
    }
  }, {
    key: "disabled",
    get: function get() {
      return this._disabled;
    },
    set: function set(val) {
      this._disabled = val;

      this._syncBooleanAttribute('disabled', this.disabled);
    }
  }, {
    key: "filter",
    get: function get() {
      return this._filter;
    },
    set: function set(val) {
      this._filter = val;
    }
  }, {
    key: "label",
    get: function get() {
      return this._label;
    },
    set: function set(val) {
      this._label = val;

      this._updateLabel();
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(val) {
      this._name = val;

      this._syncStringAttribute('name', this.name);
    }
  }, {
    key: "noIcons",
    get: function get() {
      return this._noIcons;
    },
    set: function set(val) {
      this._noIcons = val;

      this._updateNoIcons();
    }
  }, {
    key: "placeholder",
    get: function get() {
      return this._placeholder;
    },
    set: function set(val) {
      this._placeholder = val;

      this._updatePlaceholder();
    }
  }, {
    key: "required",
    get: function get() {
      return this._required;
    },
    set: function set(val) {
      this._required = val;

      this._syncBooleanAttribute('required', this.required);
    }
  }, {
    key: "readOnly",
    get: function get() {
      return this._readOnly;
    },
    set: function set(val) {
      this._readOnly = val;

      this._syncBooleanAttribute('readonly', val);
    }
  }, {
    key: "root",
    get: function get() {
      return this.shadowRoot || this;
    }
  }, {
    key: "signatureInkColor",
    get: function get() {
      return this._signatureInkColor;
    },
    set: function set(val) {
      this._signatureInkColor = val;
      this._canvasEvents.signatureInkColor = this.signatureInkColor;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(val) {
      var inferredVal = val;

      var allSupportedTypes = this._supportedTypes.concat(this._customTypes);

      if (!allSupportedTypes.includes(val) && val !== null) {
        inferredVal = 'text';
      }

      this._type = inferredVal;

      this._updateType();
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(val) {
      this._value = val;
      this._input.value = val;

      this._updateValue();
    }
  }], [{
    key: "observedAttributes",
    get: function get() {
      return ['autocomplete', 'autofocus', 'disabled', 'filter', 'label', 'name', 'noicons', 'placeholder', 'readonly', 'required', 'signatureinkcolor', 'type', 'value'];
    }
  }]);

  return HTMLZooduckInputElement;
}(_wrapNativeSuper(HTMLElement));

customElements.define('zooduck-input', HTMLZooduckInputElement);
},{"./zooduck-input-utils":"BUZM","./zooduck-input.style":"kAh0","./zooduck-input.global-style":"YxNP"}],"KH65":[function(require,module,exports) {
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var tagName = 'zooduck-radio';

var HTMLZooduckRadioElement =
/*#__PURE__*/
function (_HTMLElement) {
  _inherits(HTMLZooduckRadioElement, _HTMLElement);

  function HTMLZooduckRadioElement() {
    var _this;

    _classCallCheck(this, HTMLZooduckRadioElement);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLZooduckRadioElement).call(this));
    _this._hasLoaded = false;
    _this._name = '';
    _this._size = '24';
    _this._value = '';

    _this._buildRawInput();

    return _this;
  }

  _createClass(HTMLZooduckRadioElement, [{
    key: "_convertCheckedToBool",
    value: function _convertCheckedToBool(checked) {
      return typeof checked === 'string' ? true : checked;
    }
  }, {
    key: "_buildRawInput",
    value: function _buildRawInput() {
      var _this2 = this;

      this._rawInput = new DOMParser().parseFromString("\n            <input type=\"radio\" name=\"".concat(this._name, "\" value=\"").concat(this._value, "\" />\n        "), 'text/html').body.firstChild;
      this._rawInput.checked = this._checked;

      if (this._checked) {
        this._rawInput.setAttribute('checked', '');
      }

      this._rawInput.addEventListener('change', function () {
        _this2._checked = _this2._rawInput.checked;
      });
    }
  }, {
    key: "_render",
    value: function _render() {
      this.innerHTML = '';
      var style = document.createElement('style');
      this.appendChild(style);

      this._updateStyle();

      var html = new DOMParser().parseFromString("\n            <label class=\"zooduck-radio\">\n                    <i class=\"zooduck-radio__icon --off\"></i>\n                    <i class=\"zooduck-radio__icon --on\"></i>\n                    <span id=\"zooduckRadioValue\" class=\"zooduck-radio__value\">".concat(this._value, "</span>\n            </label>\n        "), 'text/html').body.firstChild;
      html.insertBefore(this._rawInput, html.childNodes[0]);
      this.appendChild(html);
    }
  }, {
    key: "_syncBoolAttr",
    value: function _syncBoolAttr(name, val) {
      if (!val && typeof val !== 'string') {
        this.removeAttribute(name);
        return;
      }

      this.setAttribute(name, '');
    }
  }, {
    key: "_syncStringAttr",
    value: function _syncStringAttr(name, val) {
      this.setAttribute(name, val);
    }
  }, {
    key: "_update",
    value: function _update() {
      this._updateValue();

      this._updateRawInput();

      this._updateStyle();
    }
  }, {
    key: "_updateRawInput",
    value: function _updateRawInput() {
      this._rawInput.name = this._name;
      this._rawInput.value = this._value;
      this._rawInput.checked = this._convertCheckedToBool(this._checked);
    }
  }, {
    key: "_updateStyle",
    value: function _updateStyle() {
      var style = this.querySelector('style');
      var size = parseInt(this._size, 10);
      style.textContent = "\n            .zooduck-radio {\n                display: grid;\n                grid-template-columns: auto 1fr;\n                align-items: center;\n                grid-gap: 5px;\n                cursor: pointer;\n            }\n            .zooduck-radio__value {\n                color: #222;\n            }\n            .zooduck-radio__icon {\n                position: relative;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                width: ".concat(size, "px;\n                height: ").concat(size, "px;\n                border: solid var(--color, #bbb);\n                border-width: calc(").concat(size, "px / 8);\n                border-radius: 50%;\n            }\n            .zooduck-radio__icon.--on {\n                display: none;\n            }\n            .zooduck-radio__icon.--on:before {\n                display: block;\n                content: '';\n                position: absolute;\n                left: 50%;\n                top: 50%;\n                transform: translate(-50%, -50%);\n                width: 50%;\n                height: 50%;\n                clip-path: circle();\n                background-color: var(--color, #bbb);\n            }\n            input[type=radio] {\n                display: none;\n            }\n            input:checked ~.zooduck-radio__icon.--on,\n            input:not(:checked) ~.zooduck-radio__icon.--off {\n                display: flex;\n            }\n            input:not(:checked) ~.zooduck-radio__icon.--on,\n            input:checked ~.zooduck-radio__icon.--off {\n                display: none;\n            }\n        ");
    }
  }, {
    key: "_updateValue",
    value: function _updateValue() {
      this.querySelector('#zooduckRadioValue').innerHTML = this._value;
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(name, _oldVal, newVal) {
      if (newVal === null || this[name] === newVal) {
        return;
      }

      this[name] = newVal;
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      this._render();

      this._update();

      this.dispatchEvent(new CustomEvent('load', {
        detail: {
          name: this._name,
          value: this._value,
          checked: this._checked
        }
      }));
      this._hasLoaded = true;
    }
  }, {
    key: "checked",
    set: function set(val) {
      this._checked = val;

      this._syncBoolAttr('checked', this._checked);

      if (!this._hasLoaded) {
        return;
      }

      this._update();
    },
    get: function get() {
      return this._checked;
    }
  }, {
    key: "name",
    set: function set(val) {
      this._name = val;

      this._syncStringAttr('name', val);

      if (!this._hasLoaded) {
        return;
      }

      this._update();
    },
    get: function get() {
      return this._name;
    }
  }, {
    key: "size",
    set: function set(val) {
      this._size = val;

      this._syncStringAttr('size', val);

      if (!this._hasLoaded) {
        return;
      }

      this._update();
    },
    get: function get() {
      return this._size;
    }
  }, {
    key: "value",
    set: function set(val) {
      this._value = val;

      this._syncStringAttr('value', val);

      if (!this._hasLoaded) {
        return;
      }

      this._update();
    },
    get: function get() {
      return this._value;
    }
  }], [{
    key: "observedAttributes",
    get: function get() {
      return ['checked', 'name', 'size', 'value'];
    }
  }]);

  return HTMLZooduckRadioElement;
}(_wrapNativeSuper(HTMLElement));

customElements.define(tagName, HTMLZooduckRadioElement);
},{}],"vzk8":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.style = function (options) {
  var blinkDuration = options.blinkDuration,
      screenType = options.screenType;
  var backgroundColorBase, colorBase, fontFamilyBase;

  switch (screenType) {
    case 'retro':
      backgroundColorBase = '#222';
      colorBase = 'mediumseagreen';
      fontFamilyBase = '"Courier New", "Courier", monospace';
      break;

    case 'modern':
      backgroundColorBase = '#222';
      colorBase = '#fff';
      fontFamilyBase = '"Courier New", "Courier", monospace';
      break;

    default:
      backgroundColorBase = '#222';
      colorBase = '#fff';
      fontFamilyBase = '"Courier New", "Courier", monospace';
  }

  return "\n        @keyframes blink {\n            0% {\n                background-color: var(--background-color, ".concat(backgroundColorBase, ");\n                color: var(--background-color, ").concat(backgroundColorBase, ");\n            }\n            49% {\n                background-color: var(--background-color, ").concat(backgroundColorBase, ");\n                color: var(--background-color, ").concat(backgroundColorBase, ");\n            }\n            50% {\n                background-color: var(--color, ").concat(colorBase, ");\n                color: var(--color, ").concat(colorBase, ");\n            }\n            100% {\n                background-color: var(--color, ").concat(colorBase, ");\n                color: var(--color, ").concat(colorBase, ");\n            }\n        }\n        .--animate-blink {\n            animation: blink ").concat(blinkDuration, "ms linear infinite;\n        }\n        @keyframes delayVisible {\n            0% {\n                width: 0;\n                height: 0;\n            }\n            1% {\n                width: auto;\n                height: auto;\n            }\n            100% {\n                width: auto;\n                height: auto;\n            }\n        }\n        .--animate-delay-visible {\n            animation: delayVisible .25ms linear both;\n        }\n        @keyframes delayVisibleLine {\n            0% {\n                visbility: hidden;\n                position: absolute;\n                top: 0;\n                left: 0;\n            }\n            1% {\n                visibility: visible;\n                position: static;\n            }\n            99% {\n                visibility: visible;\n                position: static;\n                width: auto;\n                height: auto;\n            }\n            100% {\n                visibility: hidden;\n                position: absolute;\n                top: 0;\n                left: 0;\n                width: 0;\n                height: 0;\n            }\n        }\n        .--animate-delay-visible-line {\n            visibility: hidden;\n            animation: delayVisibleLine .25ms linear both;\n        }\n        @keyframes delayVisibleLastLine {\n            0% {\n                width: 0;\n                height: 0;\n            }\n            1% {\n                width: auto;\n                height: auto;\n            }\n            100% {\n                width: auto;\n                height: auto;\n            }\n        }\n        .--animate-delay-visible-last-line {\n            animation: delayVisibleLastLine .25ms linear both;\n        }\n        :host {\n            box-sizing: border-box;\n            display: block;\n            width: 100%;\n            min-height: var(--height, 250px);\n            overflow: hidden;\n            background-color: var(--background-color, ").concat(backgroundColorBase, ");\n        }\n        .lines {\n            position: relative;\n            padding: 10px;\n            background-color: var(--background-color, ").concat(backgroundColorBase, ");\n        }\n        .line {\n            display: inline-flex;\n            flex-wrap: wrap;\n            width: auto;\n            height: auto;\n            overflow: hidden;\n            font-family: var(--font-family, ").concat(fontFamilyBase, ");\n            font-size: var(--font-size, inherit);\n            font-weight: var(--font-weight, normal);\n            letter-spacing: var(--letter-spacing, normal);\n            color: var(--color, ").concat(colorBase, ");\n            background-color: var(--background-color, ").concat(backgroundColorBase, ");\n        }\n        .line-placeholder {\n            display: inline-block;\n            color: var(--background-color, ").concat(backgroundColorBase, ");\n            width: 1px;\n        }\n        .word {\n            display: flex;\n        }\n        .char {\n            width: 0;\n            overflow: hidden;\n        }\n        .cursor {\n            background-color: var(--color, ").concat(colorBase, ");\n            color: var(--color, ").concat(colorBase, ");\n        }\n        .cursor:before {\n            content: 'X';\n        }\n        slot,\n        ::slotted(*) {\n            display: none;\n        }\n    ");
};
},{}],"wMMK":[function(require,module,exports) {
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var zooduck_terminal_style_1 = require("./zooduck-terminal.style");

var tagName = 'zooduck-terminal';

var HTMLZooduckTerminal =
/*#__PURE__*/
function (_HTMLElement) {
  _inherits(HTMLZooduckTerminal, _HTMLElement);

  function HTMLZooduckTerminal() {
    var _this;

    _classCallCheck(this, HTMLZooduckTerminal);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLZooduckTerminal).call(this));
    _this._cursorBlinkSpeed = '1000';
    _this._delay = '2000';
    _this._domParser = new DOMParser();
    _this._fullStopInterval = '1000';
    _this._lineMode = 'multi';
    _this._screen = 'modern';
    _this._typingSpeed = '50';
    _this._wordBreakInterval = '0';

    _this.attachShadow({
      mode: 'open'
    });

    _this._styleEl = document.createElement('style');

    _this.shadowRoot.appendChild(_this._styleEl);

    _this._message = "\n            Building software for Internet Explorer is like building a jet engine for a pram.\n            It's entirely possible, but completely ridiculous.\n        ".trim().replace(/\s\s/g, '');
    _this._onLoadEvent = new CustomEvent('load');
    return _this;
  }

  _createClass(HTMLZooduckTerminal, [{
    key: "_buildCharacter",
    value: function _buildCharacter(char) {
      var animationDelayInMillis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var style = "animation-delay: ".concat(animationDelayInMillis, "ms");
      var className = 'char --animate-delay-visible';

      var el = this._domParser.parseFromString("\n            <div\n                class=\"".concat(className, "\"\n                style=\"").concat(style, "\">\n                <span>").concat(char, "</span>\n            </div>\n        "), 'text/html').body.firstChild;

      return el;
    }
  }, {
    key: "_buildCursor",
    value: function _buildCursor() {
      return this._domParser.parseFromString("\n            <div class=\"cursor --animate-blink\"></div>\n        ", 'text/html').body.firstChild;
    }
  }, {
    key: "_buildWord",
    value: function _buildWord(charEls) {
      var wordEl = this._domParser.parseFromString("\n            <div class=\"word\"></div>\n        ", 'text/html').body.firstChild;

      charEls.forEach(function (el) {
        wordEl.appendChild(el);
      });
      return wordEl;
    }
  }, {
    key: "_getLines",
    value: function _getLines(words) {
      var _this2 = this;

      var lines = [];
      var lineIndex = 0;

      if (this._lineMode === 'multi') {
        return [words];
      }

      words.forEach(function (word) {
        if (!lines[lineIndex]) {
          lines.push([]);
        }

        lines[lineIndex].push(word);

        if (_this2._wordEndsInFullStop(word)) {
          lineIndex += 1;
        }
      });
      return lines;
    }
  }, {
    key: "_buildLine",
    value: function _buildLine(words) {
      var line = this._domParser.parseFromString("\n            <section class=\"line\"></section>\n        ", 'text/html').body.firstChild;

      words.forEach(function (word) {
        line.appendChild(word);
      });
      return line;
    }
  }, {
    key: "_buildLines",
    value: function _buildLines() {
      var _this3 = this;

      var totalDelayInMillis = this._parseMillis(this._delay);

      var wordBreakIntervalInMillis = this._parseMillis(this._wordBreakInterval);

      var fullStopIntervalInMillis = this._parseMillis(this._fullStopInterval);

      var words = this._message.split(' ');

      var lineDelays = [];

      var lines = this._getLines(words);

      var lineEls = lines.map(function (line, linesArrIndex, linesArr) {
        var words = line.map(function (word, wordsArrIndex, wordsArr) {
          var characterEls = word.split('').map(function (character) {
            var char = character;
            var animationDelayInMillis = _this3._parseMillis(_this3._typingSpeed) + totalDelayInMillis;
            totalDelayInMillis = animationDelayInMillis;
            return _this3._buildCharacter(char, animationDelayInMillis);
          });
          var currentWord = wordsArr[wordsArrIndex];

          if (_this3._wordEndsInFullStop(currentWord)) {
            totalDelayInMillis += fullStopIntervalInMillis;
          }

          var isLastWord = wordsArrIndex === wordsArr.length - 1;

          if (!isLastWord) {
            var animationDelayInMillis = _this3._parseMillis(_this3._typingSpeed) + wordBreakIntervalInMillis + totalDelayInMillis;

            var spaceChar = _this3._buildCharacter('&nbsp;', animationDelayInMillis);

            totalDelayInMillis = animationDelayInMillis;
            characterEls.push(spaceChar);
          }

          return _this3._buildWord(characterEls);
        });
        var isLastLine = linesArrIndex === linesArr.length - 1;
        words.push(_this3._buildCursor());

        var section = _this3._buildLine(words);

        if (_this3._lineMode === 'single') {
          var animateDelayModifier = isLastLine ? '--animate-delay-visible-last-line' : '--animate-delay-visible-line';
          section.classList.add(animateDelayModifier);
        }

        lineDelays.push(totalDelayInMillis);
        return section;
      });
      lineDelays.forEach(function (lineDelay, i, lineDelays) {
        var currentLinesDelay = lineDelay;
        var previousLinesDelay = lineDelays[i - 1];
        var isFirstLine = i === 0;

        if (isFirstLine) {
          var _animationDuration = lineDelays[i];
          lineEls[i].style.animationDuration = "".concat(_animationDuration, "ms");
          return;
        }

        var animationDelay = previousLinesDelay;
        var animationDuration = currentLinesDelay - animationDelay;
        lineEls[i].style.animationDelay = "".concat(animationDelay, "ms");
        lineEls[i].style.animationDuration = "".concat(animationDuration, "ms");
      });
      return lineEls;
    }
  }, {
    key: "_parseMillis",
    value: function _parseMillis(stringNumber) {
      return parseInt(stringNumber, 10) || 0;
    }
  }, {
    key: "_render",
    value: function _render() {
      this._updateStyle();

      var lines = this._buildLines();

      var linesEl = this._domParser.parseFromString("\n            <div class=\"lines\"></div>\n        ", 'text/html').body.firstChild;

      if (this._lineMode === 'single') {
        var linePlaceholder = this._domParser.parseFromString("\n                <div class=\"line-placeholder\">X</div>\n            ", 'text/html').body.firstChild;

        linesEl.appendChild(linePlaceholder);
      }

      lines.forEach(function (line) {
        linesEl.appendChild(line);
      });

      if (!this._hasLoaded) {
        this.shadowRoot.appendChild(linesEl);
      } else {
        this.shadowRoot.replaceChild(linesEl, this._content);
      }

      this._content = linesEl;
    }
  }, {
    key: "_syncAttr",
    value: function _syncAttr(name, val) {
      this.setAttribute(name, val);
    }
  }, {
    key: "_updateStyle",
    value: function _updateStyle() {
      this._styleEl.innerHTML = zooduck_terminal_style_1.style({
        blinkDuration: this._parseMillis(this._cursorBlinkSpeed),
        screenType: this._screen
      });
    }
  }, {
    key: "_update",
    value: function _update() {
      if (!this._hasLoaded) {
        return;
      }

      this._render();
    }
  }, {
    key: "_wordEndsInFullStop",
    value: function _wordEndsInFullStop(word) {
      return /.+[!?.]/.test(word);
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(name, _oldVal, newVal) {
      if (newVal === null || this[name] === newVal) {
        return;
      }

      this[name] = newVal;
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      if (!this.isConnected) {
        return;
      }

      this._render();

      this.dispatchEvent(this._onLoadEvent);
      this._hasLoaded = true;
    }
  }, {
    key: "cursorblinkspeed",
    set: function set(val) {
      this._cursorBlinkSpeed = val;

      this._syncAttr('cursorblinkspeed', val);

      this._update();
    },
    get: function get() {
      return this._cursorBlinkSpeed;
    }
  }, {
    key: "delay",
    set: function set(val) {
      this._delay = val;

      this._syncAttr('delay', val);

      this._update();
    },
    get: function get() {
      return this._delay;
    }
  }, {
    key: "fullstopinterval",
    set: function set(val) {
      this._fullStopInterval = val;

      this._syncAttr('fullstopinterval', val);

      this._update();
    },
    get: function get() {
      return this._fullStopInterval;
    }
  }, {
    key: "linemode",
    set: function set(val) {
      this._lineMode = val;

      this._syncAttr('linemode', val);

      this._update();
    },
    get: function get() {
      return this._lineMode;
    }
  }, {
    key: "message",
    set: function set(val) {
      this._message = val;

      this._syncAttr('message', val);

      this._update();
    },
    get: function get() {
      return this._message;
    }
  }, {
    key: "screen",
    set: function set(val) {
      this._screen = val;

      this._syncAttr('screen', val);

      this._update();
    },
    get: function get() {
      return this._screen;
    }
  }, {
    key: "typingspeed",
    set: function set(val) {
      this._typingSpeed = val;

      this._syncAttr('typingspeed', val);

      this._update();
    },
    get: function get() {
      return this._typingSpeed;
    }
  }, {
    key: "wordbreakinterval",
    set: function set(val) {
      this._wordBreakInterval = val;

      this._syncAttr('wordbreakinterval', val);

      this._update();
    },
    get: function get() {
      return this._wordBreakInterval;
    }
  }], [{
    key: "observedAttributes",
    get: function get() {
      return ['cursorblinkspeed', 'delay', 'fullstopinterval', 'linemode', 'message', 'screen', 'typingspeed', 'wordbreakinterval'];
    }
  }]);

  return HTMLZooduckTerminal;
}(_wrapNativeSuper(HTMLElement));

customElements.define(tagName, HTMLZooduckTerminal);
},{"./zooduck-terminal.style":"vzk8"}],"QCba":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("regenerator-runtime/runtime"); // required for async/await to work with babel7+


require("./zooduck-carousel/zooduck-carousel.component");

require("./zooduck-input/zooduck-input.component.");

require("./zooduck-radio/zooduck-radio.component");

require("./zooduck-terminal/zooduck-terminal.component");
},{"regenerator-runtime/runtime":"QVnC","./zooduck-carousel/zooduck-carousel.component":"tZiM","./zooduck-input/zooduck-input.component.":"Y4ya","./zooduck-radio/zooduck-radio.component":"KH65","./zooduck-terminal/zooduck-terminal.component":"wMMK"}]},{},["QCba"], null)
//# sourceMappingURL=/zooduck-web-components.js.map