var Me = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function St(r) {
  if (r.__esModule)
    return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function n() {
      return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(n) {
    var o = Object.getOwnPropertyDescriptor(r, n);
    Object.defineProperty(t, n, o.get ? o : {
      enumerable: !0,
      get: function() {
        return r[n];
      }
    });
  }), t;
}
var Yr = "(?:" + [
  "\\|\\|",
  "\\&\\&",
  ";;",
  "\\|\\&",
  "\\<\\(",
  "\\<\\<\\<",
  ">>",
  ">\\&",
  "<\\&",
  "[&;()|<>]"
].join("|") + ")", Ar = new RegExp("^" + Yr + "$"), Or = "|&;()<> \\t", At = '"((\\\\"|[^"])*?)"', Ot = "'((\\\\'|[^'])*?)'", Et = /^#$/, Er = "'", xr = '"', ze = "$", se = "", xt = 4294967296;
for (var Pr = 0; Pr < 4; Pr++)
  se += (xt * Math.random()).toString(16);
var Pt = new RegExp("^" + se);
function $t(r, e) {
  for (var t = e.lastIndex, n = [], o; o = e.exec(r); )
    n.push(o), e.lastIndex === o.index && (e.lastIndex += 1);
  return e.lastIndex = t, n;
}
function It(r, e, t) {
  var n = typeof r == "function" ? r(t) : r[t];
  return typeof n > "u" && t != "" ? n = "" : typeof n > "u" && (n = "$"), typeof n == "object" ? e + se + JSON.stringify(n) + se : e + n;
}
function Ft(r, e, t) {
  t || (t = {});
  var n = t.escape || "\\", o = "(\\" + n + `['"` + Or + `]|[^\\s'"` + Or + "])+", a = new RegExp([
    "(" + Yr + ")",
    // control chars
    "(" + o + "|" + At + "|" + Ot + ")+"
  ].join("|"), "g"), f = $t(r, a);
  if (f.length === 0)
    return [];
  e || (e = {});
  var i = !1;
  return f.map(function(l) {
    var u = l[0];
    if (!u || i)
      return;
    if (Ar.test(u))
      return { op: u };
    var c = !1, b = !1, s = "", g = !1, p;
    function x() {
      p += 1;
      var h, y, $ = u.charAt(p);
      if ($ === "{") {
        if (p += 1, u.charAt(p) === "}")
          throw new Error("Bad substitution: " + u.slice(p - 2, p + 1));
        if (h = u.indexOf("}", p), h < 0)
          throw new Error("Bad substitution: " + u.slice(p));
        y = u.slice(p, h), p = h;
      } else if (/[*@#?$!_-]/.test($))
        y = $, p += 1;
      else {
        var m = u.slice(p);
        h = m.match(/[^\w\d_]/), h ? (y = m.slice(0, h.index), p += h.index - 1) : (y = m, p = u.length);
      }
      return It(e, "", y);
    }
    for (p = 0; p < u.length; p++) {
      var d = u.charAt(p);
      if (g = g || !c && (d === "*" || d === "?"), b)
        s += d, b = !1;
      else if (c)
        d === c ? c = !1 : c == Er ? s += d : d === n ? (p += 1, d = u.charAt(p), d === xr || d === n || d === ze ? s += d : s += n + d) : d === ze ? s += x() : s += d;
      else if (d === xr || d === Er)
        c = d;
      else {
        if (Ar.test(d))
          return { op: u };
        if (Et.test(d)) {
          i = !0;
          var F = { comment: r.slice(l.index + p + 1) };
          return s.length ? [s, F] : [F];
        } else
          d === n ? b = !0 : d === ze ? s += x() : s += d;
      }
    }
    return g ? { op: "glob", pattern: s } : s;
  }).reduce(function(l, u) {
    return typeof u > "u" ? l : l.concat(u);
  }, []);
}
var Rt = function(e, t, n) {
  var o = Ft(e, t, n);
  return typeof t != "function" ? o : o.reduce(function(a, f) {
    if (typeof f == "object")
      return a.concat(f);
    var i = f.split(RegExp("(" + se + ".*?" + se + ")", "g"));
    return i.length === 1 ? a.concat(i[0]) : a.concat(i.filter(Boolean).map(function(l) {
      return Pt.test(l) ? JSON.parse(l.split(se)[1]) : l;
    }));
  }, []);
}, et = Rt, we = {}, Ue = { exports: {} };
/*! https://mths.be/punycode v1.4.1 by @mathias */
Ue.exports;
(function(r, e) {
  (function(t) {
    var n = e && !e.nodeType && e, o = r && !r.nodeType && r, a = typeof Me == "object" && Me;
    (a.global === a || a.window === a || a.self === a) && (t = a);
    var f, i = 2147483647, l = 36, u = 1, c = 26, b = 38, s = 700, g = 72, p = 128, x = "-", d = /^xn--/, F = /[^\x20-\x7E]/, h = /[\x2E\u3002\uFF0E\uFF61]/g, y = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    }, $ = l - u, m = Math.floor, w = String.fromCharCode, I;
    function A(v) {
      throw new RangeError(y[v]);
    }
    function E(v, S) {
      for (var P = v.length, D = []; P--; )
        D[P] = S(v[P]);
      return D;
    }
    function R(v, S) {
      var P = v.split("@"), D = "";
      P.length > 1 && (D = P[0] + "@", v = P[1]), v = v.replace(h, ".");
      var T = v.split("."), k = E(T, S).join(".");
      return D + k;
    }
    function K(v) {
      for (var S = [], P = 0, D = v.length, T, k; P < D; )
        T = v.charCodeAt(P++), T >= 55296 && T <= 56319 && P < D ? (k = v.charCodeAt(P++), (k & 64512) == 56320 ? S.push(((T & 1023) << 10) + (k & 1023) + 65536) : (S.push(T), P--)) : S.push(T);
      return S;
    }
    function V(v) {
      return E(v, function(S) {
        var P = "";
        return S > 65535 && (S -= 65536, P += w(S >>> 10 & 1023 | 55296), S = 56320 | S & 1023), P += w(S), P;
      }).join("");
    }
    function _(v) {
      return v - 48 < 10 ? v - 22 : v - 65 < 26 ? v - 65 : v - 97 < 26 ? v - 97 : l;
    }
    function L(v, S) {
      return v + 22 + 75 * (v < 26) - ((S != 0) << 5);
    }
    function W(v, S, P) {
      var D = 0;
      for (v = P ? m(v / s) : v >> 1, v += m(v / S); v > $ * c >> 1; D += l)
        v = m(v / $);
      return m(D + ($ + 1) * v / (v + b));
    }
    function G(v) {
      var S = [], P = v.length, D, T = 0, k = p, B = g, j, Q, X, re, U, z, J, ne, fe;
      for (j = v.lastIndexOf(x), j < 0 && (j = 0), Q = 0; Q < j; ++Q)
        v.charCodeAt(Q) >= 128 && A("not-basic"), S.push(v.charCodeAt(Q));
      for (X = j > 0 ? j + 1 : 0; X < P; ) {
        for (re = T, U = 1, z = l; X >= P && A("invalid-input"), J = _(v.charCodeAt(X++)), (J >= l || J > m((i - T) / U)) && A("overflow"), T += J * U, ne = z <= B ? u : z >= B + c ? c : z - B, !(J < ne); z += l)
          fe = l - ne, U > m(i / fe) && A("overflow"), U *= fe;
        D = S.length + 1, B = W(T - re, D, re == 0), m(T / D) > i - k && A("overflow"), k += m(T / D), T %= D, S.splice(T++, 0, k);
      }
      return V(S);
    }
    function te(v) {
      var S, P, D, T, k, B, j, Q, X, re, U, z = [], J, ne, fe, je;
      for (v = K(v), J = v.length, S = p, P = 0, k = g, B = 0; B < J; ++B)
        U = v[B], U < 128 && z.push(w(U));
      for (D = T = z.length, T && z.push(x); D < J; ) {
        for (j = i, B = 0; B < J; ++B)
          U = v[B], U >= S && U < j && (j = U);
        for (ne = D + 1, j - S > m((i - P) / ne) && A("overflow"), P += (j - S) * ne, S = j, B = 0; B < J; ++B)
          if (U = v[B], U < S && ++P > i && A("overflow"), U == S) {
            for (Q = P, X = l; re = X <= k ? u : X >= k + c ? c : X - k, !(Q < re); X += l)
              je = Q - re, fe = l - re, z.push(
                w(L(re + je % fe, 0))
              ), Q = m(je / fe);
            z.push(w(L(Q, 0))), k = W(P, ne, D == T), P = 0, ++D;
          }
        ++P, ++S;
      }
      return z.join("");
    }
    function Ge(v) {
      return R(v, function(S) {
        return d.test(S) ? G(S.slice(4).toLowerCase()) : S;
      });
    }
    function Re(v) {
      return R(v, function(S) {
        return F.test(S) ? "xn--" + te(S) : S;
      });
    }
    if (f = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      version: "1.4.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      ucs2: {
        decode: K,
        encode: V
      },
      decode: G,
      encode: te,
      toASCII: Re,
      toUnicode: Ge
    }, n && o)
      if (r.exports == n)
        o.exports = f;
      else
        for (I in f)
          f.hasOwnProperty(I) && (n[I] = f[I]);
    else
      t.punycode = f;
  })(Me);
})(Ue, Ue.exports);
var Dt = Ue.exports, Tt = Error, Ct = EvalError, _t = RangeError, Mt = ReferenceError, rt = SyntaxError, $e = TypeError, Nt = URIError, Bt = function() {
  if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
    return !1;
  if (typeof Symbol.iterator == "symbol")
    return !0;
  var e = {}, t = Symbol("test"), n = Object(t);
  if (typeof t == "string" || Object.prototype.toString.call(t) !== "[object Symbol]" || Object.prototype.toString.call(n) !== "[object Symbol]")
    return !1;
  var o = 42;
  e[t] = o;
  for (t in e)
    return !1;
  if (typeof Object.keys == "function" && Object.keys(e).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(e).length !== 0)
    return !1;
  var a = Object.getOwnPropertySymbols(e);
  if (a.length !== 1 || a[0] !== t || !Object.prototype.propertyIsEnumerable.call(e, t))
    return !1;
  if (typeof Object.getOwnPropertyDescriptor == "function") {
    var f = Object.getOwnPropertyDescriptor(e, t);
    if (f.value !== o || f.enumerable !== !0)
      return !1;
  }
  return !0;
}, $r = typeof Symbol < "u" && Symbol, Ut = Bt, qt = function() {
  return typeof $r != "function" || typeof Symbol != "function" || typeof $r("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : Ut();
}, He = {
  __proto__: null,
  foo: {}
}, Lt = Object, Wt = function() {
  return { __proto__: He }.foo === He.foo && !(He instanceof Lt);
}, kt = "Function.prototype.bind called on incompatible ", Gt = Object.prototype.toString, jt = Math.max, zt = "[object Function]", Ir = function(e, t) {
  for (var n = [], o = 0; o < e.length; o += 1)
    n[o] = e[o];
  for (var a = 0; a < t.length; a += 1)
    n[a + e.length] = t[a];
  return n;
}, Ht = function(e, t) {
  for (var n = [], o = t || 0, a = 0; o < e.length; o += 1, a += 1)
    n[a] = e[o];
  return n;
}, Kt = function(r, e) {
  for (var t = "", n = 0; n < r.length; n += 1)
    t += r[n], n + 1 < r.length && (t += e);
  return t;
}, Vt = function(e) {
  var t = this;
  if (typeof t != "function" || Gt.apply(t) !== zt)
    throw new TypeError(kt + t);
  for (var n = Ht(arguments, 1), o, a = function() {
    if (this instanceof o) {
      var c = t.apply(
        this,
        Ir(n, arguments)
      );
      return Object(c) === c ? c : this;
    }
    return t.apply(
      e,
      Ir(n, arguments)
    );
  }, f = jt(0, t.length - n.length), i = [], l = 0; l < f; l++)
    i[l] = "$" + l;
  if (o = Function("binder", "return function (" + Kt(i, ",") + "){ return binder.apply(this,arguments); }")(a), t.prototype) {
    var u = function() {
    };
    u.prototype = t.prototype, o.prototype = new u(), u.prototype = null;
  }
  return o;
}, Qt = Vt, dr = Function.prototype.bind || Qt, Jt = Function.prototype.call, Xt = Object.prototype.hasOwnProperty, Zt = dr, Yt = Zt.call(Jt, Xt), O, en = Tt, rn = Ct, tn = _t, nn = Mt, ve = rt, de = $e, an = Nt, tt = Function, Ke = function(r) {
  try {
    return tt('"use strict"; return (' + r + ").constructor;")();
  } catch {
  }
}, ue = Object.getOwnPropertyDescriptor;
if (ue)
  try {
    ue({}, "");
  } catch {
    ue = null;
  }
var Ve = function() {
  throw new de();
}, on = ue ? function() {
  try {
    return arguments.callee, Ve;
  } catch {
    try {
      return ue(arguments, "callee").get;
    } catch {
      return Ve;
    }
  }
}() : Ve, pe = qt(), fn = Wt(), N = Object.getPrototypeOf || (fn ? function(r) {
  return r.__proto__;
} : null), he = {}, ln = typeof Uint8Array > "u" || !N ? O : N(Uint8Array), ce = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError > "u" ? O : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? O : ArrayBuffer,
  "%ArrayIteratorPrototype%": pe && N ? N([][Symbol.iterator]()) : O,
  "%AsyncFromSyncIteratorPrototype%": O,
  "%AsyncFunction%": he,
  "%AsyncGenerator%": he,
  "%AsyncGeneratorFunction%": he,
  "%AsyncIteratorPrototype%": he,
  "%Atomics%": typeof Atomics > "u" ? O : Atomics,
  "%BigInt%": typeof BigInt > "u" ? O : BigInt,
  "%BigInt64Array%": typeof BigInt64Array > "u" ? O : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array > "u" ? O : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView > "u" ? O : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": en,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": rn,
  "%Float32Array%": typeof Float32Array > "u" ? O : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? O : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? O : FinalizationRegistry,
  "%Function%": tt,
  "%GeneratorFunction%": he,
  "%Int8Array%": typeof Int8Array > "u" ? O : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? O : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? O : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": pe && N ? N(N([][Symbol.iterator]())) : O,
  "%JSON%": typeof JSON == "object" ? JSON : O,
  "%Map%": typeof Map > "u" ? O : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !pe || !N ? O : N((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": Object,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? O : Promise,
  "%Proxy%": typeof Proxy > "u" ? O : Proxy,
  "%RangeError%": tn,
  "%ReferenceError%": nn,
  "%Reflect%": typeof Reflect > "u" ? O : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? O : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !pe || !N ? O : N((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? O : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": pe && N ? N(""[Symbol.iterator]()) : O,
  "%Symbol%": pe ? Symbol : O,
  "%SyntaxError%": ve,
  "%ThrowTypeError%": on,
  "%TypedArray%": ln,
  "%TypeError%": de,
  "%Uint8Array%": typeof Uint8Array > "u" ? O : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? O : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? O : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? O : Uint32Array,
  "%URIError%": an,
  "%WeakMap%": typeof WeakMap > "u" ? O : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? O : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? O : WeakSet
};
if (N)
  try {
    null.error;
  } catch (r) {
    var sn = N(N(r));
    ce["%Error.prototype%"] = sn;
  }
var un = function r(e) {
  var t;
  if (e === "%AsyncFunction%")
    t = Ke("async function () {}");
  else if (e === "%GeneratorFunction%")
    t = Ke("function* () {}");
  else if (e === "%AsyncGeneratorFunction%")
    t = Ke("async function* () {}");
  else if (e === "%AsyncGenerator%") {
    var n = r("%AsyncGeneratorFunction%");
    n && (t = n.prototype);
  } else if (e === "%AsyncIteratorPrototype%") {
    var o = r("%AsyncGenerator%");
    o && N && (t = N(o.prototype));
  }
  return ce[e] = t, t;
}, Fr = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
}, Ie = dr, qe = Yt, cn = Ie.call(Function.call, Array.prototype.concat), pn = Ie.call(Function.apply, Array.prototype.splice), Rr = Ie.call(Function.call, String.prototype.replace), Le = Ie.call(Function.call, String.prototype.slice), yn = Ie.call(Function.call, RegExp.prototype.exec), hn = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, dn = /\\(\\)?/g, mn = function(e) {
  var t = Le(e, 0, 1), n = Le(e, -1);
  if (t === "%" && n !== "%")
    throw new ve("invalid intrinsic syntax, expected closing `%`");
  if (n === "%" && t !== "%")
    throw new ve("invalid intrinsic syntax, expected opening `%`");
  var o = [];
  return Rr(e, hn, function(a, f, i, l) {
    o[o.length] = i ? Rr(l, dn, "$1") : f || a;
  }), o;
}, vn = function(e, t) {
  var n = e, o;
  if (qe(Fr, n) && (o = Fr[n], n = "%" + o[0] + "%"), qe(ce, n)) {
    var a = ce[n];
    if (a === he && (a = un(n)), typeof a > "u" && !t)
      throw new de("intrinsic " + e + " exists, but is not available. Please file an issue!");
    return {
      alias: o,
      name: n,
      value: a
    };
  }
  throw new ve("intrinsic " + e + " does not exist!");
}, Se = function(e, t) {
  if (typeof e != "string" || e.length === 0)
    throw new de("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof t != "boolean")
    throw new de('"allowMissing" argument must be a boolean');
  if (yn(/^%?[^%]*%?$/, e) === null)
    throw new ve("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var n = mn(e), o = n.length > 0 ? n[0] : "", a = vn("%" + o + "%", t), f = a.name, i = a.value, l = !1, u = a.alias;
  u && (o = u[0], pn(n, cn([0, 1], u)));
  for (var c = 1, b = !0; c < n.length; c += 1) {
    var s = n[c], g = Le(s, 0, 1), p = Le(s, -1);
    if ((g === '"' || g === "'" || g === "`" || p === '"' || p === "'" || p === "`") && g !== p)
      throw new ve("property names with quotes must have matching quotes");
    if ((s === "constructor" || !b) && (l = !0), o += "." + s, f = "%" + o + "%", qe(ce, f))
      i = ce[f];
    else if (i != null) {
      if (!(s in i)) {
        if (!t)
          throw new de("base intrinsic for " + e + " exists, but the property is not available.");
        return;
      }
      if (ue && c + 1 >= n.length) {
        var x = ue(i, s);
        b = !!x, b && "get" in x && !("originalValue" in x.get) ? i = x.get : i = i[s];
      } else
        b = qe(i, s), i = i[s];
      b && !l && (ce[f] = i);
    }
  }
  return i;
}, nt = { exports: {} }, Qe, Dr;
function mr() {
  if (Dr)
    return Qe;
  Dr = 1;
  var r = Se, e = r("%Object.defineProperty%", !0) || !1;
  if (e)
    try {
      e({}, "a", { value: 1 });
    } catch {
      e = !1;
    }
  return Qe = e, Qe;
}
var gn = Se, Ne = gn("%Object.getOwnPropertyDescriptor%", !0);
if (Ne)
  try {
    Ne([], "length");
  } catch {
    Ne = null;
  }
var at = Ne, Tr = mr(), bn = rt, ye = $e, Cr = at, wn = function(e, t, n) {
  if (!e || typeof e != "object" && typeof e != "function")
    throw new ye("`obj` must be an object or a function`");
  if (typeof t != "string" && typeof t != "symbol")
    throw new ye("`property` must be a string or a symbol`");
  if (arguments.length > 3 && typeof arguments[3] != "boolean" && arguments[3] !== null)
    throw new ye("`nonEnumerable`, if provided, must be a boolean or null");
  if (arguments.length > 4 && typeof arguments[4] != "boolean" && arguments[4] !== null)
    throw new ye("`nonWritable`, if provided, must be a boolean or null");
  if (arguments.length > 5 && typeof arguments[5] != "boolean" && arguments[5] !== null)
    throw new ye("`nonConfigurable`, if provided, must be a boolean or null");
  if (arguments.length > 6 && typeof arguments[6] != "boolean")
    throw new ye("`loose`, if provided, must be a boolean");
  var o = arguments.length > 3 ? arguments[3] : null, a = arguments.length > 4 ? arguments[4] : null, f = arguments.length > 5 ? arguments[5] : null, i = arguments.length > 6 ? arguments[6] : !1, l = !!Cr && Cr(e, t);
  if (Tr)
    Tr(e, t, {
      configurable: f === null && l ? l.configurable : !f,
      enumerable: o === null && l ? l.enumerable : !o,
      value: n,
      writable: a === null && l ? l.writable : !a
    });
  else if (i || !o && !a && !f)
    e[t] = n;
  else
    throw new bn("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
}, or = mr(), ot = function() {
  return !!or;
};
ot.hasArrayLengthDefineBug = function() {
  if (!or)
    return null;
  try {
    return or([], "length", { value: 1 }).length !== 1;
  } catch {
    return !0;
  }
};
var Sn = ot, An = Se, _r = wn, On = Sn(), Mr = at, Nr = $e, En = An("%Math.floor%"), xn = function(e, t) {
  if (typeof e != "function")
    throw new Nr("`fn` is not a function");
  if (typeof t != "number" || t < 0 || t > 4294967295 || En(t) !== t)
    throw new Nr("`length` must be a positive 32-bit integer");
  var n = arguments.length > 2 && !!arguments[2], o = !0, a = !0;
  if ("length" in e && Mr) {
    var f = Mr(e, "length");
    f && !f.configurable && (o = !1), f && !f.writable && (a = !1);
  }
  return (o || a || !n) && (On ? _r(
    /** @type {Parameters<define>[0]} */
    e,
    "length",
    t,
    !0,
    !0
  ) : _r(
    /** @type {Parameters<define>[0]} */
    e,
    "length",
    t
  )), e;
};
(function(r) {
  var e = dr, t = Se, n = xn, o = $e, a = t("%Function.prototype.apply%"), f = t("%Function.prototype.call%"), i = t("%Reflect.apply%", !0) || e.call(f, a), l = mr(), u = t("%Math.max%");
  r.exports = function(s) {
    if (typeof s != "function")
      throw new o("a function is required");
    var g = i(e, f, arguments);
    return n(
      g,
      1 + u(0, s.length - (arguments.length - 1)),
      !0
    );
  };
  var c = function() {
    return i(e, a, arguments);
  };
  l ? l(r.exports, "apply", { value: c }) : r.exports.apply = c;
})(nt);
var Pn = nt.exports, it = Se, ft = Pn, $n = ft(it("String.prototype.indexOf")), In = function(e, t) {
  var n = it(e, !!t);
  return typeof n == "function" && $n(e, ".prototype.") > -1 ? ft(n) : n;
};
const Fn = {}, Rn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Fn
}, Symbol.toStringTag, { value: "Module" })), Dn = /* @__PURE__ */ St(Rn);
var vr = typeof Map == "function" && Map.prototype, Je = Object.getOwnPropertyDescriptor && vr ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null, We = vr && Je && typeof Je.get == "function" ? Je.get : null, Br = vr && Map.prototype.forEach, gr = typeof Set == "function" && Set.prototype, Xe = Object.getOwnPropertyDescriptor && gr ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, ke = gr && Xe && typeof Xe.get == "function" ? Xe.get : null, Ur = gr && Set.prototype.forEach, Tn = typeof WeakMap == "function" && WeakMap.prototype, Ee = Tn ? WeakMap.prototype.has : null, Cn = typeof WeakSet == "function" && WeakSet.prototype, xe = Cn ? WeakSet.prototype.has : null, _n = typeof WeakRef == "function" && WeakRef.prototype, qr = _n ? WeakRef.prototype.deref : null, Mn = Boolean.prototype.valueOf, Nn = Object.prototype.toString, Bn = Function.prototype.toString, Un = String.prototype.match, br = String.prototype.slice, oe = String.prototype.replace, qn = String.prototype.toUpperCase, Lr = String.prototype.toLowerCase, lt = RegExp.prototype.test, Wr = Array.prototype.concat, ee = Array.prototype.join, Ln = Array.prototype.slice, kr = Math.floor, ir = typeof BigInt == "function" ? BigInt.prototype.valueOf : null, Ze = Object.getOwnPropertySymbols, fr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? Symbol.prototype.toString : null, ge = typeof Symbol == "function" && typeof Symbol.iterator == "object", q = typeof Symbol == "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === ge || !0) ? Symbol.toStringTag : null, st = Object.prototype.propertyIsEnumerable, Gr = (typeof Reflect == "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(r) {
  return r.__proto__;
} : null);
function jr(r, e) {
  if (r === 1 / 0 || r === -1 / 0 || r !== r || r && r > -1e3 && r < 1e3 || lt.call(/e/, e))
    return e;
  var t = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof r == "number") {
    var n = r < 0 ? -kr(-r) : kr(r);
    if (n !== r) {
      var o = String(n), a = br.call(e, o.length + 1);
      return oe.call(o, t, "$&_") + "." + oe.call(oe.call(a, /([0-9]{3})/g, "$&_"), /_$/, "");
    }
  }
  return oe.call(e, t, "$&_");
}
var lr = Dn, zr = lr.custom, Hr = ct(zr) ? zr : null, Wn = function r(e, t, n, o) {
  var a = t || {};
  if (ae(a, "quoteStyle") && a.quoteStyle !== "single" && a.quoteStyle !== "double")
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  if (ae(a, "maxStringLength") && (typeof a.maxStringLength == "number" ? a.maxStringLength < 0 && a.maxStringLength !== 1 / 0 : a.maxStringLength !== null))
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  var f = ae(a, "customInspect") ? a.customInspect : !0;
  if (typeof f != "boolean" && f !== "symbol")
    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
  if (ae(a, "indent") && a.indent !== null && a.indent !== "	" && !(parseInt(a.indent, 10) === a.indent && a.indent > 0))
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  if (ae(a, "numericSeparator") && typeof a.numericSeparator != "boolean")
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  var i = a.numericSeparator;
  if (typeof e > "u")
    return "undefined";
  if (e === null)
    return "null";
  if (typeof e == "boolean")
    return e ? "true" : "false";
  if (typeof e == "string")
    return yt(e, a);
  if (typeof e == "number") {
    if (e === 0)
      return 1 / 0 / e > 0 ? "0" : "-0";
    var l = String(e);
    return i ? jr(e, l) : l;
  }
  if (typeof e == "bigint") {
    var u = String(e) + "n";
    return i ? jr(e, u) : u;
  }
  var c = typeof a.depth > "u" ? 5 : a.depth;
  if (typeof n > "u" && (n = 0), n >= c && c > 0 && typeof e == "object")
    return sr(e) ? "[Array]" : "[Object]";
  var b = oa(a, n);
  if (typeof o > "u")
    o = [];
  else if (pt(o, e) >= 0)
    return "[Circular]";
  function s(_, L, W) {
    if (L && (o = Ln.call(o), o.push(L)), W) {
      var G = {
        depth: a.depth
      };
      return ae(a, "quoteStyle") && (G.quoteStyle = a.quoteStyle), r(_, G, n + 1, o);
    }
    return r(_, a, n + 1, o);
  }
  if (typeof e == "function" && !Kr(e)) {
    var g = Jn(e), p = De(e, s);
    return "[Function" + (g ? ": " + g : " (anonymous)") + "]" + (p.length > 0 ? " { " + ee.call(p, ", ") + " }" : "");
  }
  if (ct(e)) {
    var x = ge ? oe.call(String(e), /^(Symbol\(.*\))_[^)]*$/, "$1") : fr.call(e);
    return typeof e == "object" && !ge ? Oe(x) : x;
  }
  if (ta(e)) {
    for (var d = "<" + Lr.call(String(e.nodeName)), F = e.attributes || [], h = 0; h < F.length; h++)
      d += " " + F[h].name + "=" + ut(kn(F[h].value), "double", a);
    return d += ">", e.childNodes && e.childNodes.length && (d += "..."), d += "</" + Lr.call(String(e.nodeName)) + ">", d;
  }
  if (sr(e)) {
    if (e.length === 0)
      return "[]";
    var y = De(e, s);
    return b && !aa(y) ? "[" + ur(y, b) + "]" : "[ " + ee.call(y, ", ") + " ]";
  }
  if (jn(e)) {
    var $ = De(e, s);
    return !("cause" in Error.prototype) && "cause" in e && !st.call(e, "cause") ? "{ [" + String(e) + "] " + ee.call(Wr.call("[cause]: " + s(e.cause), $), ", ") + " }" : $.length === 0 ? "[" + String(e) + "]" : "{ [" + String(e) + "] " + ee.call($, ", ") + " }";
  }
  if (typeof e == "object" && f) {
    if (Hr && typeof e[Hr] == "function" && lr)
      return lr(e, { depth: c - n });
    if (f !== "symbol" && typeof e.inspect == "function")
      return e.inspect();
  }
  if (Xn(e)) {
    var m = [];
    return Br && Br.call(e, function(_, L) {
      m.push(s(L, e, !0) + " => " + s(_, e));
    }), Vr("Map", We.call(e), m, b);
  }
  if (ea(e)) {
    var w = [];
    return Ur && Ur.call(e, function(_) {
      w.push(s(_, e));
    }), Vr("Set", ke.call(e), w, b);
  }
  if (Zn(e))
    return Ye("WeakMap");
  if (ra(e))
    return Ye("WeakSet");
  if (Yn(e))
    return Ye("WeakRef");
  if (Hn(e))
    return Oe(s(Number(e)));
  if (Vn(e))
    return Oe(s(ir.call(e)));
  if (Kn(e))
    return Oe(Mn.call(e));
  if (zn(e))
    return Oe(s(String(e)));
  if (typeof window < "u" && e === window)
    return "{ [object Window] }";
  if (e === Me)
    return "{ [object globalThis] }";
  if (!Gn(e) && !Kr(e)) {
    var I = De(e, s), A = Gr ? Gr(e) === Object.prototype : e instanceof Object || e.constructor === Object, E = e instanceof Object ? "" : "null prototype", R = !A && q && Object(e) === e && q in e ? br.call(ie(e), 8, -1) : E ? "Object" : "", K = A || typeof e.constructor != "function" ? "" : e.constructor.name ? e.constructor.name + " " : "", V = K + (R || E ? "[" + ee.call(Wr.call([], R || [], E || []), ": ") + "] " : "");
    return I.length === 0 ? V + "{}" : b ? V + "{" + ur(I, b) + "}" : V + "{ " + ee.call(I, ", ") + " }";
  }
  return String(e);
};
function ut(r, e, t) {
  var n = (t.quoteStyle || e) === "double" ? '"' : "'";
  return n + r + n;
}
function kn(r) {
  return oe.call(String(r), /"/g, "&quot;");
}
function sr(r) {
  return ie(r) === "[object Array]" && (!q || !(typeof r == "object" && q in r));
}
function Gn(r) {
  return ie(r) === "[object Date]" && (!q || !(typeof r == "object" && q in r));
}
function Kr(r) {
  return ie(r) === "[object RegExp]" && (!q || !(typeof r == "object" && q in r));
}
function jn(r) {
  return ie(r) === "[object Error]" && (!q || !(typeof r == "object" && q in r));
}
function zn(r) {
  return ie(r) === "[object String]" && (!q || !(typeof r == "object" && q in r));
}
function Hn(r) {
  return ie(r) === "[object Number]" && (!q || !(typeof r == "object" && q in r));
}
function Kn(r) {
  return ie(r) === "[object Boolean]" && (!q || !(typeof r == "object" && q in r));
}
function ct(r) {
  if (ge)
    return r && typeof r == "object" && r instanceof Symbol;
  if (typeof r == "symbol")
    return !0;
  if (!r || typeof r != "object" || !fr)
    return !1;
  try {
    return fr.call(r), !0;
  } catch {
  }
  return !1;
}
function Vn(r) {
  if (!r || typeof r != "object" || !ir)
    return !1;
  try {
    return ir.call(r), !0;
  } catch {
  }
  return !1;
}
var Qn = Object.prototype.hasOwnProperty || function(r) {
  return r in this;
};
function ae(r, e) {
  return Qn.call(r, e);
}
function ie(r) {
  return Nn.call(r);
}
function Jn(r) {
  if (r.name)
    return r.name;
  var e = Un.call(Bn.call(r), /^function\s*([\w$]+)/);
  return e ? e[1] : null;
}
function pt(r, e) {
  if (r.indexOf)
    return r.indexOf(e);
  for (var t = 0, n = r.length; t < n; t++)
    if (r[t] === e)
      return t;
  return -1;
}
function Xn(r) {
  if (!We || !r || typeof r != "object")
    return !1;
  try {
    We.call(r);
    try {
      ke.call(r);
    } catch {
      return !0;
    }
    return r instanceof Map;
  } catch {
  }
  return !1;
}
function Zn(r) {
  if (!Ee || !r || typeof r != "object")
    return !1;
  try {
    Ee.call(r, Ee);
    try {
      xe.call(r, xe);
    } catch {
      return !0;
    }
    return r instanceof WeakMap;
  } catch {
  }
  return !1;
}
function Yn(r) {
  if (!qr || !r || typeof r != "object")
    return !1;
  try {
    return qr.call(r), !0;
  } catch {
  }
  return !1;
}
function ea(r) {
  if (!ke || !r || typeof r != "object")
    return !1;
  try {
    ke.call(r);
    try {
      We.call(r);
    } catch {
      return !0;
    }
    return r instanceof Set;
  } catch {
  }
  return !1;
}
function ra(r) {
  if (!xe || !r || typeof r != "object")
    return !1;
  try {
    xe.call(r, xe);
    try {
      Ee.call(r, Ee);
    } catch {
      return !0;
    }
    return r instanceof WeakSet;
  } catch {
  }
  return !1;
}
function ta(r) {
  return !r || typeof r != "object" ? !1 : typeof HTMLElement < "u" && r instanceof HTMLElement ? !0 : typeof r.nodeName == "string" && typeof r.getAttribute == "function";
}
function yt(r, e) {
  if (r.length > e.maxStringLength) {
    var t = r.length - e.maxStringLength, n = "... " + t + " more character" + (t > 1 ? "s" : "");
    return yt(br.call(r, 0, e.maxStringLength), e) + n;
  }
  var o = oe.call(oe.call(r, /(['\\])/g, "\\$1"), /[\x00-\x1f]/g, na);
  return ut(o, "single", e);
}
function na(r) {
  var e = r.charCodeAt(0), t = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[e];
  return t ? "\\" + t : "\\x" + (e < 16 ? "0" : "") + qn.call(e.toString(16));
}
function Oe(r) {
  return "Object(" + r + ")";
}
function Ye(r) {
  return r + " { ? }";
}
function Vr(r, e, t, n) {
  var o = n ? ur(t, n) : ee.call(t, ", ");
  return r + " (" + e + ") {" + o + "}";
}
function aa(r) {
  for (var e = 0; e < r.length; e++)
    if (pt(r[e], `
`) >= 0)
      return !1;
  return !0;
}
function oa(r, e) {
  var t;
  if (r.indent === "	")
    t = "	";
  else if (typeof r.indent == "number" && r.indent > 0)
    t = ee.call(Array(r.indent + 1), " ");
  else
    return null;
  return {
    base: t,
    prev: ee.call(Array(e + 1), t)
  };
}
function ur(r, e) {
  if (r.length === 0)
    return "";
  var t = `
` + e.prev + e.base;
  return t + ee.call(r, "," + t) + `
` + e.prev;
}
function De(r, e) {
  var t = sr(r), n = [];
  if (t) {
    n.length = r.length;
    for (var o = 0; o < r.length; o++)
      n[o] = ae(r, o) ? e(r[o], r) : "";
  }
  var a = typeof Ze == "function" ? Ze(r) : [], f;
  if (ge) {
    f = {};
    for (var i = 0; i < a.length; i++)
      f["$" + a[i]] = a[i];
  }
  for (var l in r)
    ae(r, l) && (t && String(Number(l)) === l && l < r.length || ge && f["$" + l] instanceof Symbol || (lt.call(/[^\w$]/, l) ? n.push(e(l, r) + ": " + e(r[l], r)) : n.push(l + ": " + e(r[l], r))));
  if (typeof Ze == "function")
    for (var u = 0; u < a.length; u++)
      st.call(r, a[u]) && n.push("[" + e(a[u]) + "]: " + e(r[a[u]], r));
  return n;
}
var ht = Se, Ae = In, ia = Wn, fa = $e, Te = ht("%WeakMap%", !0), Ce = ht("%Map%", !0), la = Ae("WeakMap.prototype.get", !0), sa = Ae("WeakMap.prototype.set", !0), ua = Ae("WeakMap.prototype.has", !0), ca = Ae("Map.prototype.get", !0), pa = Ae("Map.prototype.set", !0), ya = Ae("Map.prototype.has", !0), wr = function(r, e) {
  for (var t = r, n; (n = t.next) !== null; t = n)
    if (n.key === e)
      return t.next = n.next, n.next = /** @type {NonNullable<typeof list.next>} */
      r.next, r.next = n, n;
}, ha = function(r, e) {
  var t = wr(r, e);
  return t && t.value;
}, da = function(r, e, t) {
  var n = wr(r, e);
  n ? n.value = t : r.next = /** @type {import('.').ListNode<typeof value>} */
  {
    // eslint-disable-line no-param-reassign, no-extra-parens
    key: e,
    next: r.next,
    value: t
  };
}, ma = function(r, e) {
  return !!wr(r, e);
}, va = function() {
  var e, t, n, o = {
    assert: function(a) {
      if (!o.has(a))
        throw new fa("Side channel does not contain " + ia(a));
    },
    get: function(a) {
      if (Te && a && (typeof a == "object" || typeof a == "function")) {
        if (e)
          return la(e, a);
      } else if (Ce) {
        if (t)
          return ca(t, a);
      } else if (n)
        return ha(n, a);
    },
    has: function(a) {
      if (Te && a && (typeof a == "object" || typeof a == "function")) {
        if (e)
          return ua(e, a);
      } else if (Ce) {
        if (t)
          return ya(t, a);
      } else if (n)
        return ma(n, a);
      return !1;
    },
    set: function(a, f) {
      Te && a && (typeof a == "object" || typeof a == "function") ? (e || (e = new Te()), sa(e, a, f)) : Ce ? (t || (t = new Ce()), pa(t, a, f)) : (n || (n = { key: {}, next: null }), da(n, a, f));
    }
  };
  return o;
}, ga = String.prototype.replace, ba = /%20/g, er = {
  RFC1738: "RFC1738",
  RFC3986: "RFC3986"
}, Sr = {
  default: er.RFC3986,
  formatters: {
    RFC1738: function(r) {
      return ga.call(r, ba, "+");
    },
    RFC3986: function(r) {
      return String(r);
    }
  },
  RFC1738: er.RFC1738,
  RFC3986: er.RFC3986
}, wa = Sr, rr = Object.prototype.hasOwnProperty, le = Array.isArray, Z = function() {
  for (var r = [], e = 0; e < 256; ++e)
    r.push("%" + ((e < 16 ? "0" : "") + e.toString(16)).toUpperCase());
  return r;
}(), Sa = function(e) {
  for (; e.length > 1; ) {
    var t = e.pop(), n = t.obj[t.prop];
    if (le(n)) {
      for (var o = [], a = 0; a < n.length; ++a)
        typeof n[a] < "u" && o.push(n[a]);
      t.obj[t.prop] = o;
    }
  }
}, dt = function(e, t) {
  for (var n = t && t.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, o = 0; o < e.length; ++o)
    typeof e[o] < "u" && (n[o] = e[o]);
  return n;
}, Aa = function r(e, t, n) {
  if (!t)
    return e;
  if (typeof t != "object") {
    if (le(e))
      e.push(t);
    else if (e && typeof e == "object")
      (n && (n.plainObjects || n.allowPrototypes) || !rr.call(Object.prototype, t)) && (e[t] = !0);
    else
      return [e, t];
    return e;
  }
  if (!e || typeof e != "object")
    return [e].concat(t);
  var o = e;
  return le(e) && !le(t) && (o = dt(e, n)), le(e) && le(t) ? (t.forEach(function(a, f) {
    if (rr.call(e, f)) {
      var i = e[f];
      i && typeof i == "object" && a && typeof a == "object" ? e[f] = r(i, a, n) : e.push(a);
    } else
      e[f] = a;
  }), e) : Object.keys(t).reduce(function(a, f) {
    var i = t[f];
    return rr.call(a, f) ? a[f] = r(a[f], i, n) : a[f] = i, a;
  }, o);
}, Oa = function(e, t) {
  return Object.keys(t).reduce(function(n, o) {
    return n[o] = t[o], n;
  }, e);
}, Ea = function(r, e, t) {
  var n = r.replace(/\+/g, " ");
  if (t === "iso-8859-1")
    return n.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(n);
  } catch {
    return n;
  }
}, tr = 1024, xa = function(e, t, n, o, a) {
  if (e.length === 0)
    return e;
  var f = e;
  if (typeof e == "symbol" ? f = Symbol.prototype.toString.call(e) : typeof e != "string" && (f = String(e)), n === "iso-8859-1")
    return escape(f).replace(/%u[0-9a-f]{4}/gi, function(g) {
      return "%26%23" + parseInt(g.slice(2), 16) + "%3B";
    });
  for (var i = "", l = 0; l < f.length; l += tr) {
    for (var u = f.length >= tr ? f.slice(l, l + tr) : f, c = [], b = 0; b < u.length; ++b) {
      var s = u.charCodeAt(b);
      if (s === 45 || s === 46 || s === 95 || s === 126 || s >= 48 && s <= 57 || s >= 65 && s <= 90 || s >= 97 && s <= 122 || a === wa.RFC1738 && (s === 40 || s === 41)) {
        c[c.length] = u.charAt(b);
        continue;
      }
      if (s < 128) {
        c[c.length] = Z[s];
        continue;
      }
      if (s < 2048) {
        c[c.length] = Z[192 | s >> 6] + Z[128 | s & 63];
        continue;
      }
      if (s < 55296 || s >= 57344) {
        c[c.length] = Z[224 | s >> 12] + Z[128 | s >> 6 & 63] + Z[128 | s & 63];
        continue;
      }
      b += 1, s = 65536 + ((s & 1023) << 10 | u.charCodeAt(b) & 1023), c[c.length] = Z[240 | s >> 18] + Z[128 | s >> 12 & 63] + Z[128 | s >> 6 & 63] + Z[128 | s & 63];
    }
    i += c.join("");
  }
  return i;
}, Pa = function(e) {
  for (var t = [{ obj: { o: e }, prop: "o" }], n = [], o = 0; o < t.length; ++o)
    for (var a = t[o], f = a.obj[a.prop], i = Object.keys(f), l = 0; l < i.length; ++l) {
      var u = i[l], c = f[u];
      typeof c == "object" && c !== null && n.indexOf(c) === -1 && (t.push({ obj: f, prop: u }), n.push(c));
    }
  return Sa(t), e;
}, $a = function(e) {
  return Object.prototype.toString.call(e) === "[object RegExp]";
}, Ia = function(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}, Fa = function(e, t) {
  return [].concat(e, t);
}, Ra = function(e, t) {
  if (le(e)) {
    for (var n = [], o = 0; o < e.length; o += 1)
      n.push(t(e[o]));
    return n;
  }
  return t(e);
}, mt = {
  arrayToObject: dt,
  assign: Oa,
  combine: Fa,
  compact: Pa,
  decode: Ea,
  encode: xa,
  isBuffer: Ia,
  isRegExp: $a,
  maybeMap: Ra,
  merge: Aa
}, vt = va, Be = mt, Pe = Sr, Da = Object.prototype.hasOwnProperty, gt = {
  brackets: function(e) {
    return e + "[]";
  },
  comma: "comma",
  indices: function(e, t) {
    return e + "[" + t + "]";
  },
  repeat: function(e) {
    return e;
  }
}, Y = Array.isArray, Ta = Array.prototype.push, bt = function(r, e) {
  Ta.apply(r, Y(e) ? e : [e]);
}, Ca = Date.prototype.toISOString, Qr = Pe.default, M = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Be.encode,
  encodeValuesOnly: !1,
  format: Qr,
  formatter: Pe.formatters[Qr],
  // deprecated
  indices: !1,
  serializeDate: function(e) {
    return Ca.call(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
}, _a = function(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}, nr = {}, Ma = function r(e, t, n, o, a, f, i, l, u, c, b, s, g, p, x, d, F, h) {
  for (var y = e, $ = h, m = 0, w = !1; ($ = $.get(nr)) !== void 0 && !w; ) {
    var I = $.get(e);
    if (m += 1, typeof I < "u") {
      if (I === m)
        throw new RangeError("Cyclic object value");
      w = !0;
    }
    typeof $.get(nr) > "u" && (m = 0);
  }
  if (typeof c == "function" ? y = c(t, y) : y instanceof Date ? y = g(y) : n === "comma" && Y(y) && (y = Be.maybeMap(y, function(v) {
    return v instanceof Date ? g(v) : v;
  })), y === null) {
    if (f)
      return u && !d ? u(t, M.encoder, F, "key", p) : t;
    y = "";
  }
  if (_a(y) || Be.isBuffer(y)) {
    if (u) {
      var A = d ? t : u(t, M.encoder, F, "key", p);
      return [x(A) + "=" + x(u(y, M.encoder, F, "value", p))];
    }
    return [x(t) + "=" + x(String(y))];
  }
  var E = [];
  if (typeof y > "u")
    return E;
  var R;
  if (n === "comma" && Y(y))
    d && u && (y = Be.maybeMap(y, u)), R = [{ value: y.length > 0 ? y.join(",") || null : void 0 }];
  else if (Y(c))
    R = c;
  else {
    var K = Object.keys(y);
    R = b ? K.sort(b) : K;
  }
  var V = l ? t.replace(/\./g, "%2E") : t, _ = o && Y(y) && y.length === 1 ? V + "[]" : V;
  if (a && Y(y) && y.length === 0)
    return _ + "[]";
  for (var L = 0; L < R.length; ++L) {
    var W = R[L], G = typeof W == "object" && typeof W.value < "u" ? W.value : y[W];
    if (!(i && G === null)) {
      var te = s && l ? W.replace(/\./g, "%2E") : W, Ge = Y(y) ? typeof n == "function" ? n(_, te) : _ : _ + (s ? "." + te : "[" + te + "]");
      h.set(e, m);
      var Re = vt();
      Re.set(nr, h), bt(E, r(
        G,
        Ge,
        n,
        o,
        a,
        f,
        i,
        l,
        n === "comma" && d && Y(y) ? null : u,
        c,
        b,
        s,
        g,
        p,
        x,
        d,
        F,
        Re
      ));
    }
  }
  return E;
}, Na = function(e) {
  if (!e)
    return M;
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean")
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean")
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function")
    throw new TypeError("Encoder has to be a function.");
  var t = e.charset || M.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  var n = Pe.default;
  if (typeof e.format < "u") {
    if (!Da.call(Pe.formatters, e.format))
      throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  var o = Pe.formatters[n], a = M.filter;
  (typeof e.filter == "function" || Y(e.filter)) && (a = e.filter);
  var f;
  if (e.arrayFormat in gt ? f = e.arrayFormat : "indices" in e ? f = e.indices ? "indices" : "repeat" : f = M.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean")
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  var i = typeof e.allowDots > "u" ? e.encodeDotInKeys === !0 ? !0 : M.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : M.addQueryPrefix,
    allowDots: i,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : M.allowEmptyArrays,
    arrayFormat: f,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : M.charsetSentinel,
    commaRoundTrip: e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? M.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : M.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : M.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : M.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : M.encodeValuesOnly,
    filter: a,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : M.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : M.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : M.strictNullHandling
  };
}, Ba = function(r, e) {
  var t = r, n = Na(e), o, a;
  typeof n.filter == "function" ? (a = n.filter, t = a("", t)) : Y(n.filter) && (a = n.filter, o = a);
  var f = [];
  if (typeof t != "object" || t === null)
    return "";
  var i = gt[n.arrayFormat], l = i === "comma" && n.commaRoundTrip;
  o || (o = Object.keys(t)), n.sort && o.sort(n.sort);
  for (var u = vt(), c = 0; c < o.length; ++c) {
    var b = o[c];
    n.skipNulls && t[b] === null || bt(f, Ma(
      t[b],
      b,
      i,
      l,
      n.allowEmptyArrays,
      n.strictNullHandling,
      n.skipNulls,
      n.encodeDotInKeys,
      n.encode ? n.encoder : null,
      n.filter,
      n.sort,
      n.allowDots,
      n.serializeDate,
      n.format,
      n.formatter,
      n.encodeValuesOnly,
      n.charset,
      u
    ));
  }
  var s = f.join(n.delimiter), g = n.addQueryPrefix === !0 ? "?" : "";
  return n.charsetSentinel && (n.charset === "iso-8859-1" ? g += "utf8=%26%2310003%3B&" : g += "utf8=%E2%9C%93&"), s.length > 0 ? g + s : "";
}, be = mt, cr = Object.prototype.hasOwnProperty, Ua = Array.isArray, C = {
  allowDots: !1,
  allowEmptyArrays: !1,
  allowPrototypes: !1,
  allowSparse: !1,
  arrayLimit: 20,
  charset: "utf-8",
  charsetSentinel: !1,
  comma: !1,
  decodeDotInKeys: !1,
  decoder: be.decode,
  delimiter: "&",
  depth: 5,
  duplicates: "combine",
  ignoreQueryPrefix: !1,
  interpretNumericEntities: !1,
  parameterLimit: 1e3,
  parseArrays: !0,
  plainObjects: !1,
  strictNullHandling: !1
}, qa = function(r) {
  return r.replace(/&#(\d+);/g, function(e, t) {
    return String.fromCharCode(parseInt(t, 10));
  });
}, wt = function(r, e) {
  return r && typeof r == "string" && e.comma && r.indexOf(",") > -1 ? r.split(",") : r;
}, La = "utf8=%26%2310003%3B", Wa = "utf8=%E2%9C%93", ka = function(e, t) {
  var n = { __proto__: null }, o = t.ignoreQueryPrefix ? e.replace(/^\?/, "") : e, a = t.parameterLimit === 1 / 0 ? void 0 : t.parameterLimit, f = o.split(t.delimiter, a), i = -1, l, u = t.charset;
  if (t.charsetSentinel)
    for (l = 0; l < f.length; ++l)
      f[l].indexOf("utf8=") === 0 && (f[l] === Wa ? u = "utf-8" : f[l] === La && (u = "iso-8859-1"), i = l, l = f.length);
  for (l = 0; l < f.length; ++l)
    if (l !== i) {
      var c = f[l], b = c.indexOf("]="), s = b === -1 ? c.indexOf("=") : b + 1, g, p;
      s === -1 ? (g = t.decoder(c, C.decoder, u, "key"), p = t.strictNullHandling ? null : "") : (g = t.decoder(c.slice(0, s), C.decoder, u, "key"), p = be.maybeMap(
        wt(c.slice(s + 1), t),
        function(d) {
          return t.decoder(d, C.decoder, u, "value");
        }
      )), p && t.interpretNumericEntities && u === "iso-8859-1" && (p = qa(p)), c.indexOf("[]=") > -1 && (p = Ua(p) ? [p] : p);
      var x = cr.call(n, g);
      x && t.duplicates === "combine" ? n[g] = be.combine(n[g], p) : (!x || t.duplicates === "last") && (n[g] = p);
    }
  return n;
}, Ga = function(r, e, t, n) {
  for (var o = n ? e : wt(e, t), a = r.length - 1; a >= 0; --a) {
    var f, i = r[a];
    if (i === "[]" && t.parseArrays)
      f = t.allowEmptyArrays && o === "" ? [] : [].concat(o);
    else {
      f = t.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      var l = i.charAt(0) === "[" && i.charAt(i.length - 1) === "]" ? i.slice(1, -1) : i, u = t.decodeDotInKeys ? l.replace(/%2E/g, ".") : l, c = parseInt(u, 10);
      !t.parseArrays && u === "" ? f = { 0: o } : !isNaN(c) && i !== u && String(c) === u && c >= 0 && t.parseArrays && c <= t.arrayLimit ? (f = [], f[c] = o) : u !== "__proto__" && (f[u] = o);
    }
    o = f;
  }
  return o;
}, ja = function(e, t, n, o) {
  if (e) {
    var a = n.allowDots ? e.replace(/\.([^.[]+)/g, "[$1]") : e, f = /(\[[^[\]]*])/, i = /(\[[^[\]]*])/g, l = n.depth > 0 && f.exec(a), u = l ? a.slice(0, l.index) : a, c = [];
    if (u) {
      if (!n.plainObjects && cr.call(Object.prototype, u) && !n.allowPrototypes)
        return;
      c.push(u);
    }
    for (var b = 0; n.depth > 0 && (l = i.exec(a)) !== null && b < n.depth; ) {
      if (b += 1, !n.plainObjects && cr.call(Object.prototype, l[1].slice(1, -1)) && !n.allowPrototypes)
        return;
      c.push(l[1]);
    }
    return l && c.push("[" + a.slice(l.index) + "]"), Ga(c, t, n, o);
  }
}, za = function(e) {
  if (!e)
    return C;
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean")
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.decodeDotInKeys < "u" && typeof e.decodeDotInKeys != "boolean")
    throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.decoder !== null && typeof e.decoder < "u" && typeof e.decoder != "function")
    throw new TypeError("Decoder has to be a function.");
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  var t = typeof e.charset > "u" ? C.charset : e.charset, n = typeof e.duplicates > "u" ? C.duplicates : e.duplicates;
  if (n !== "combine" && n !== "first" && n !== "last")
    throw new TypeError("The duplicates option must be either combine, first, or last");
  var o = typeof e.allowDots > "u" ? e.decodeDotInKeys === !0 ? !0 : C.allowDots : !!e.allowDots;
  return {
    allowDots: o,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : C.allowEmptyArrays,
    allowPrototypes: typeof e.allowPrototypes == "boolean" ? e.allowPrototypes : C.allowPrototypes,
    allowSparse: typeof e.allowSparse == "boolean" ? e.allowSparse : C.allowSparse,
    arrayLimit: typeof e.arrayLimit == "number" ? e.arrayLimit : C.arrayLimit,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : C.charsetSentinel,
    comma: typeof e.comma == "boolean" ? e.comma : C.comma,
    decodeDotInKeys: typeof e.decodeDotInKeys == "boolean" ? e.decodeDotInKeys : C.decodeDotInKeys,
    decoder: typeof e.decoder == "function" ? e.decoder : C.decoder,
    delimiter: typeof e.delimiter == "string" || be.isRegExp(e.delimiter) ? e.delimiter : C.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof e.depth == "number" || e.depth === !1 ? +e.depth : C.depth,
    duplicates: n,
    ignoreQueryPrefix: e.ignoreQueryPrefix === !0,
    interpretNumericEntities: typeof e.interpretNumericEntities == "boolean" ? e.interpretNumericEntities : C.interpretNumericEntities,
    parameterLimit: typeof e.parameterLimit == "number" ? e.parameterLimit : C.parameterLimit,
    parseArrays: e.parseArrays !== !1,
    plainObjects: typeof e.plainObjects == "boolean" ? e.plainObjects : C.plainObjects,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : C.strictNullHandling
  };
}, Ha = function(r, e) {
  var t = za(e);
  if (r === "" || r === null || typeof r > "u")
    return t.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (var n = typeof r == "string" ? ka(r, t) : r, o = t.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, a = Object.keys(n), f = 0; f < a.length; ++f) {
    var i = a[f], l = ja(i, n[i], t, typeof r == "string");
    o = be.merge(o, l, t);
  }
  return t.allowSparse === !0 ? o : be.compact(o);
}, Ka = Ba, Va = Ha, Qa = Sr, Ja = {
  formats: Qa,
  parse: Va,
  stringify: Ka
}, Xa = Dt;
function H() {
  this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null;
}
var Za = /^([a-z0-9.+-]+:)/i, Ya = /:[0-9]*$/, eo = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/, ro = [
  "<",
  ">",
  '"',
  "`",
  " ",
  "\r",
  `
`,
  "	"
], to = [
  "{",
  "}",
  "|",
  "\\",
  "^",
  "`"
].concat(ro), pr = ["'"].concat(to), Jr = [
  "%",
  "/",
  "?",
  ";",
  "#"
].concat(pr), Xr = [
  "/",
  "?",
  "#"
], no = 255, Zr = /^[+a-z0-9A-Z_-]{0,63}$/, ao = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, oo = {
  javascript: !0,
  "javascript:": !0
}, yr = {
  javascript: !0,
  "javascript:": !0
}, me = {
  http: !0,
  https: !0,
  ftp: !0,
  gopher: !0,
  file: !0,
  "http:": !0,
  "https:": !0,
  "ftp:": !0,
  "gopher:": !0,
  "file:": !0
}, hr = Ja;
function Fe(r, e, t) {
  if (r && typeof r == "object" && r instanceof H)
    return r;
  var n = new H();
  return n.parse(r, e, t), n;
}
H.prototype.parse = function(r, e, t) {
  if (typeof r != "string")
    throw new TypeError("Parameter 'url' must be a string, not " + typeof r);
  var n = r.indexOf("?"), o = n !== -1 && n < r.indexOf("#") ? "?" : "#", a = r.split(o), f = /\\/g;
  a[0] = a[0].replace(f, "/"), r = a.join(o);
  var i = r;
  if (i = i.trim(), !t && r.split("#").length === 1) {
    var l = eo.exec(i);
    if (l)
      return this.path = i, this.href = i, this.pathname = l[1], l[2] ? (this.search = l[2], e ? this.query = hr.parse(this.search.substr(1)) : this.query = this.search.substr(1)) : e && (this.search = "", this.query = {}), this;
  }
  var u = Za.exec(i);
  if (u) {
    u = u[0];
    var c = u.toLowerCase();
    this.protocol = c, i = i.substr(u.length);
  }
  if (t || u || i.match(/^\/\/[^@/]+@[^@/]+/)) {
    var b = i.substr(0, 2) === "//";
    b && !(u && yr[u]) && (i = i.substr(2), this.slashes = !0);
  }
  if (!yr[u] && (b || u && !me[u])) {
    for (var s = -1, g = 0; g < Xr.length; g++) {
      var p = i.indexOf(Xr[g]);
      p !== -1 && (s === -1 || p < s) && (s = p);
    }
    var x, d;
    s === -1 ? d = i.lastIndexOf("@") : d = i.lastIndexOf("@", s), d !== -1 && (x = i.slice(0, d), i = i.slice(d + 1), this.auth = decodeURIComponent(x)), s = -1;
    for (var g = 0; g < Jr.length; g++) {
      var p = i.indexOf(Jr[g]);
      p !== -1 && (s === -1 || p < s) && (s = p);
    }
    s === -1 && (s = i.length), this.host = i.slice(0, s), i = i.slice(s), this.parseHost(), this.hostname = this.hostname || "";
    var F = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!F)
      for (var h = this.hostname.split(/\./), g = 0, y = h.length; g < y; g++) {
        var $ = h[g];
        if ($ && !$.match(Zr)) {
          for (var m = "", w = 0, I = $.length; w < I; w++)
            $.charCodeAt(w) > 127 ? m += "x" : m += $[w];
          if (!m.match(Zr)) {
            var A = h.slice(0, g), E = h.slice(g + 1), R = $.match(ao);
            R && (A.push(R[1]), E.unshift(R[2])), E.length && (i = "/" + E.join(".") + i), this.hostname = A.join(".");
            break;
          }
        }
      }
    this.hostname.length > no ? this.hostname = "" : this.hostname = this.hostname.toLowerCase(), F || (this.hostname = Xa.toASCII(this.hostname));
    var K = this.port ? ":" + this.port : "", V = this.hostname || "";
    this.host = V + K, this.href += this.host, F && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), i[0] !== "/" && (i = "/" + i));
  }
  if (!oo[c])
    for (var g = 0, y = pr.length; g < y; g++) {
      var _ = pr[g];
      if (i.indexOf(_) !== -1) {
        var L = encodeURIComponent(_);
        L === _ && (L = escape(_)), i = i.split(_).join(L);
      }
    }
  var W = i.indexOf("#");
  W !== -1 && (this.hash = i.substr(W), i = i.slice(0, W));
  var G = i.indexOf("?");
  if (G !== -1 ? (this.search = i.substr(G), this.query = i.substr(G + 1), e && (this.query = hr.parse(this.query)), i = i.slice(0, G)) : e && (this.search = "", this.query = {}), i && (this.pathname = i), me[c] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
    var K = this.pathname || "", te = this.search || "";
    this.path = K + te;
  }
  return this.href = this.format(), this;
};
function io(r) {
  return typeof r == "string" && (r = Fe(r)), r instanceof H ? r.format() : H.prototype.format.call(r);
}
H.prototype.format = function() {
  var r = this.auth || "";
  r && (r = encodeURIComponent(r), r = r.replace(/%3A/i, ":"), r += "@");
  var e = this.protocol || "", t = this.pathname || "", n = this.hash || "", o = !1, a = "";
  this.host ? o = r + this.host : this.hostname && (o = r + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]"), this.port && (o += ":" + this.port)), this.query && typeof this.query == "object" && Object.keys(this.query).length && (a = hr.stringify(this.query, {
    arrayFormat: "repeat",
    addQueryPrefix: !1
  }));
  var f = this.search || a && "?" + a || "";
  return e && e.substr(-1) !== ":" && (e += ":"), this.slashes || (!e || me[e]) && o !== !1 ? (o = "//" + (o || ""), t && t.charAt(0) !== "/" && (t = "/" + t)) : o || (o = ""), n && n.charAt(0) !== "#" && (n = "#" + n), f && f.charAt(0) !== "?" && (f = "?" + f), t = t.replace(/[?#]/g, function(i) {
    return encodeURIComponent(i);
  }), f = f.replace("#", "%23"), e + o + t + f + n;
};
function fo(r, e) {
  return Fe(r, !1, !0).resolve(e);
}
H.prototype.resolve = function(r) {
  return this.resolveObject(Fe(r, !1, !0)).format();
};
function lo(r, e) {
  return r ? Fe(r, !1, !0).resolveObject(e) : e;
}
H.prototype.resolveObject = function(r) {
  if (typeof r == "string") {
    var e = new H();
    e.parse(r, !1, !0), r = e;
  }
  for (var t = new H(), n = Object.keys(this), o = 0; o < n.length; o++) {
    var a = n[o];
    t[a] = this[a];
  }
  if (t.hash = r.hash, r.href === "")
    return t.href = t.format(), t;
  if (r.slashes && !r.protocol) {
    for (var f = Object.keys(r), i = 0; i < f.length; i++) {
      var l = f[i];
      l !== "protocol" && (t[l] = r[l]);
    }
    return me[t.protocol] && t.hostname && !t.pathname && (t.pathname = "/", t.path = t.pathname), t.href = t.format(), t;
  }
  if (r.protocol && r.protocol !== t.protocol) {
    if (!me[r.protocol]) {
      for (var u = Object.keys(r), c = 0; c < u.length; c++) {
        var b = u[c];
        t[b] = r[b];
      }
      return t.href = t.format(), t;
    }
    if (t.protocol = r.protocol, !r.host && !yr[r.protocol]) {
      for (var y = (r.pathname || "").split("/"); y.length && !(r.host = y.shift()); )
        ;
      r.host || (r.host = ""), r.hostname || (r.hostname = ""), y[0] !== "" && y.unshift(""), y.length < 2 && y.unshift(""), t.pathname = y.join("/");
    } else
      t.pathname = r.pathname;
    if (t.search = r.search, t.query = r.query, t.host = r.host || "", t.auth = r.auth, t.hostname = r.hostname || r.host, t.port = r.port, t.pathname || t.search) {
      var s = t.pathname || "", g = t.search || "";
      t.path = s + g;
    }
    return t.slashes = t.slashes || r.slashes, t.href = t.format(), t;
  }
  var p = t.pathname && t.pathname.charAt(0) === "/", x = r.host || r.pathname && r.pathname.charAt(0) === "/", d = x || p || t.host && r.pathname, F = d, h = t.pathname && t.pathname.split("/") || [], y = r.pathname && r.pathname.split("/") || [], $ = t.protocol && !me[t.protocol];
  if ($ && (t.hostname = "", t.port = null, t.host && (h[0] === "" ? h[0] = t.host : h.unshift(t.host)), t.host = "", r.protocol && (r.hostname = null, r.port = null, r.host && (y[0] === "" ? y[0] = r.host : y.unshift(r.host)), r.host = null), d = d && (y[0] === "" || h[0] === "")), x)
    t.host = r.host || r.host === "" ? r.host : t.host, t.hostname = r.hostname || r.hostname === "" ? r.hostname : t.hostname, t.search = r.search, t.query = r.query, h = y;
  else if (y.length)
    h || (h = []), h.pop(), h = h.concat(y), t.search = r.search, t.query = r.query;
  else if (r.search != null) {
    if ($) {
      t.host = h.shift(), t.hostname = t.host;
      var m = t.host && t.host.indexOf("@") > 0 ? t.host.split("@") : !1;
      m && (t.auth = m.shift(), t.hostname = m.shift(), t.host = t.hostname);
    }
    return t.search = r.search, t.query = r.query, (t.pathname !== null || t.search !== null) && (t.path = (t.pathname ? t.pathname : "") + (t.search ? t.search : "")), t.href = t.format(), t;
  }
  if (!h.length)
    return t.pathname = null, t.search ? t.path = "/" + t.search : t.path = null, t.href = t.format(), t;
  for (var w = h.slice(-1)[0], I = (t.host || r.host || h.length > 1) && (w === "." || w === "..") || w === "", A = 0, E = h.length; E >= 0; E--)
    w = h[E], w === "." ? h.splice(E, 1) : w === ".." ? (h.splice(E, 1), A++) : A && (h.splice(E, 1), A--);
  if (!d && !F)
    for (; A--; A)
      h.unshift("..");
  d && h[0] !== "" && (!h[0] || h[0].charAt(0) !== "/") && h.unshift(""), I && h.join("/").substr(-1) !== "/" && h.push("");
  var R = h[0] === "" || h[0] && h[0].charAt(0) === "/";
  if ($) {
    t.hostname = R ? "" : h.length ? h.shift() : "", t.host = t.hostname;
    var m = t.host && t.host.indexOf("@") > 0 ? t.host.split("@") : !1;
    m && (t.auth = m.shift(), t.hostname = m.shift(), t.host = t.hostname);
  }
  return d = d || t.host && h.length, d && !R && h.unshift(""), h.length > 0 ? t.pathname = h.join("/") : (t.pathname = null, t.path = null), (t.pathname !== null || t.search !== null) && (t.path = (t.pathname ? t.pathname : "") + (t.search ? t.search : "")), t.auth = r.auth || t.auth, t.slashes = t.slashes || r.slashes, t.href = t.format(), t;
};
H.prototype.parseHost = function() {
  var r = this.host, e = Ya.exec(r);
  e && (e = e[0], e !== ":" && (this.port = e.substr(1)), r = r.substr(0, r.length - e.length)), r && (this.hostname = r);
};
we.parse = Fe;
we.resolve = fo;
we.resolveObject = lo;
we.format = io;
we.Url = H;
const yo = "curl", ho = "cURL", mo = "cURL command line tool", so = [
  "url",
  "u",
  "user",
  "header",
  "H",
  "cookie",
  "b",
  "get",
  "G",
  "d",
  "data",
  "data-raw",
  "data-urlencode",
  "data-binary",
  "data-ascii",
  "form",
  "F",
  "request",
  "X"
];
function vo(r) {
  const e = et(r), t = {}, n = [];
  for (let m = 1; m < e.length; m++) {
    let w = e[m];
    if (typeof w == "string" && (w = w.trim()), typeof w == "string" && w.match(/^-{1,2}[\w-]+/)) {
      const I = w[0] === "-" && w[1] !== "-";
      let A = w.replace(/^-{1,2}/, "");
      if (!so.includes(A))
        continue;
      let E;
      const R = e[m + 1];
      I && A.length > 1 ? (E = A.slice(1), A = A.slice(0, 1)) : typeof R == "string" && !R.startsWith("-") ? (E = R, m++) : E = !0, t[A] = t[A] || [], t[A].push(E);
    } else
      w && n.push(w);
  }
  let o = [], a = "";
  try {
    const m = _e(t, n[0] || "", ["url"]), { searchParams: w, href: I, search: A } = new we.URL(m);
    o = Array.from(w.entries()).map(([E, R]) => ({
      name: E,
      value: R,
      disabled: !1
    })), a = I.replace(A, "").replace(/\/$/, "");
  } catch {
  }
  const [f, i] = _e(t, "", ["u", "user"]).split(/:(.*)$/), l = f ? {
    username: f.trim(),
    password: (i ?? "").trim()
  } : {}, u = [
    ...t.header || [],
    ...t.H || []
  ].map((m) => {
    const [w, I] = m.split(/:(.*)$/);
    return I ? {
      name: (w ?? "").trim(),
      value: I.trim()
    } : {
      name: (w ?? "").trim().replace(/;$/, ""),
      value: ""
    };
  }), c = [
    ...t.cookie || [],
    ...t.b || []
  ].map((m) => {
    const w = m.split("=", 1)[0], I = m.replace(`${w}=`, "");
    return `${w}=${I}`;
  }).join("; "), b = u.find((m) => m.name.toLowerCase() === "cookie");
  c && b ? b.value += `; ${c}` : c && u.push({
    name: "Cookie",
    value: c
  });
  const s = co(t), g = u.find((m) => m.name.toLowerCase() === "content-type"), p = g ? g.value.split(";")[0] : null, x = [
    ...t.form || [],
    ...t.F || []
  ].map((m) => {
    const w = m.split("="), I = w[0] ?? "", A = w[1] ?? "", E = {
      name: I,
      enabled: !0
    };
    return A.indexOf("@") === 0 ? E.file = A.slice(1) : E.value = A, E;
  });
  let d = {}, F = null;
  const h = _e(t, !1, ["G", "get"]);
  s.length !== 0 && h ? o.push(...s) : s && p === "application/x-www-form-urlencoded" ? (F = p, d = {
    params: s.map((m) => ({
      ...m,
      name: decodeURIComponent(m.name || ""),
      value: decodeURIComponent(m.value || "")
    }))
  }) : s.length !== 0 ? (F = p ?? "text/plain", d = {
    text: s.map((m) => `${m.name}${m.value}`).join("&")
  }) : x.length && (F = p ?? "multipart/form-data", d = {
    form: x
  });
  let y = _e(t, "__UNSET__", ["X", "request"]).toUpperCase();
  return y === "__UNSET__" && d && (y = "text" in d || "params" in d ? "POST" : "GET"), {
    id: po("rq"),
    model: "http_request",
    name: "",
    urlParameters: o,
    url: a,
    method: y,
    headers: u,
    authentication: l,
    body: d,
    bodyType: F,
    workspaceId: "WORKSPACE_ID",
    authenticationType: null,
    folderId: null,
    sortPriority: 0
  };
}
const uo = [
  /**
   * https://curl.se/docs/manpage.html#-d
   */
  "d",
  "data",
  /**
   * https://curl.se/docs/manpage.html#--data-raw
   */
  "data-raw",
  /**
   * https://curl.se/docs/manpage.html#--data-urlencode
   */
  "data-urlencode",
  /**
   * https://curl.se/docs/manpage.html#--data-binary
   */
  "data-binary",
  /**
   * https://curl.se/docs/manpage.html#--data-ascii
   */
  "data-ascii"
], co = (r) => {
  let e = [];
  for (const t of uo) {
    const n = r[t];
    if (!(!n || n.length === 0))
      switch (t) {
        case "d":
        case "data":
        case "data-ascii":
        case "data-binary":
          e = e.concat(
            n.flatMap((o) => ar(o, !0))
          );
          break;
        case "data-raw":
          e = e.concat(n.flatMap((o) => ar(o)));
          break;
        case "data-urlencode":
          e = e.concat(
            n.flatMap((o) => ar(o, !0)).map((o) => o.type === "file" ? o : {
              ...o,
              value: encodeURIComponent(o.value ?? "")
            })
          );
          break;
        default:
          throw new Error(`unhandled data flag ${t}`);
      }
  }
  return e;
}, ar = (r, e = !1) => typeof r == "boolean" ? [{ name: "", value: r.toString() }] : r.split("&").map((t) => {
  if (t.includes("@") && e) {
    const [a, f] = t.split("@");
    return { name: a, file: f, type: "file" };
  }
  const [n, o] = t.split("=");
  return !o && !t.includes("=") ? { name: "", value: t } : { name: n, value: o };
}), _e = (r, e, t) => {
  for (const n of t)
    if (r[n] && r[n].length)
      return r[n][0];
  return e;
}, go = (r) => {
  if (!r.match(/^\s*curl /))
    return null;
  const e = et(r.replace(/\n/g, " ")), t = [];
  let n = [];
  for (const a of e) {
    if (typeof a == "string") {
      a.startsWith("$") ? n.push(a.slice(1, 1 / 0)) : n.push(a);
      continue;
    }
    if (a.comment)
      continue;
    const { op: f } = a;
    if (f === ";") {
      t.push(n), n = [];
      continue;
    }
    if (f != null && f.startsWith("$")) {
      const i = f.slice(2, f.length - 1).replace(/\\'/g, "'");
      n.push(i);
      continue;
    }
    f === "glob" && n.push(a.pattern);
  }
  return t.push(n), t.filter((a) => a[0] === "curl").map(importCommand);
};
function po(r) {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let t = `${r}_`;
  for (let n = 0; n < 10; n++)
    t += e[Math.floor(Math.random() * e.length)];
  return t;
}
export {
  go as convert,
  mo as description,
  po as generateId,
  yo as id,
  ho as name,
  vo as pluginHookImport
};
