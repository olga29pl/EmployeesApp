if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function(predicate) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var thisArg = arguments[1];
            var k = 0;
            while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                k++;
            }
            return undefined;
        },
        configurable: true,
        writable: true
    });
}

if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function(predicate) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var thisArg = arguments[1];
            var k = 0;
            while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                k++;
            }
            return -1;
        },
        configurable: true,
        writable: true
    });
}

if (!Array.prototype.filter){
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
    if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
        throw new TypeError();
    var len = this.length >>> 0,
        res = new Array(len),
        t = this, c = 0, i = -1;
    if (thisArg === undefined){
      while (++i !== len){
        if (i in this){
          if (func(t[i], i, t)){
            res[c++] = t[i];
          }
        }
      }
    }
    else{
      while (++i !== len){
        if (i in this){
          if (func.call(thisArg, t[i], i, t)){
            res[c++] = t[i];
          }
        }
      }
    }
    res.length = c;
    return res;
  };
}