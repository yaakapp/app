var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getDefaultExportFromNamespaceIfPresent(n) {
  return n && Object.prototype.hasOwnProperty.call(n, "default") ? n["default"] : n;
}
function getDefaultExportFromNamespaceIfNotNamed(n) {
  return n && Object.prototype.hasOwnProperty.call(n, "default") && Object.keys(n).length === 1 ? n["default"] : n;
}
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var xpath$1 = {};
(function(exports) {
  var xpath2 = false ? {} : exports;
  (function(exports2) {
    "use strict";
    var NAMESPACE_NODE_NODETYPE = "__namespace";
    var isNil = function(x) {
      return x === null || x === void 0;
    };
    var isValidNodeType = function(nodeType) {
      return nodeType === NAMESPACE_NODE_NODETYPE || Number.isInteger(nodeType) && nodeType >= 1 && nodeType <= 11;
    };
    var isNodeLike = function(value) {
      return value && isValidNodeType(value.nodeType) && typeof value.nodeName === "string";
    };
    function curry(func) {
      var slice = Array.prototype.slice, totalargs = func.length, partial = function(args, fn3) {
        return function() {
          return fn3.apply(this, args.concat(slice.call(arguments)));
        };
      }, fn2 = function() {
        var args = slice.call(arguments);
        return args.length < totalargs ? partial(args, fn2) : func.apply(this, slice.apply(arguments, [0, totalargs]));
      };
      return fn2;
    }
    var forEach = function(f, xs) {
      for (var i = 0; i < xs.length; i += 1) {
        f(xs[i], i, xs);
      }
    };
    var reduce = function(f, seed, xs) {
      var acc = seed;
      forEach(function(x, i) {
        acc = f(acc, x, i);
      }, xs);
      return acc;
    };
    var map = function(f, xs) {
      var mapped = new Array(xs.length);
      forEach(function(x, i) {
        mapped[i] = f(x);
      }, xs);
      return mapped;
    };
    var filter = function(f, xs) {
      var filtered = [];
      forEach(function(x, i) {
        if (f(x, i)) {
          filtered.push(x);
        }
      }, xs);
      return filtered;
    };
    var includes = function(values, value) {
      for (var i = 0; i < values.length; i += 1) {
        if (values[i] === value) {
          return true;
        }
      }
      return false;
    };
    function always(value) {
      return function() {
        return value;
      };
    }
    function toString(x) {
      return x.toString();
    }
    var join = function(s, xs) {
      return xs.join(s);
    };
    var wrap = function(pref, suf, str) {
      return pref + str + suf;
    };
    var prototypeConcat = Array.prototype.concat;
    var sortNodes = function(nodes, reverse) {
      var ns = new XNodeSet();
      ns.addArray(nodes);
      var sorted = ns.toArray();
      return reverse ? sorted.reverse() : sorted;
    };
    var MAX_ARGUMENT_LENGTH = 32767;
    function flatten(arr) {
      var result = [];
      for (var start = 0; start < arr.length; start += MAX_ARGUMENT_LENGTH) {
        var chunk = arr.slice(start, start + MAX_ARGUMENT_LENGTH);
        result = prototypeConcat.apply(result, chunk);
      }
      return result;
    }
    function assign2(target, varArgs) {
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    }
    var NodeTypes = {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NAMESPACE_NODE: NAMESPACE_NODE_NODETYPE
    };
    XPathParser.prototype = new Object();
    XPathParser.prototype.constructor = XPathParser;
    XPathParser.superclass = Object.prototype;
    function XPathParser() {
      this.init();
    }
    XPathParser.prototype.init = function() {
      this.reduceActions = [];
      this.reduceActions[3] = function(rhs) {
        return new OrOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[5] = function(rhs) {
        return new AndOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[7] = function(rhs) {
        return new EqualsOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[8] = function(rhs) {
        return new NotEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[10] = function(rhs) {
        return new LessThanOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[11] = function(rhs) {
        return new GreaterThanOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[12] = function(rhs) {
        return new LessThanOrEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[13] = function(rhs) {
        return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[15] = function(rhs) {
        return new PlusOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[16] = function(rhs) {
        return new MinusOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[18] = function(rhs) {
        return new MultiplyOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[19] = function(rhs) {
        return new DivOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[20] = function(rhs) {
        return new ModOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[22] = function(rhs) {
        return new UnaryMinusOperation(rhs[1]);
      };
      this.reduceActions[24] = function(rhs) {
        return new BarOperation(rhs[0], rhs[2]);
      };
      this.reduceActions[25] = function(rhs) {
        return new PathExpr(void 0, void 0, rhs[0]);
      };
      this.reduceActions[27] = function(rhs) {
        rhs[0].locationPath = rhs[2];
        return rhs[0];
      };
      this.reduceActions[28] = function(rhs) {
        rhs[0].locationPath = rhs[2];
        rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        return rhs[0];
      };
      this.reduceActions[29] = function(rhs) {
        return new PathExpr(rhs[0], [], void 0);
      };
      this.reduceActions[30] = function(rhs) {
        if (Utilities.instance_of(rhs[0], PathExpr)) {
          if (rhs[0].filterPredicates == void 0) {
            rhs[0].filterPredicates = [];
          }
          rhs[0].filterPredicates.push(rhs[1]);
          return rhs[0];
        } else {
          return new PathExpr(rhs[0], [rhs[1]], void 0);
        }
      };
      this.reduceActions[32] = function(rhs) {
        return rhs[1];
      };
      this.reduceActions[33] = function(rhs) {
        return new XString(rhs[0]);
      };
      this.reduceActions[34] = function(rhs) {
        return new XNumber(rhs[0]);
      };
      this.reduceActions[36] = function(rhs) {
        return new FunctionCall(rhs[0], []);
      };
      this.reduceActions[37] = function(rhs) {
        return new FunctionCall(rhs[0], rhs[2]);
      };
      this.reduceActions[38] = function(rhs) {
        return [rhs[0]];
      };
      this.reduceActions[39] = function(rhs) {
        rhs[2].unshift(rhs[0]);
        return rhs[2];
      };
      this.reduceActions[43] = function(rhs) {
        return new LocationPath(true, []);
      };
      this.reduceActions[44] = function(rhs) {
        rhs[1].absolute = true;
        return rhs[1];
      };
      this.reduceActions[46] = function(rhs) {
        return new LocationPath(false, [rhs[0]]);
      };
      this.reduceActions[47] = function(rhs) {
        rhs[0].steps.push(rhs[2]);
        return rhs[0];
      };
      this.reduceActions[49] = function(rhs) {
        return new Step(rhs[0], rhs[1], []);
      };
      this.reduceActions[50] = function(rhs) {
        return new Step(Step.CHILD, rhs[0], []);
      };
      this.reduceActions[51] = function(rhs) {
        return new Step(rhs[0], rhs[1], rhs[2]);
      };
      this.reduceActions[52] = function(rhs) {
        return new Step(Step.CHILD, rhs[0], rhs[1]);
      };
      this.reduceActions[54] = function(rhs) {
        return [rhs[0]];
      };
      this.reduceActions[55] = function(rhs) {
        rhs[1].unshift(rhs[0]);
        return rhs[1];
      };
      this.reduceActions[56] = function(rhs) {
        if (rhs[0] == "ancestor") {
          return Step.ANCESTOR;
        } else if (rhs[0] == "ancestor-or-self") {
          return Step.ANCESTORORSELF;
        } else if (rhs[0] == "attribute") {
          return Step.ATTRIBUTE;
        } else if (rhs[0] == "child") {
          return Step.CHILD;
        } else if (rhs[0] == "descendant") {
          return Step.DESCENDANT;
        } else if (rhs[0] == "descendant-or-self") {
          return Step.DESCENDANTORSELF;
        } else if (rhs[0] == "following") {
          return Step.FOLLOWING;
        } else if (rhs[0] == "following-sibling") {
          return Step.FOLLOWINGSIBLING;
        } else if (rhs[0] == "namespace") {
          return Step.NAMESPACE;
        } else if (rhs[0] == "parent") {
          return Step.PARENT;
        } else if (rhs[0] == "preceding") {
          return Step.PRECEDING;
        } else if (rhs[0] == "preceding-sibling") {
          return Step.PRECEDINGSIBLING;
        } else if (rhs[0] == "self") {
          return Step.SELF;
        }
        return -1;
      };
      this.reduceActions[57] = function(rhs) {
        return Step.ATTRIBUTE;
      };
      this.reduceActions[59] = function(rhs) {
        if (rhs[0] == "comment") {
          return NodeTest.commentTest;
        } else if (rhs[0] == "text") {
          return NodeTest.textTest;
        } else if (rhs[0] == "processing-instruction") {
          return NodeTest.anyPiTest;
        } else if (rhs[0] == "node") {
          return NodeTest.nodeTest;
        }
        return new NodeTest(-1, void 0);
      };
      this.reduceActions[60] = function(rhs) {
        return new NodeTest.PITest(rhs[2]);
      };
      this.reduceActions[61] = function(rhs) {
        return rhs[1];
      };
      this.reduceActions[63] = function(rhs) {
        rhs[1].absolute = true;
        rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        return rhs[1];
      };
      this.reduceActions[64] = function(rhs) {
        rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
        rhs[0].steps.push(rhs[2]);
        return rhs[0];
      };
      this.reduceActions[65] = function(rhs) {
        return new Step(Step.SELF, NodeTest.nodeTest, []);
      };
      this.reduceActions[66] = function(rhs) {
        return new Step(Step.PARENT, NodeTest.nodeTest, []);
      };
      this.reduceActions[67] = function(rhs) {
        return new VariableReference(rhs[1]);
      };
      this.reduceActions[68] = function(rhs) {
        return NodeTest.nameTestAny;
      };
      this.reduceActions[69] = function(rhs) {
        return new NodeTest.NameTestPrefixAny(rhs[0].split(":")[0]);
      };
      this.reduceActions[70] = function(rhs) {
        return new NodeTest.NameTestQName(rhs[0]);
      };
    };
    XPathParser.actionTable = [
      " s s        sssssssss    s ss  s  ss",
      "                 s                  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "                rrrrr               ",
      " s s        sssssssss    s ss  s  ss",
      "rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
      " s s        sssssssss    s ss  s  ss",
      "                            s       ",
      "                            s       ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "  s                                 ",
      "                            s       ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "a                                   ",
      "r       s                    rr  r  ",
      "r      sr                    rr  r  ",
      "r   s  rr            s       rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrrs  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r  srrrrrrrr         rrrrrrs rr sr  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "                sssss               ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             s      ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "              s                     ",
      "                             s      ",
      "                rrrrr               ",
      " s s        sssssssss    s sss s  ss",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s s        sssssssss      ss  s  ss",
      " s s        sssssssss    s ss  s  ss",
      " s           s  sssss          s  s ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      " s           s  sssss          s  s ",
      " s           s  sssss          s  s ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr sr  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             s      ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             rr     ",
      "                             s      ",
      "                             rs     ",
      "r      sr                    rr  r  ",
      "r   s  rr            s       rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rssrr            rss     rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrr            rrrss   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrsss         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrr   rr  r  ",
      "r   rrrrrrrr         rrrrrr  rr  r  ",
      "                                 r  ",
      "                                 s  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  srrrrrrrr         rrrrrrs rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr  r  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      " s s        sssssssss    s ss  s  ss",
      "r  rrrrrrrrr         rrrrrrr rr rr  ",
      "                             r      "
    ];
    XPathParser.actionTableNumber = [
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "                 J                  ",
      "a  aaaaaaaaa         aaaaaaa aa  a  ",
      "                YYYYY               ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      `K1  KKKKKKKK .  +*)('KKKKKK  KK# K" `,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "                            N       ",
      "                            O       ",
      "e  eeeeeeeee         eeeeeee ee ee  ",
      "f  fffffffff         fffffff ff ff  ",
      "d  ddddddddd         ddddddd dd dd  ",
      "B  BBBBBBBBB         BBBBBBB BB BB  ",
      "A  AAAAAAAAA         AAAAAAA AA AA  ",
      "  P                                 ",
      "                            Q       ",
      ` 1           .  +*)('          #  " `,
      "b  bbbbbbbbb         bbbbbbb bb  b  ",
      "                                    ",
      "!       S                    !!  !  ",
      '"      T"                    ""  "  ',
      "$   V  $$            U       $$  $  ",
      "&   &ZY&&            &XW     &&  &  ",
      ")   )))))            )))\\[   ))  )  ",
      ".   ....._^]         .....   ..  .  ",
      "1   11111111         11111   11  1  ",
      "5   55555555         55555`  55  5  ",
      "7   77777777         777777  77  7  ",
      "9   99999999         999999  99  9  ",
      ":  c::::::::         ::::::b :: a:  ",
      "I  fIIIIIIII         IIIIIIe II  I  ",
      "=  =========         ======= == ==  ",
      "?  ?????????         ??????? ?? ??  ",
      "C  CCCCCCCCC         CCCCCCC CC CC  ",
      "J   JJJJJJJJ         JJJJJJ  JJ  J  ",
      "M   MMMMMMMM         MMMMMM  MM  M  ",
      "N  NNNNNNNNN         NNNNNNN NN  N  ",
      "P  PPPPPPPPP         PPPPPPP PP  P  ",
      "                +*)('               ",
      "R  RRRRRRRRR         RRRRRRR RR aR  ",
      "U  UUUUUUUUU         UUUUUUU UU  U  ",
      "Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
      "c  ccccccccc         ccccccc cc cc  ",
      "                             j      ",
      "L  fLLLLLLLL         LLLLLLe LL  L  ",
      "6   66666666         66666   66  6  ",
      "              k                     ",
      "                             l      ",
      "                XXXXX               ",
      ` 1 0        /.-,+*)('    & %$m #  "!`,
      "_  f________         ______e __  _  ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1 0        /.-,+*)('      %$  #  "!`,
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      ` 1           .  +*)('          #  " `,
      ` 1           .  +*)('          #  " `,
      ">  >>>>>>>>>         >>>>>>> >> >>  ",
      ` 1           .  +*)('          #  " `,
      ` 1           .  +*)('          #  " `,
      "Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
      "V  VVVVVVVVV         VVVVVVV VV aV  ",
      "T  TTTTTTTTT         TTTTTTT TT  T  ",
      "@  @@@@@@@@@         @@@@@@@ @@ @@  ",
      "                                   ",
      "[  [[[[[[[[[         [[[[[[[ [[ [[  ",
      "D  DDDDDDDDD         DDDDDDD DD DD  ",
      "                             HH     ",
      "                                   ",
      "                             F     ",
      "#      T#                    ##  #  ",
      "%   V  %%            U       %%  %  ",
      "'   'ZY''            'XW     ''  '  ",
      "(   (ZY((            (XW     ((  (  ",
      "+   +++++            +++\\[   ++  +  ",
      "*   *****            ***\\[   **  *  ",
      "-   -----            ---\\[   --  -  ",
      ",   ,,,,,            ,,,\\[   ,,  ,  ",
      "0   00000_^]         00000   00  0  ",
      "/   /////_^]         /////   //  /  ",
      "2   22222222         22222   22  2  ",
      "3   33333333         33333   33  3  ",
      "4   44444444         44444   44  4  ",
      "8   88888888         888888  88  8  ",
      "                                 ^  ",
      "                                   ",
      ";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
      "<  f<<<<<<<<         <<<<<<e <<  <  ",
      "O  OOOOOOOOO         OOOOOOO OO  O  ",
      "`  `````````         ``````` ``  `  ",
      "S  SSSSSSSSS         SSSSSSS SS  S  ",
      "W  WWWWWWWWW         WWWWWWW WW  W  ",
      "\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
      "E  EEEEEEEEE         EEEEEEE EE EE  ",
      ` 1 0        /.-,+*)('    & %$  #  "!`,
      "]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
      "                             G      "
    ];
    XPathParser.gotoTable = [
      "3456789:;<=>?@ AB  CDEFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "L456789:;<=>?@ AB  CDEFGH IJ ",
      "            M        EFGH IJ ",
      "       N;<=>?@ AB  CDEFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "            S        EFGH IJ ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "              e              ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                        h  J ",
      "              i          j   ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "o456789:;<=>?@ ABpqCDEFGH IJ ",
      "                             ",
      "  r6789:;<=>?@ AB  CDEFGH IJ ",
      "   s789:;<=>?@ AB  CDEFGH IJ ",
      "    t89:;<=>?@ AB  CDEFGH IJ ",
      "    u89:;<=>?@ AB  CDEFGH IJ ",
      "     v9:;<=>?@ AB  CDEFGH IJ ",
      "     w9:;<=>?@ AB  CDEFGH IJ ",
      "     x9:;<=>?@ AB  CDEFGH IJ ",
      "     y9:;<=>?@ AB  CDEFGH IJ ",
      "      z:;<=>?@ AB  CDEFGH IJ ",
      "      {:;<=>?@ AB  CDEFGH IJ ",
      "       |;<=>?@ AB  CDEFGH IJ ",
      "       };<=>?@ AB  CDEFGH IJ ",
      "       ~;<=>?@ AB  CDEFGH IJ ",
      "         =>?@ AB  CDEFGH IJ ",
      "456789:;<=>?@ AB  CDEFGH IJ",
      "                    EFGH IJ ",
      "                    EFGH IJ ",
      "                             ",
      "                      GH IJ ",
      "                      GH IJ ",
      "              i             ",
      "              i             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "                             ",
      "o456789:;<=>?@ ABqCDEFGH IJ ",
      "                             ",
      "                             "
    ];
    XPathParser.productions = [
      [1, 1, 2],
      [2, 1, 3],
      [3, 1, 4],
      [3, 3, 3, -9, 4],
      [4, 1, 5],
      [4, 3, 4, -8, 5],
      [5, 1, 6],
      [5, 3, 5, -22, 6],
      [5, 3, 5, -5, 6],
      [6, 1, 7],
      [6, 3, 6, -23, 7],
      [6, 3, 6, -24, 7],
      [6, 3, 6, -6, 7],
      [6, 3, 6, -7, 7],
      [7, 1, 8],
      [7, 3, 7, -25, 8],
      [7, 3, 7, -26, 8],
      [8, 1, 9],
      [8, 3, 8, -12, 9],
      [8, 3, 8, -11, 9],
      [8, 3, 8, -10, 9],
      [9, 1, 10],
      [9, 2, -26, 9],
      [10, 1, 11],
      [10, 3, 10, -27, 11],
      [11, 1, 12],
      [11, 1, 13],
      [11, 3, 13, -28, 14],
      [11, 3, 13, -4, 14],
      [13, 1, 15],
      [13, 2, 13, 16],
      [15, 1, 17],
      [15, 3, -29, 2, -30],
      [15, 1, -15],
      [15, 1, -16],
      [15, 1, 18],
      [18, 3, -13, -29, -30],
      [18, 4, -13, -29, 19, -30],
      [19, 1, 20],
      [19, 3, 20, -31, 19],
      [20, 1, 2],
      [12, 1, 14],
      [12, 1, 21],
      [21, 1, -28],
      [21, 2, -28, 14],
      [21, 1, 22],
      [14, 1, 23],
      [14, 3, 14, -28, 23],
      [14, 1, 24],
      [23, 2, 25, 26],
      [23, 1, 26],
      [23, 3, 25, 26, 27],
      [23, 2, 26, 27],
      [23, 1, 28],
      [27, 1, 16],
      [27, 2, 16, 27],
      [25, 2, -14, -3],
      [25, 1, -32],
      [26, 1, 29],
      [26, 3, -20, -29, -30],
      [26, 4, -21, -29, -15, -30],
      [16, 3, -33, 30, -34],
      [30, 1, 2],
      [22, 2, -4, 14],
      [24, 3, 14, -4, 23],
      [28, 1, -35],
      [28, 1, -2],
      [17, 2, -36, -18],
      [29, 1, -17],
      [29, 1, -19],
      [29, 1, -18]
    ];
    XPathParser.DOUBLEDOT = 2;
    XPathParser.DOUBLECOLON = 3;
    XPathParser.DOUBLESLASH = 4;
    XPathParser.NOTEQUAL = 5;
    XPathParser.LESSTHANOREQUAL = 6;
    XPathParser.GREATERTHANOREQUAL = 7;
    XPathParser.AND = 8;
    XPathParser.OR = 9;
    XPathParser.MOD = 10;
    XPathParser.DIV = 11;
    XPathParser.MULTIPLYOPERATOR = 12;
    XPathParser.FUNCTIONNAME = 13;
    XPathParser.AXISNAME = 14;
    XPathParser.LITERAL = 15;
    XPathParser.NUMBER = 16;
    XPathParser.ASTERISKNAMETEST = 17;
    XPathParser.QNAME = 18;
    XPathParser.NCNAMECOLONASTERISK = 19;
    XPathParser.NODETYPE = 20;
    XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
    XPathParser.EQUALS = 22;
    XPathParser.LESSTHAN = 23;
    XPathParser.GREATERTHAN = 24;
    XPathParser.PLUS = 25;
    XPathParser.MINUS = 26;
    XPathParser.BAR = 27;
    XPathParser.SLASH = 28;
    XPathParser.LEFTPARENTHESIS = 29;
    XPathParser.RIGHTPARENTHESIS = 30;
    XPathParser.COMMA = 31;
    XPathParser.AT = 32;
    XPathParser.LEFTBRACKET = 33;
    XPathParser.RIGHTBRACKET = 34;
    XPathParser.DOT = 35;
    XPathParser.DOLLAR = 36;
    XPathParser.prototype.tokenize = function(s1) {
      var types = [];
      var values = [];
      var s = s1 + "\0";
      var pos = 0;
      var c = s.charAt(pos++);
      while (1) {
        while (c == " " || c == "	" || c == "\r" || c == "\n") {
          c = s.charAt(pos++);
        }
        if (c == "\0" || pos >= s.length) {
          break;
        }
        if (c == "(") {
          types.push(XPathParser.LEFTPARENTHESIS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ")") {
          types.push(XPathParser.RIGHTPARENTHESIS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "[") {
          types.push(XPathParser.LEFTBRACKET);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "]") {
          types.push(XPathParser.RIGHTBRACKET);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "@") {
          types.push(XPathParser.AT);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ",") {
          types.push(XPathParser.COMMA);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "|") {
          types.push(XPathParser.BAR);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "+") {
          types.push(XPathParser.PLUS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "-") {
          types.push(XPathParser.MINUS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "=") {
          types.push(XPathParser.EQUALS);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == "$") {
          types.push(XPathParser.DOLLAR);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ".") {
          c = s.charAt(pos++);
          if (c == ".") {
            types.push(XPathParser.DOUBLEDOT);
            values.push("..");
            c = s.charAt(pos++);
            continue;
          }
          if (c >= "0" && c <= "9") {
            var number = "." + c;
            c = s.charAt(pos++);
            while (c >= "0" && c <= "9") {
              number += c;
              c = s.charAt(pos++);
            }
            types.push(XPathParser.NUMBER);
            values.push(number);
            continue;
          }
          types.push(XPathParser.DOT);
          values.push(".");
          continue;
        }
        if (c == "'" || c == '"') {
          var delimiter = c;
          var literal = "";
          while (pos < s.length && (c = s.charAt(pos)) !== delimiter) {
            literal += c;
            pos += 1;
          }
          if (c !== delimiter) {
            throw XPathException.fromMessage("Unterminated string literal: " + delimiter + literal);
          }
          pos += 1;
          types.push(XPathParser.LITERAL);
          values.push(literal);
          c = s.charAt(pos++);
          continue;
        }
        if (c >= "0" && c <= "9") {
          var number = c;
          c = s.charAt(pos++);
          while (c >= "0" && c <= "9") {
            number += c;
            c = s.charAt(pos++);
          }
          if (c == ".") {
            if (s.charAt(pos) >= "0" && s.charAt(pos) <= "9") {
              number += c;
              number += s.charAt(pos++);
              c = s.charAt(pos++);
              while (c >= "0" && c <= "9") {
                number += c;
                c = s.charAt(pos++);
              }
            }
          }
          types.push(XPathParser.NUMBER);
          values.push(number);
          continue;
        }
        if (c == "*") {
          if (types.length > 0) {
            var last = types[types.length - 1];
            if (last != XPathParser.AT && last != XPathParser.DOUBLECOLON && last != XPathParser.LEFTPARENTHESIS && last != XPathParser.LEFTBRACKET && last != XPathParser.AND && last != XPathParser.OR && last != XPathParser.MOD && last != XPathParser.DIV && last != XPathParser.MULTIPLYOPERATOR && last != XPathParser.SLASH && last != XPathParser.DOUBLESLASH && last != XPathParser.BAR && last != XPathParser.PLUS && last != XPathParser.MINUS && last != XPathParser.EQUALS && last != XPathParser.NOTEQUAL && last != XPathParser.LESSTHAN && last != XPathParser.LESSTHANOREQUAL && last != XPathParser.GREATERTHAN && last != XPathParser.GREATERTHANOREQUAL) {
              types.push(XPathParser.MULTIPLYOPERATOR);
              values.push(c);
              c = s.charAt(pos++);
              continue;
            }
          }
          types.push(XPathParser.ASTERISKNAMETEST);
          values.push(c);
          c = s.charAt(pos++);
          continue;
        }
        if (c == ":") {
          if (s.charAt(pos) == ":") {
            types.push(XPathParser.DOUBLECOLON);
            values.push("::");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
        }
        if (c == "/") {
          c = s.charAt(pos++);
          if (c == "/") {
            types.push(XPathParser.DOUBLESLASH);
            values.push("//");
            c = s.charAt(pos++);
            continue;
          }
          types.push(XPathParser.SLASH);
          values.push("/");
          continue;
        }
        if (c == "!") {
          if (s.charAt(pos) == "=") {
            types.push(XPathParser.NOTEQUAL);
            values.push("!=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
        }
        if (c == "<") {
          if (s.charAt(pos) == "=") {
            types.push(XPathParser.LESSTHANOREQUAL);
            values.push("<=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
          types.push(XPathParser.LESSTHAN);
          values.push("<");
          c = s.charAt(pos++);
          continue;
        }
        if (c == ">") {
          if (s.charAt(pos) == "=") {
            types.push(XPathParser.GREATERTHANOREQUAL);
            values.push(">=");
            pos++;
            c = s.charAt(pos++);
            continue;
          }
          types.push(XPathParser.GREATERTHAN);
          values.push(">");
          c = s.charAt(pos++);
          continue;
        }
        if (c == "_" || Utilities.isLetter(c.charCodeAt(0))) {
          var name2 = c;
          c = s.charAt(pos++);
          while (Utilities.isNCNameChar(c.charCodeAt(0))) {
            name2 += c;
            c = s.charAt(pos++);
          }
          if (types.length > 0) {
            var last = types[types.length - 1];
            if (last != XPathParser.AT && last != XPathParser.DOUBLECOLON && last != XPathParser.LEFTPARENTHESIS && last != XPathParser.LEFTBRACKET && last != XPathParser.AND && last != XPathParser.OR && last != XPathParser.MOD && last != XPathParser.DIV && last != XPathParser.MULTIPLYOPERATOR && last != XPathParser.SLASH && last != XPathParser.DOUBLESLASH && last != XPathParser.BAR && last != XPathParser.PLUS && last != XPathParser.MINUS && last != XPathParser.EQUALS && last != XPathParser.NOTEQUAL && last != XPathParser.LESSTHAN && last != XPathParser.LESSTHANOREQUAL && last != XPathParser.GREATERTHAN && last != XPathParser.GREATERTHANOREQUAL) {
              if (name2 == "and") {
                types.push(XPathParser.AND);
                values.push(name2);
                continue;
              }
              if (name2 == "or") {
                types.push(XPathParser.OR);
                values.push(name2);
                continue;
              }
              if (name2 == "mod") {
                types.push(XPathParser.MOD);
                values.push(name2);
                continue;
              }
              if (name2 == "div") {
                types.push(XPathParser.DIV);
                values.push(name2);
                continue;
              }
            }
          }
          if (c == ":") {
            if (s.charAt(pos) == "*") {
              types.push(XPathParser.NCNAMECOLONASTERISK);
              values.push(name2 + ":*");
              pos++;
              c = s.charAt(pos++);
              continue;
            }
            if (s.charAt(pos) == "_" || Utilities.isLetter(s.charCodeAt(pos))) {
              name2 += ":";
              c = s.charAt(pos++);
              while (Utilities.isNCNameChar(c.charCodeAt(0))) {
                name2 += c;
                c = s.charAt(pos++);
              }
              if (c == "(") {
                types.push(XPathParser.FUNCTIONNAME);
                values.push(name2);
                continue;
              }
              types.push(XPathParser.QNAME);
              values.push(name2);
              continue;
            }
            if (s.charAt(pos) == ":") {
              types.push(XPathParser.AXISNAME);
              values.push(name2);
              continue;
            }
          }
          if (c == "(") {
            if (name2 == "comment" || name2 == "text" || name2 == "node") {
              types.push(XPathParser.NODETYPE);
              values.push(name2);
              continue;
            }
            if (name2 == "processing-instruction") {
              if (s.charAt(pos) == ")") {
                types.push(XPathParser.NODETYPE);
              } else {
                types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
              }
              values.push(name2);
              continue;
            }
            types.push(XPathParser.FUNCTIONNAME);
            values.push(name2);
            continue;
          }
          types.push(XPathParser.QNAME);
          values.push(name2);
          continue;
        }
        throw new Error("Unexpected character " + c);
      }
      types.push(1);
      values.push("[EOF]");
      return [types, values];
    };
    XPathParser.SHIFT = "s";
    XPathParser.REDUCE = "r";
    XPathParser.ACCEPT = "a";
    XPathParser.prototype.parse = function(s) {
      if (!s) {
        throw new Error("XPath expression unspecified.");
      }
      if (typeof s !== "string") {
        throw new Error("XPath expression must be a string.");
      }
      var types;
      var values;
      var res = this.tokenize(s);
      if (res == void 0) {
        return void 0;
      }
      types = res[0];
      values = res[1];
      var tokenPos = 0;
      var state = [];
      var tokenType = [];
      var tokenValue = [];
      var s;
      var a;
      var t;
      state.push(0);
      tokenType.push(1);
      tokenValue.push("_S");
      a = types[tokenPos];
      t = values[tokenPos++];
      while (1) {
        s = state[state.length - 1];
        switch (XPathParser.actionTable[s].charAt(a - 1)) {
          case XPathParser.SHIFT:
            tokenType.push(-a);
            tokenValue.push(t);
            state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
            a = types[tokenPos];
            t = values[tokenPos++];
            break;
          case XPathParser.REDUCE:
            var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
            var rhs = [];
            for (var i = 0; i < num; i++) {
              tokenType.pop();
              rhs.unshift(tokenValue.pop());
              state.pop();
            }
            var s_ = state[state.length - 1];
            tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
            if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == void 0) {
              tokenValue.push(rhs[0]);
            } else {
              tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
            }
            state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
            break;
          case XPathParser.ACCEPT:
            return new XPath(tokenValue.pop());
          default:
            throw new Error("XPath parse error");
        }
      }
    };
    XPath.prototype = new Object();
    XPath.prototype.constructor = XPath;
    XPath.superclass = Object.prototype;
    function XPath(e) {
      this.expression = e;
    }
    XPath.prototype.toString = function() {
      return this.expression.toString();
    };
    function setIfUnset(obj, prop, value) {
      if (!(prop in obj)) {
        obj[prop] = value;
      }
    }
    XPath.prototype.evaluate = function(c) {
      var node = c.expressionContextNode;
      if (!(isNil(node) || isNodeLike(node))) {
        throw new Error("Context node does not appear to be a valid DOM node.");
      }
      c.contextNode = c.expressionContextNode;
      c.contextSize = 1;
      c.contextPosition = 1;
      if (c.isHtml) {
        setIfUnset(c, "caseInsensitive", true);
        setIfUnset(c, "allowAnyNamespaceForNoPrefix", true);
      }
      setIfUnset(c, "caseInsensitive", false);
      return this.expression.evaluate(c);
    };
    XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
    XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";
    Expression.prototype = new Object();
    Expression.prototype.constructor = Expression;
    Expression.superclass = Object.prototype;
    function Expression() {
    }
    Expression.prototype.init = function() {
    };
    Expression.prototype.toString = function() {
      return "<Expression>";
    };
    Expression.prototype.evaluate = function(c) {
      throw new Error("Could not evaluate expression.");
    };
    UnaryOperation.prototype = new Expression();
    UnaryOperation.prototype.constructor = UnaryOperation;
    UnaryOperation.superclass = Expression.prototype;
    function UnaryOperation(rhs) {
      if (arguments.length > 0) {
        this.init(rhs);
      }
    }
    UnaryOperation.prototype.init = function(rhs) {
      this.rhs = rhs;
    };
    UnaryMinusOperation.prototype = new UnaryOperation();
    UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
    UnaryMinusOperation.superclass = UnaryOperation.prototype;
    function UnaryMinusOperation(rhs) {
      if (arguments.length > 0) {
        this.init(rhs);
      }
    }
    UnaryMinusOperation.prototype.init = function(rhs) {
      UnaryMinusOperation.superclass.init.call(this, rhs);
    };
    UnaryMinusOperation.prototype.evaluate = function(c) {
      return this.rhs.evaluate(c).number().negate();
    };
    UnaryMinusOperation.prototype.toString = function() {
      return "-" + this.rhs.toString();
    };
    BinaryOperation.prototype = new Expression();
    BinaryOperation.prototype.constructor = BinaryOperation;
    BinaryOperation.superclass = Expression.prototype;
    function BinaryOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    BinaryOperation.prototype.init = function(lhs, rhs) {
      this.lhs = lhs;
      this.rhs = rhs;
    };
    OrOperation.prototype = new BinaryOperation();
    OrOperation.prototype.constructor = OrOperation;
    OrOperation.superclass = BinaryOperation.prototype;
    function OrOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    OrOperation.prototype.init = function(lhs, rhs) {
      OrOperation.superclass.init.call(this, lhs, rhs);
    };
    OrOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
    };
    OrOperation.prototype.evaluate = function(c) {
      var b = this.lhs.evaluate(c).bool();
      if (b.booleanValue()) {
        return b;
      }
      return this.rhs.evaluate(c).bool();
    };
    AndOperation.prototype = new BinaryOperation();
    AndOperation.prototype.constructor = AndOperation;
    AndOperation.superclass = BinaryOperation.prototype;
    function AndOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    AndOperation.prototype.init = function(lhs, rhs) {
      AndOperation.superclass.init.call(this, lhs, rhs);
    };
    AndOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
    };
    AndOperation.prototype.evaluate = function(c) {
      var b = this.lhs.evaluate(c).bool();
      if (!b.booleanValue()) {
        return b;
      }
      return this.rhs.evaluate(c).bool();
    };
    EqualsOperation.prototype = new BinaryOperation();
    EqualsOperation.prototype.constructor = EqualsOperation;
    EqualsOperation.superclass = BinaryOperation.prototype;
    function EqualsOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    EqualsOperation.prototype.init = function(lhs, rhs) {
      EqualsOperation.superclass.init.call(this, lhs, rhs);
    };
    EqualsOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
    };
    EqualsOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
    };
    NotEqualOperation.prototype = new BinaryOperation();
    NotEqualOperation.prototype.constructor = NotEqualOperation;
    NotEqualOperation.superclass = BinaryOperation.prototype;
    function NotEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    NotEqualOperation.prototype.init = function(lhs, rhs) {
      NotEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    NotEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
    };
    NotEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
    };
    LessThanOperation.prototype = new BinaryOperation();
    LessThanOperation.prototype.constructor = LessThanOperation;
    LessThanOperation.superclass = BinaryOperation.prototype;
    function LessThanOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    LessThanOperation.prototype.init = function(lhs, rhs) {
      LessThanOperation.superclass.init.call(this, lhs, rhs);
    };
    LessThanOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
    };
    LessThanOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
    };
    GreaterThanOperation.prototype = new BinaryOperation();
    GreaterThanOperation.prototype.constructor = GreaterThanOperation;
    GreaterThanOperation.superclass = BinaryOperation.prototype;
    function GreaterThanOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    GreaterThanOperation.prototype.init = function(lhs, rhs) {
      GreaterThanOperation.superclass.init.call(this, lhs, rhs);
    };
    GreaterThanOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
    };
    GreaterThanOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
    };
    LessThanOrEqualOperation.prototype = new BinaryOperation();
    LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
    LessThanOrEqualOperation.superclass = BinaryOperation.prototype;
    function LessThanOrEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
      LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    LessThanOrEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
    };
    LessThanOrEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
    };
    GreaterThanOrEqualOperation.prototype = new BinaryOperation();
    GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
    GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;
    function GreaterThanOrEqualOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
      GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
    };
    GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
    };
    GreaterThanOrEqualOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
    };
    PlusOperation.prototype = new BinaryOperation();
    PlusOperation.prototype.constructor = PlusOperation;
    PlusOperation.superclass = BinaryOperation.prototype;
    function PlusOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    PlusOperation.prototype.init = function(lhs, rhs) {
      PlusOperation.superclass.init.call(this, lhs, rhs);
    };
    PlusOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
    };
    PlusOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
    };
    MinusOperation.prototype = new BinaryOperation();
    MinusOperation.prototype.constructor = MinusOperation;
    MinusOperation.superclass = BinaryOperation.prototype;
    function MinusOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    MinusOperation.prototype.init = function(lhs, rhs) {
      MinusOperation.superclass.init.call(this, lhs, rhs);
    };
    MinusOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
    };
    MinusOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
    };
    MultiplyOperation.prototype = new BinaryOperation();
    MultiplyOperation.prototype.constructor = MultiplyOperation;
    MultiplyOperation.superclass = BinaryOperation.prototype;
    function MultiplyOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    MultiplyOperation.prototype.init = function(lhs, rhs) {
      MultiplyOperation.superclass.init.call(this, lhs, rhs);
    };
    MultiplyOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
    };
    MultiplyOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
    };
    DivOperation.prototype = new BinaryOperation();
    DivOperation.prototype.constructor = DivOperation;
    DivOperation.superclass = BinaryOperation.prototype;
    function DivOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    DivOperation.prototype.init = function(lhs, rhs) {
      DivOperation.superclass.init.call(this, lhs, rhs);
    };
    DivOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
    };
    DivOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
    };
    ModOperation.prototype = new BinaryOperation();
    ModOperation.prototype.constructor = ModOperation;
    ModOperation.superclass = BinaryOperation.prototype;
    function ModOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    ModOperation.prototype.init = function(lhs, rhs) {
      ModOperation.superclass.init.call(this, lhs, rhs);
    };
    ModOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
    };
    ModOperation.prototype.toString = function() {
      return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
    };
    BarOperation.prototype = new BinaryOperation();
    BarOperation.prototype.constructor = BarOperation;
    BarOperation.superclass = BinaryOperation.prototype;
    function BarOperation(lhs, rhs) {
      if (arguments.length > 0) {
        this.init(lhs, rhs);
      }
    }
    BarOperation.prototype.init = function(lhs, rhs) {
      BarOperation.superclass.init.call(this, lhs, rhs);
    };
    BarOperation.prototype.evaluate = function(c) {
      return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
    };
    BarOperation.prototype.toString = function() {
      return map(toString, [this.lhs, this.rhs]).join(" | ");
    };
    PathExpr.prototype = new Expression();
    PathExpr.prototype.constructor = PathExpr;
    PathExpr.superclass = Expression.prototype;
    function PathExpr(filter2, filterPreds, locpath) {
      if (arguments.length > 0) {
        this.init(filter2, filterPreds, locpath);
      }
    }
    PathExpr.prototype.init = function(filter2, filterPreds, locpath) {
      PathExpr.superclass.init.call(this);
      this.filter = filter2;
      this.filterPredicates = filterPreds;
      this.locationPath = locpath;
    };
    function findRoot(node) {
      while (node && node.parentNode) {
        node = node.parentNode;
      }
      return node;
    }
    var applyPredicates = function(predicates, c, nodes, reverse) {
      if (predicates.length === 0) {
        return nodes;
      }
      var ctx = c.extend({});
      return reduce(
        function(inNodes, pred) {
          ctx.contextSize = inNodes.length;
          return filter(
            function(node, i) {
              ctx.contextNode = node;
              ctx.contextPosition = i + 1;
              return PathExpr.predicateMatches(pred, ctx);
            },
            inNodes
          );
        },
        sortNodes(nodes, reverse),
        predicates
      );
    };
    PathExpr.getRoot = function(xpc, nodes) {
      var firstNode = nodes[0];
      if (firstNode && firstNode.nodeType === NodeTypes.DOCUMENT_NODE) {
        return firstNode;
      }
      if (xpc.virtualRoot) {
        return xpc.virtualRoot;
      }
      if (!firstNode) {
        throw new Error("Context node not found when determining document root.");
      }
      var ownerDoc = firstNode.ownerDocument;
      if (ownerDoc) {
        return ownerDoc;
      }
      var n = firstNode;
      while (n.parentNode != null) {
        n = n.parentNode;
      }
      return n;
    };
    var getPrefixForNamespaceNode = function(attrNode) {
      var nm = String(attrNode.name);
      if (nm === "xmlns") {
        return "";
      }
      if (nm.substring(0, 6) === "xmlns:") {
        return nm.substring(6, nm.length);
      }
      return null;
    };
    PathExpr.applyStep = function(step, xpc, node) {
      if (!node) {
        throw new Error("Context node not found when evaluating XPath step: " + step);
      }
      var newNodes = [];
      xpc.contextNode = node;
      switch (step.axis) {
        case Step.ANCESTOR:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          var m;
          if (xpc.contextNode.nodeType == NodeTypes.ATTRIBUTE_NODE) {
            m = PathExpr.getOwnerElement(xpc.contextNode);
          } else {
            m = xpc.contextNode.parentNode;
          }
          while (m != null) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m === xpc.virtualRoot) {
              break;
            }
            m = m.parentNode;
          }
          break;
        case Step.ANCESTORORSELF:
          for (var m = xpc.contextNode; m != null; m = m.nodeType == NodeTypes.ATTRIBUTE_NODE ? PathExpr.getOwnerElement(m) : m.parentNode) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m === xpc.virtualRoot) {
              break;
            }
          }
          break;
        case Step.ATTRIBUTE:
          var nnm = xpc.contextNode.attributes;
          if (nnm != null) {
            for (var k = 0; k < nnm.length; k++) {
              var m = nnm.item(k);
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
            }
          }
          break;
        case Step.CHILD:
          for (var m = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.DESCENDANT:
          var st = [xpc.contextNode.firstChild];
          while (st.length > 0) {
            for (var m = st.pop(); m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          }
          break;
        case Step.DESCENDANTORSELF:
          if (step.nodeTest.matches(xpc.contextNode, xpc)) {
            newNodes.push(xpc.contextNode);
          }
          var st = [xpc.contextNode.firstChild];
          while (st.length > 0) {
            for (var m = st.pop(); m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          }
          break;
        case Step.FOLLOWING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          var st = [];
          if (xpc.contextNode.firstChild != null) {
            st.unshift(xpc.contextNode.firstChild);
          } else {
            st.unshift(xpc.contextNode.nextSibling);
          }
          for (var m = xpc.contextNode.parentNode; m != null && m.nodeType != NodeTypes.DOCUMENT_NODE && m !== xpc.virtualRoot; m = m.parentNode) {
            st.unshift(m.nextSibling);
          }
          do {
            for (var m = st.pop(); m != null; ) {
              if (step.nodeTest.matches(m, xpc)) {
                newNodes.push(m);
              }
              if (m.firstChild != null) {
                st.push(m.nextSibling);
                m = m.firstChild;
              } else {
                m = m.nextSibling;
              }
            }
          } while (st.length > 0);
          break;
        case Step.FOLLOWINGSIBLING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          for (var m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.NAMESPACE:
          var nodes = {};
          if (xpc.contextNode.nodeType == NodeTypes.ELEMENT_NODE) {
            nodes["xml"] = new XPathNamespace("xml", null, XPath.XML_NAMESPACE_URI, xpc.contextNode);
            for (var m = xpc.contextNode; m != null && m.nodeType == NodeTypes.ELEMENT_NODE; m = m.parentNode) {
              for (var k = 0; k < m.attributes.length; k++) {
                var attr = m.attributes.item(k);
                var pre = getPrefixForNamespaceNode(attr);
                if (pre != null && nodes[pre] == void 0) {
                  nodes[pre] = new XPathNamespace(pre, attr, attr.value, xpc.contextNode);
                }
              }
            }
            for (var pre in nodes) {
              var node = nodes[pre];
              if (step.nodeTest.matches(node, xpc)) {
                newNodes.push(node);
              }
            }
          }
          break;
        case Step.PARENT:
          m = null;
          if (xpc.contextNode !== xpc.virtualRoot) {
            if (xpc.contextNode.nodeType == NodeTypes.ATTRIBUTE_NODE) {
              m = PathExpr.getOwnerElement(xpc.contextNode);
            } else {
              m = xpc.contextNode.parentNode;
            }
          }
          if (m != null && step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
          break;
        case Step.PRECEDING:
          var st;
          if (xpc.virtualRoot != null) {
            st = [xpc.virtualRoot];
          } else {
            st = [findRoot(xpc.contextNode)];
          }
          outer:
            while (st.length > 0) {
              for (var m = st.pop(); m != null; ) {
                if (m == xpc.contextNode) {
                  break outer;
                }
                if (step.nodeTest.matches(m, xpc)) {
                  newNodes.unshift(m);
                }
                if (m.firstChild != null) {
                  st.push(m.nextSibling);
                  m = m.firstChild;
                } else {
                  m = m.nextSibling;
                }
              }
            }
          break;
        case Step.PRECEDINGSIBLING:
          if (xpc.contextNode === xpc.virtualRoot) {
            break;
          }
          for (var m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
          break;
        case Step.SELF:
          if (step.nodeTest.matches(xpc.contextNode, xpc)) {
            newNodes.push(xpc.contextNode);
          }
          break;
        default:
      }
      return newNodes;
    };
    function applyStepWithPredicates(step, xpc, node) {
      return applyPredicates(
        step.predicates,
        xpc,
        PathExpr.applyStep(step, xpc, node),
        includes(REVERSE_AXES, step.axis)
      );
    }
    function applyStepToNodes(context, nodes, step) {
      return flatten(
        map(
          applyStepWithPredicates.bind(null, step, context),
          nodes
        )
      );
    }
    PathExpr.applySteps = function(steps, xpc, nodes) {
      return reduce(
        applyStepToNodes.bind(null, xpc),
        nodes,
        steps
      );
    };
    PathExpr.prototype.applyFilter = function(c, xpc) {
      if (!this.filter) {
        return { nodes: [c.contextNode] };
      }
      var ns = this.filter.evaluate(c);
      if (!Utilities.instance_of(ns, XNodeSet)) {
        if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
          throw new Error("Path expression filter must evaluate to a nodeset if predicates or location path are used");
        }
        return { nonNodes: ns };
      }
      return {
        nodes: applyPredicates(
          this.filterPredicates || [],
          xpc,
          ns.toUnsortedArray(),
          false
          // reverse
        )
      };
    };
    PathExpr.applyLocationPath = function(locationPath, xpc, nodes) {
      if (!locationPath) {
        return nodes;
      }
      var startNodes = locationPath.absolute ? [PathExpr.getRoot(xpc, nodes)] : nodes;
      return PathExpr.applySteps(locationPath.steps, xpc, startNodes);
    };
    PathExpr.prototype.evaluate = function(c) {
      var xpc = assign2(new XPathContext(), c);
      var filterResult = this.applyFilter(c, xpc);
      if ("nonNodes" in filterResult) {
        return filterResult.nonNodes;
      }
      var ns = new XNodeSet();
      ns.addArray(PathExpr.applyLocationPath(this.locationPath, xpc, filterResult.nodes));
      return ns;
    };
    PathExpr.predicateMatches = function(pred, c) {
      var res = pred.evaluate(c);
      return Utilities.instance_of(res, XNumber) ? c.contextPosition === res.numberValue() : res.booleanValue();
    };
    PathExpr.predicateString = function(predicate) {
      return wrap("[", "]", predicate.toString());
    };
    PathExpr.predicatesString = function(predicates) {
      return join(
        "",
        map(PathExpr.predicateString, predicates)
      );
    };
    PathExpr.prototype.toString = function() {
      if (this.filter != void 0) {
        var filterStr = toString(this.filter);
        if (Utilities.instance_of(this.filter, XString)) {
          return wrap("'", "'", filterStr);
        }
        if (this.filterPredicates != void 0 && this.filterPredicates.length) {
          return wrap("(", ")", filterStr) + PathExpr.predicatesString(this.filterPredicates);
        }
        if (this.locationPath != void 0) {
          return filterStr + (this.locationPath.absolute ? "" : "/") + toString(this.locationPath);
        }
        return filterStr;
      }
      return toString(this.locationPath);
    };
    PathExpr.getOwnerElement = function(n) {
      if (n.ownerElement) {
        return n.ownerElement;
      }
      try {
        if (n.selectSingleNode) {
          return n.selectSingleNode("..");
        }
      } catch (e) {
      }
      var doc = n.nodeType == NodeTypes.DOCUMENT_NODE ? n : n.ownerDocument;
      var elts = doc.getElementsByTagName("*");
      for (var i = 0; i < elts.length; i++) {
        var elt = elts.item(i);
        var nnm = elt.attributes;
        for (var j = 0; j < nnm.length; j++) {
          var an = nnm.item(j);
          if (an === n) {
            return elt;
          }
        }
      }
      return null;
    };
    LocationPath.prototype = new Object();
    LocationPath.prototype.constructor = LocationPath;
    LocationPath.superclass = Object.prototype;
    function LocationPath(abs, steps) {
      if (arguments.length > 0) {
        this.init(abs, steps);
      }
    }
    LocationPath.prototype.init = function(abs, steps) {
      this.absolute = abs;
      this.steps = steps;
    };
    LocationPath.prototype.toString = function() {
      return (this.absolute ? "/" : "") + map(toString, this.steps).join("/");
    };
    Step.prototype = new Object();
    Step.prototype.constructor = Step;
    Step.superclass = Object.prototype;
    function Step(axis, nodetest, preds) {
      if (arguments.length > 0) {
        this.init(axis, nodetest, preds);
      }
    }
    Step.prototype.init = function(axis, nodetest, preds) {
      this.axis = axis;
      this.nodeTest = nodetest;
      this.predicates = preds;
    };
    Step.prototype.toString = function() {
      return Step.STEPNAMES[this.axis] + "::" + this.nodeTest.toString() + PathExpr.predicatesString(this.predicates);
    };
    Step.ANCESTOR = 0;
    Step.ANCESTORORSELF = 1;
    Step.ATTRIBUTE = 2;
    Step.CHILD = 3;
    Step.DESCENDANT = 4;
    Step.DESCENDANTORSELF = 5;
    Step.FOLLOWING = 6;
    Step.FOLLOWINGSIBLING = 7;
    Step.NAMESPACE = 8;
    Step.PARENT = 9;
    Step.PRECEDING = 10;
    Step.PRECEDINGSIBLING = 11;
    Step.SELF = 12;
    Step.STEPNAMES = reduce(function(acc, x) {
      return acc[x[0]] = x[1], acc;
    }, {}, [
      [Step.ANCESTOR, "ancestor"],
      [Step.ANCESTORORSELF, "ancestor-or-self"],
      [Step.ATTRIBUTE, "attribute"],
      [Step.CHILD, "child"],
      [Step.DESCENDANT, "descendant"],
      [Step.DESCENDANTORSELF, "descendant-or-self"],
      [Step.FOLLOWING, "following"],
      [Step.FOLLOWINGSIBLING, "following-sibling"],
      [Step.NAMESPACE, "namespace"],
      [Step.PARENT, "parent"],
      [Step.PRECEDING, "preceding"],
      [Step.PRECEDINGSIBLING, "preceding-sibling"],
      [Step.SELF, "self"]
    ]);
    var REVERSE_AXES = [
      Step.ANCESTOR,
      Step.ANCESTORORSELF,
      Step.PARENT,
      Step.PRECEDING,
      Step.PRECEDINGSIBLING
    ];
    NodeTest.prototype = new Object();
    NodeTest.prototype.constructor = NodeTest;
    NodeTest.superclass = Object.prototype;
    function NodeTest(type, value) {
      if (arguments.length > 0) {
        this.init(type, value);
      }
    }
    NodeTest.prototype.init = function(type, value) {
      this.type = type;
      this.value = value;
    };
    NodeTest.prototype.toString = function() {
      return "<unknown nodetest type>";
    };
    NodeTest.prototype.matches = function(n, xpc) {
      console.warn("unknown node test type");
    };
    NodeTest.NAMETESTANY = 0;
    NodeTest.NAMETESTPREFIXANY = 1;
    NodeTest.NAMETESTQNAME = 2;
    NodeTest.COMMENT = 3;
    NodeTest.TEXT = 4;
    NodeTest.PI = 5;
    NodeTest.NODE = 6;
    NodeTest.isNodeType = function(types) {
      return function(node) {
        return includes(types, node.nodeType);
      };
    };
    NodeTest.makeNodeTestType = function(type, members, ctor) {
      var newType = ctor || function() {
      };
      newType.prototype = new NodeTest(type);
      newType.prototype.constructor = newType;
      assign2(newType.prototype, members);
      return newType;
    };
    NodeTest.makeNodeTypeTest = function(type, nodeTypes, stringVal) {
      return new (NodeTest.makeNodeTestType(type, {
        matches: NodeTest.isNodeType(nodeTypes),
        toString: always(stringVal)
      }))();
    };
    NodeTest.hasPrefix = function(node) {
      return node.prefix || (node.nodeName || node.tagName).indexOf(":") !== -1;
    };
    NodeTest.isElementOrAttribute = NodeTest.isNodeType([1, 2]);
    NodeTest.nameSpaceMatches = function(prefix, xpc, n) {
      var nNamespace = n.namespaceURI || "";
      if (!prefix) {
        return !nNamespace || xpc.allowAnyNamespaceForNoPrefix && !NodeTest.hasPrefix(n);
      }
      var ns = xpc.namespaceResolver.getNamespace(prefix, xpc.expressionContextNode);
      if (ns == null) {
        throw new Error("Cannot resolve QName " + prefix);
      }
      return ns === nNamespace;
    };
    NodeTest.localNameMatches = function(localName, xpc, n) {
      var nLocalName = n.localName || n.nodeName;
      return xpc.caseInsensitive ? localName.toLowerCase() === nLocalName.toLowerCase() : localName === nLocalName;
    };
    NodeTest.NameTestPrefixAny = NodeTest.makeNodeTestType(
      NodeTest.NAMETESTPREFIXANY,
      {
        matches: function(n, xpc) {
          return NodeTest.isElementOrAttribute(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n);
        },
        toString: function() {
          return this.prefix + ":*";
        }
      },
      function NameTestPrefixAny(prefix) {
        this.prefix = prefix;
      }
    );
    NodeTest.NameTestQName = NodeTest.makeNodeTestType(
      NodeTest.NAMETESTQNAME,
      {
        matches: function(n, xpc) {
          return NodeTest.isNodeType(
            [
              NodeTypes.ELEMENT_NODE,
              NodeTypes.ATTRIBUTE_NODE,
              NodeTypes.NAMESPACE_NODE
            ]
          )(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n) && NodeTest.localNameMatches(this.localName, xpc, n);
        },
        toString: function() {
          return this.name;
        }
      },
      function NameTestQName(name2) {
        var nameParts = name2.split(":");
        this.name = name2;
        this.prefix = nameParts.length > 1 ? nameParts[0] : null;
        this.localName = nameParts[nameParts.length > 1 ? 1 : 0];
      }
    );
    NodeTest.PITest = NodeTest.makeNodeTestType(NodeTest.PI, {
      matches: function(n, xpc) {
        return NodeTest.isNodeType(
          [NodeTypes.PROCESSING_INSTRUCTION_NODE]
        )(n) && (n.target || n.nodeName) === this.name;
      },
      toString: function() {
        return wrap('processing-instruction("', '")', this.name);
      }
    }, function(name2) {
      this.name = name2;
    });
    NodeTest.nameTestAny = NodeTest.makeNodeTypeTest(
      NodeTest.NAMETESTANY,
      [
        NodeTypes.ELEMENT_NODE,
        NodeTypes.ATTRIBUTE_NODE,
        NodeTypes.NAMESPACE_NODE
      ],
      "*"
    );
    NodeTest.textTest = NodeTest.makeNodeTypeTest(
      NodeTest.TEXT,
      [
        NodeTypes.TEXT_NODE,
        NodeTypes.CDATA_SECTION_NODE
      ],
      "text()"
    );
    NodeTest.commentTest = NodeTest.makeNodeTypeTest(
      NodeTest.COMMENT,
      [NodeTypes.COMMENT_NODE],
      "comment()"
    );
    NodeTest.nodeTest = NodeTest.makeNodeTypeTest(
      NodeTest.NODE,
      [
        NodeTypes.ELEMENT_NODE,
        NodeTypes.ATTRIBUTE_NODE,
        NodeTypes.TEXT_NODE,
        NodeTypes.CDATA_SECTION_NODE,
        NodeTypes.PROCESSING_INSTRUCTION_NODE,
        NodeTypes.COMMENT_NODE,
        NodeTypes.DOCUMENT_NODE
      ],
      "node()"
    );
    NodeTest.anyPiTest = NodeTest.makeNodeTypeTest(
      NodeTest.PI,
      [NodeTypes.PROCESSING_INSTRUCTION_NODE],
      "processing-instruction()"
    );
    VariableReference.prototype = new Expression();
    VariableReference.prototype.constructor = VariableReference;
    VariableReference.superclass = Expression.prototype;
    function VariableReference(v) {
      if (arguments.length > 0) {
        this.init(v);
      }
    }
    VariableReference.prototype.init = function(v) {
      this.variable = v;
    };
    VariableReference.prototype.toString = function() {
      return "$" + this.variable;
    };
    VariableReference.prototype.evaluate = function(c) {
      var parts = Utilities.resolveQName(this.variable, c.namespaceResolver, c.contextNode, false);
      if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
      }
      var result = c.variableResolver.getVariable(parts[1], parts[0]);
      if (!result) {
        throw XPathException.fromMessage("Undeclared variable: " + this.toString());
      }
      return result;
    };
    FunctionCall.prototype = new Expression();
    FunctionCall.prototype.constructor = FunctionCall;
    FunctionCall.superclass = Expression.prototype;
    function FunctionCall(fn2, args) {
      if (arguments.length > 0) {
        this.init(fn2, args);
      }
    }
    FunctionCall.prototype.init = function(fn2, args) {
      this.functionName = fn2;
      this.arguments = args;
    };
    FunctionCall.prototype.toString = function() {
      var s = this.functionName + "(";
      for (var i = 0; i < this.arguments.length; i++) {
        if (i > 0) {
          s += ", ";
        }
        s += this.arguments[i].toString();
      }
      return s + ")";
    };
    FunctionCall.prototype.evaluate = function(c) {
      var f = FunctionResolver.getFunctionFromContext(this.functionName, c);
      if (!f) {
        throw new Error("Unknown function " + this.functionName);
      }
      var a = [c].concat(this.arguments);
      return f.apply(c.functionResolver.thisArg, a);
    };
    var Operators = new Object();
    Operators.equals = function(l, r) {
      return l.equals(r);
    };
    Operators.notequal = function(l, r) {
      return l.notequal(r);
    };
    Operators.lessthan = function(l, r) {
      return l.lessthan(r);
    };
    Operators.greaterthan = function(l, r) {
      return l.greaterthan(r);
    };
    Operators.lessthanorequal = function(l, r) {
      return l.lessthanorequal(r);
    };
    Operators.greaterthanorequal = function(l, r) {
      return l.greaterthanorequal(r);
    };
    XString.prototype = new Expression();
    XString.prototype.constructor = XString;
    XString.superclass = Expression.prototype;
    function XString(s) {
      if (arguments.length > 0) {
        this.init(s);
      }
    }
    XString.prototype.init = function(s) {
      this.str = String(s);
    };
    XString.prototype.toString = function() {
      return this.str;
    };
    XString.prototype.evaluate = function(c) {
      return this;
    };
    XString.prototype.string = function() {
      return this;
    };
    XString.prototype.number = function() {
      return new XNumber(this.str);
    };
    XString.prototype.bool = function() {
      return new XBoolean(this.str);
    };
    XString.prototype.nodeset = function() {
      throw new Error("Cannot convert string to nodeset");
    };
    XString.prototype.stringValue = function() {
      return this.str;
    };
    XString.prototype.numberValue = function() {
      return this.number().numberValue();
    };
    XString.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    };
    XString.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().equals(r);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.number().equals(r);
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithString(this, Operators.equals);
      }
      return new XBoolean(this.str == r.str);
    };
    XString.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().notequal(r);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.number().notequal(r);
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithString(this, Operators.notequal);
      }
      return new XBoolean(this.str != r.str);
    };
    XString.prototype.lessthan = function(r) {
      return this.number().lessthan(r);
    };
    XString.prototype.greaterthan = function(r) {
      return this.number().greaterthan(r);
    };
    XString.prototype.lessthanorequal = function(r) {
      return this.number().lessthanorequal(r);
    };
    XString.prototype.greaterthanorequal = function(r) {
      return this.number().greaterthanorequal(r);
    };
    XNumber.prototype = new Expression();
    XNumber.prototype.constructor = XNumber;
    XNumber.superclass = Expression.prototype;
    function XNumber(n) {
      if (arguments.length > 0) {
        this.init(n);
      }
    }
    XNumber.prototype.init = function(n) {
      this.num = typeof n === "string" ? this.parse(n) : Number(n);
    };
    XNumber.prototype.numberFormat = /^\s*-?[0-9]*\.?[0-9]+\s*$/;
    XNumber.prototype.parse = function(s) {
      return this.numberFormat.test(s) ? parseFloat(s) : Number.NaN;
    };
    function padSmallNumber(numberStr) {
      var parts = numberStr.split("e-");
      var base = parts[0].replace(".", "");
      var exponent = Number(parts[1]);
      for (var i = 0; i < exponent - 1; i += 1) {
        base = "0" + base;
      }
      return "0." + base;
    }
    function padLargeNumber(numberStr) {
      var parts = numberStr.split("e");
      var base = parts[0].replace(".", "");
      var exponent = Number(parts[1]);
      var zerosToAppend = exponent + 1 - base.length;
      for (var i = 0; i < zerosToAppend; i += 1) {
        base += "0";
      }
      return base;
    }
    XNumber.prototype.toString = function() {
      var strValue = this.num.toString();
      if (strValue.indexOf("e-") !== -1) {
        return padSmallNumber(strValue);
      }
      if (strValue.indexOf("e") !== -1) {
        return padLargeNumber(strValue);
      }
      return strValue;
    };
    XNumber.prototype.evaluate = function(c) {
      return this;
    };
    XNumber.prototype.string = function() {
      return new XString(this.toString());
    };
    XNumber.prototype.number = function() {
      return this;
    };
    XNumber.prototype.bool = function() {
      return new XBoolean(this.num);
    };
    XNumber.prototype.nodeset = function() {
      throw new Error("Cannot convert number to nodeset");
    };
    XNumber.prototype.stringValue = function() {
      return this.string().stringValue();
    };
    XNumber.prototype.numberValue = function() {
      return this.num;
    };
    XNumber.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    };
    XNumber.prototype.negate = function() {
      return new XNumber(-this.num);
    };
    XNumber.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().equals(r);
      }
      if (Utilities.instance_of(r, XString)) {
        return this.equals(r.number());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.equals);
      }
      return new XBoolean(this.num == r.num);
    };
    XNumber.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XBoolean)) {
        return this.bool().notequal(r);
      }
      if (Utilities.instance_of(r, XString)) {
        return this.notequal(r.number());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.notequal);
      }
      return new XBoolean(this.num != r.num);
    };
    XNumber.prototype.lessthan = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.greaterthan);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.lessthan(r.number());
      }
      return new XBoolean(this.num < r.num);
    };
    XNumber.prototype.greaterthan = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.lessthan);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.greaterthan(r.number());
      }
      return new XBoolean(this.num > r.num);
    };
    XNumber.prototype.lessthanorequal = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.greaterthanorequal);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.lessthanorequal(r.number());
      }
      return new XBoolean(this.num <= r.num);
    };
    XNumber.prototype.greaterthanorequal = function(r) {
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithNumber(this, Operators.lessthanorequal);
      }
      if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
        return this.greaterthanorequal(r.number());
      }
      return new XBoolean(this.num >= r.num);
    };
    XNumber.prototype.plus = function(r) {
      return new XNumber(this.num + r.num);
    };
    XNumber.prototype.minus = function(r) {
      return new XNumber(this.num - r.num);
    };
    XNumber.prototype.multiply = function(r) {
      return new XNumber(this.num * r.num);
    };
    XNumber.prototype.div = function(r) {
      return new XNumber(this.num / r.num);
    };
    XNumber.prototype.mod = function(r) {
      return new XNumber(this.num % r.num);
    };
    XBoolean.prototype = new Expression();
    XBoolean.prototype.constructor = XBoolean;
    XBoolean.superclass = Expression.prototype;
    function XBoolean(b) {
      if (arguments.length > 0) {
        this.init(b);
      }
    }
    XBoolean.prototype.init = function(b) {
      this.b = Boolean(b);
    };
    XBoolean.prototype.toString = function() {
      return this.b.toString();
    };
    XBoolean.prototype.evaluate = function(c) {
      return this;
    };
    XBoolean.prototype.string = function() {
      return new XString(this.b);
    };
    XBoolean.prototype.number = function() {
      return new XNumber(this.b);
    };
    XBoolean.prototype.bool = function() {
      return this;
    };
    XBoolean.prototype.nodeset = function() {
      throw new Error("Cannot convert boolean to nodeset");
    };
    XBoolean.prototype.stringValue = function() {
      return this.string().stringValue();
    };
    XBoolean.prototype.numberValue = function() {
      return this.number().numberValue();
    };
    XBoolean.prototype.booleanValue = function() {
      return this.b;
    };
    XBoolean.prototype.not = function() {
      return new XBoolean(!this.b);
    };
    XBoolean.prototype.equals = function(r) {
      if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
        return this.equals(r.bool());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithBoolean(this, Operators.equals);
      }
      return new XBoolean(this.b == r.b);
    };
    XBoolean.prototype.notequal = function(r) {
      if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
        return this.notequal(r.bool());
      }
      if (Utilities.instance_of(r, XNodeSet)) {
        return r.compareWithBoolean(this, Operators.notequal);
      }
      return new XBoolean(this.b != r.b);
    };
    XBoolean.prototype.lessthan = function(r) {
      return this.number().lessthan(r);
    };
    XBoolean.prototype.greaterthan = function(r) {
      return this.number().greaterthan(r);
    };
    XBoolean.prototype.lessthanorequal = function(r) {
      return this.number().lessthanorequal(r);
    };
    XBoolean.prototype.greaterthanorequal = function(r) {
      return this.number().greaterthanorequal(r);
    };
    XBoolean.true_ = new XBoolean(true);
    XBoolean.false_ = new XBoolean(false);
    AVLTree.prototype = new Object();
    AVLTree.prototype.constructor = AVLTree;
    AVLTree.superclass = Object.prototype;
    function AVLTree(n) {
      this.init(n);
    }
    AVLTree.prototype.init = function(n) {
      this.left = null;
      this.right = null;
      this.node = n;
      this.depth = 1;
    };
    AVLTree.prototype.balance = function() {
      var ldepth = this.left == null ? 0 : this.left.depth;
      var rdepth = this.right == null ? 0 : this.right.depth;
      if (ldepth > rdepth + 1) {
        var lldepth = this.left.left == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;
        if (lldepth < lrdepth) {
          this.left.rotateRR();
        }
        this.rotateLL();
      } else if (ldepth + 1 < rdepth) {
        var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
        var rldepth = this.right.left == null ? 0 : this.right.left.depth;
        if (rldepth > rrdepth) {
          this.right.rotateLL();
        }
        this.rotateRR();
      }
    };
    AVLTree.prototype.rotateLL = function() {
      var nodeBefore = this.node;
      var rightBefore = this.right;
      this.node = this.left.node;
      this.right = this.left;
      this.left = this.left.left;
      this.right.left = this.right.right;
      this.right.right = rightBefore;
      this.right.node = nodeBefore;
      this.right.updateInNewLocation();
      this.updateInNewLocation();
    };
    AVLTree.prototype.rotateRR = function() {
      var nodeBefore = this.node;
      var leftBefore = this.left;
      this.node = this.right.node;
      this.left = this.right;
      this.right = this.right.right;
      this.left.right = this.left.left;
      this.left.left = leftBefore;
      this.left.node = nodeBefore;
      this.left.updateInNewLocation();
      this.updateInNewLocation();
    };
    AVLTree.prototype.updateInNewLocation = function() {
      this.getDepthFromChildren();
    };
    AVLTree.prototype.getDepthFromChildren = function() {
      this.depth = this.node == null ? 0 : 1;
      if (this.left != null) {
        this.depth = this.left.depth + 1;
      }
      if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
      }
    };
    function nodeOrder(n1, n2) {
      if (n1 === n2) {
        return 0;
      }
      if (n1.compareDocumentPosition) {
        var cpos = n1.compareDocumentPosition(n2);
        if (cpos & 1) {
          return 1;
        }
        if (cpos & 10) {
          return 1;
        }
        if (cpos & 20) {
          return -1;
        }
        return 0;
      }
      var d1 = 0, d2 = 0;
      for (var m1 = n1; m1 != null; m1 = m1.parentNode || m1.ownerElement) {
        d1++;
      }
      for (var m2 = n2; m2 != null; m2 = m2.parentNode || m2.ownerElement) {
        d2++;
      }
      if (d1 > d2) {
        while (d1 > d2) {
          n1 = n1.parentNode || n1.ownerElement;
          d1--;
        }
        if (n1 === n2) {
          return 1;
        }
      } else if (d2 > d1) {
        while (d2 > d1) {
          n2 = n2.parentNode || n2.ownerElement;
          d2--;
        }
        if (n1 === n2) {
          return -1;
        }
      }
      var n1Par = n1.parentNode || n1.ownerElement, n2Par = n2.parentNode || n2.ownerElement;
      while (n1Par !== n2Par) {
        n1 = n1Par;
        n2 = n2Par;
        n1Par = n1.parentNode || n1.ownerElement;
        n2Par = n2.parentNode || n2.ownerElement;
      }
      var n1isAttr = isAttributeLike(n1);
      var n2isAttr = isAttributeLike(n2);
      if (n1isAttr && !n2isAttr) {
        return -1;
      }
      if (!n1isAttr && n2isAttr) {
        return 1;
      }
      if (n1.isXPathNamespace) {
        if (n1.nodeValue === XPath.XML_NAMESPACE_URI) {
          return -1;
        }
        if (!n2.isXPathNamespace) {
          return -1;
        }
        if (n2.nodeValue === XPath.XML_NAMESPACE_URI) {
          return 1;
        }
      } else if (n2.isXPathNamespace) {
        return 1;
      }
      if (n1Par) {
        var cn = n1isAttr ? n1Par.attributes : n1Par.childNodes;
        var len = cn.length;
        var n1Compare = n1.baseNode || n1;
        var n2Compare = n2.baseNode || n2;
        for (var i = 0; i < len; i += 1) {
          var n = cn[i];
          if (n === n1Compare) {
            return -1;
          }
          if (n === n2Compare) {
            return 1;
          }
        }
      }
      throw new Error("Unexpected: could not determine node order");
    }
    AVLTree.prototype.add = function(n) {
      if (n === this.node) {
        return false;
      }
      var o = nodeOrder(n, this.node);
      var ret = false;
      if (o == -1) {
        if (this.left == null) {
          this.left = new AVLTree(n);
          ret = true;
        } else {
          ret = this.left.add(n);
          if (ret) {
            this.balance();
          }
        }
      } else if (o == 1) {
        if (this.right == null) {
          this.right = new AVLTree(n);
          ret = true;
        } else {
          ret = this.right.add(n);
          if (ret) {
            this.balance();
          }
        }
      }
      if (ret) {
        this.getDepthFromChildren();
      }
      return ret;
    };
    XNodeSet.prototype = new Expression();
    XNodeSet.prototype.constructor = XNodeSet;
    XNodeSet.superclass = Expression.prototype;
    function XNodeSet() {
      this.init();
    }
    XNodeSet.prototype.init = function() {
      this.tree = null;
      this.nodes = [];
      this.size = 0;
    };
    XNodeSet.prototype.toString = function() {
      var p = this.first();
      if (p == null) {
        return "";
      }
      return this.stringForNode(p);
    };
    XNodeSet.prototype.evaluate = function(c) {
      return this;
    };
    XNodeSet.prototype.string = function() {
      return new XString(this.toString());
    };
    XNodeSet.prototype.stringValue = function() {
      return this.toString();
    };
    XNodeSet.prototype.number = function() {
      return new XNumber(this.string());
    };
    XNodeSet.prototype.numberValue = function() {
      return Number(this.string());
    };
    XNodeSet.prototype.bool = function() {
      return new XBoolean(this.booleanValue());
    };
    XNodeSet.prototype.booleanValue = function() {
      return !!this.size;
    };
    XNodeSet.prototype.nodeset = function() {
      return this;
    };
    XNodeSet.prototype.stringForNode = function(n) {
      if (n.nodeType == NodeTypes.DOCUMENT_NODE || n.nodeType == NodeTypes.ELEMENT_NODE || n.nodeType === NodeTypes.DOCUMENT_FRAGMENT_NODE) {
        return this.stringForContainerNode(n);
      }
      if (n.nodeType === NodeTypes.ATTRIBUTE_NODE) {
        return n.value || n.nodeValue;
      }
      if (n.isNamespaceNode) {
        return n.namespace;
      }
      return n.nodeValue;
    };
    XNodeSet.prototype.stringForContainerNode = function(n) {
      var s = "";
      for (var n2 = n.firstChild; n2 != null; n2 = n2.nextSibling) {
        var nt = n2.nodeType;
        if (nt === 1 || nt === 3 || nt === 4 || nt === 9 || nt === 11) {
          s += this.stringForNode(n2);
        }
      }
      return s;
    };
    XNodeSet.prototype.buildTree = function() {
      if (!this.tree && this.nodes.length) {
        this.tree = new AVLTree(this.nodes[0]);
        for (var i = 1; i < this.nodes.length; i += 1) {
          this.tree.add(this.nodes[i]);
        }
      }
      return this.tree;
    };
    XNodeSet.prototype.first = function() {
      var p = this.buildTree();
      if (p == null) {
        return null;
      }
      while (p.left != null) {
        p = p.left;
      }
      return p.node;
    };
    XNodeSet.prototype.add = function(n) {
      for (var i = 0; i < this.nodes.length; i += 1) {
        if (n === this.nodes[i]) {
          return;
        }
      }
      this.tree = null;
      this.nodes.push(n);
      this.size += 1;
    };
    XNodeSet.prototype.addArray = function(ns) {
      var self2 = this;
      forEach(function(x) {
        self2.add(x);
      }, ns);
    };
    XNodeSet.prototype.toArray = function() {
      var a = [];
      this.toArrayRec(this.buildTree(), a);
      return a;
    };
    XNodeSet.prototype.toArrayRec = function(t, a) {
      if (t != null) {
        this.toArrayRec(t.left, a);
        a.push(t.node);
        this.toArrayRec(t.right, a);
      }
    };
    XNodeSet.prototype.toUnsortedArray = function() {
      return this.nodes.slice();
    };
    XNodeSet.prototype.compareWithString = function(r, o) {
      var a = this.toUnsortedArray();
      for (var i = 0; i < a.length; i++) {
        var n = a[i];
        var l = new XString(this.stringForNode(n));
        var res = o(l, r);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.prototype.compareWithNumber = function(r, o) {
      var a = this.toUnsortedArray();
      for (var i = 0; i < a.length; i++) {
        var n = a[i];
        var l = new XNumber(this.stringForNode(n));
        var res = o(l, r);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.prototype.compareWithBoolean = function(r, o) {
      return o(this.bool(), r);
    };
    XNodeSet.prototype.compareWithNodeSet = function(r, o) {
      var arr = this.toUnsortedArray();
      var oInvert = function(lop, rop) {
        return o(rop, lop);
      };
      for (var i = 0; i < arr.length; i++) {
        var l = new XString(this.stringForNode(arr[i]));
        var res = r.compareWithString(l, oInvert);
        if (res.booleanValue()) {
          return res;
        }
      }
      return new XBoolean(false);
    };
    XNodeSet.compareWith = curry(function(o, r) {
      if (Utilities.instance_of(r, XString)) {
        return this.compareWithString(r, o);
      }
      if (Utilities.instance_of(r, XNumber)) {
        return this.compareWithNumber(r, o);
      }
      if (Utilities.instance_of(r, XBoolean)) {
        return this.compareWithBoolean(r, o);
      }
      return this.compareWithNodeSet(r, o);
    });
    XNodeSet.prototype.equals = XNodeSet.compareWith(Operators.equals);
    XNodeSet.prototype.notequal = XNodeSet.compareWith(Operators.notequal);
    XNodeSet.prototype.lessthan = XNodeSet.compareWith(Operators.lessthan);
    XNodeSet.prototype.greaterthan = XNodeSet.compareWith(Operators.greaterthan);
    XNodeSet.prototype.lessthanorequal = XNodeSet.compareWith(Operators.lessthanorequal);
    XNodeSet.prototype.greaterthanorequal = XNodeSet.compareWith(Operators.greaterthanorequal);
    XNodeSet.prototype.union = function(r) {
      var ns = new XNodeSet();
      ns.addArray(this.toUnsortedArray());
      ns.addArray(r.toUnsortedArray());
      return ns;
    };
    XPathNamespace.prototype = new Object();
    XPathNamespace.prototype.constructor = XPathNamespace;
    XPathNamespace.superclass = Object.prototype;
    function XPathNamespace(pre, node, uri, p) {
      this.isXPathNamespace = true;
      this.baseNode = node;
      this.ownerDocument = p.ownerDocument;
      this.nodeName = pre;
      this.prefix = pre;
      this.localName = pre;
      this.namespaceURI = null;
      this.nodeValue = uri;
      this.ownerElement = p;
      this.nodeType = NodeTypes.NAMESPACE_NODE;
    }
    XPathNamespace.prototype.toString = function() {
      return '{ "' + this.prefix + '", "' + this.namespaceURI + '" }';
    };
    XPathContext.prototype = new Object();
    XPathContext.prototype.constructor = XPathContext;
    XPathContext.superclass = Object.prototype;
    function XPathContext(vr, nr, fr) {
      this.variableResolver = vr != null ? vr : new VariableResolver();
      this.namespaceResolver = nr != null ? nr : new NamespaceResolver();
      this.functionResolver = fr != null ? fr : new FunctionResolver();
    }
    XPathContext.prototype.extend = function(newProps) {
      return assign2(new XPathContext(), this, newProps);
    };
    VariableResolver.prototype = new Object();
    VariableResolver.prototype.constructor = VariableResolver;
    VariableResolver.superclass = Object.prototype;
    function VariableResolver() {
    }
    VariableResolver.prototype.getVariable = function(ln, ns) {
      return null;
    };
    FunctionResolver.prototype = new Object();
    FunctionResolver.prototype.constructor = FunctionResolver;
    FunctionResolver.superclass = Object.prototype;
    function FunctionResolver(thisArg) {
      this.thisArg = thisArg != null ? thisArg : Functions;
      this.functions = new Object();
      this.addStandardFunctions();
    }
    FunctionResolver.prototype.addStandardFunctions = function() {
      this.functions["{}last"] = Functions.last;
      this.functions["{}position"] = Functions.position;
      this.functions["{}count"] = Functions.count;
      this.functions["{}id"] = Functions.id;
      this.functions["{}local-name"] = Functions.localName;
      this.functions["{}namespace-uri"] = Functions.namespaceURI;
      this.functions["{}name"] = Functions.name;
      this.functions["{}string"] = Functions.string;
      this.functions["{}concat"] = Functions.concat;
      this.functions["{}starts-with"] = Functions.startsWith;
      this.functions["{}contains"] = Functions.contains;
      this.functions["{}substring-before"] = Functions.substringBefore;
      this.functions["{}substring-after"] = Functions.substringAfter;
      this.functions["{}substring"] = Functions.substring;
      this.functions["{}string-length"] = Functions.stringLength;
      this.functions["{}normalize-space"] = Functions.normalizeSpace;
      this.functions["{}translate"] = Functions.translate;
      this.functions["{}boolean"] = Functions.boolean_;
      this.functions["{}not"] = Functions.not;
      this.functions["{}true"] = Functions.true_;
      this.functions["{}false"] = Functions.false_;
      this.functions["{}lang"] = Functions.lang;
      this.functions["{}number"] = Functions.number;
      this.functions["{}sum"] = Functions.sum;
      this.functions["{}floor"] = Functions.floor;
      this.functions["{}ceiling"] = Functions.ceiling;
      this.functions["{}round"] = Functions.round;
    };
    FunctionResolver.prototype.addFunction = function(ns, ln, f) {
      this.functions["{" + ns + "}" + ln] = f;
    };
    FunctionResolver.getFunctionFromContext = function(qName, context) {
      var parts = Utilities.resolveQName(qName, context.namespaceResolver, context.contextNode, false);
      if (parts[0] === null) {
        throw new Error("Cannot resolve QName " + name);
      }
      return context.functionResolver.getFunction(parts[1], parts[0]);
    };
    FunctionResolver.prototype.getFunction = function(localName, namespace) {
      return this.functions["{" + namespace + "}" + localName];
    };
    NamespaceResolver.prototype = new Object();
    NamespaceResolver.prototype.constructor = NamespaceResolver;
    NamespaceResolver.superclass = Object.prototype;
    function NamespaceResolver() {
    }
    NamespaceResolver.prototype.getNamespace = function(prefix, n) {
      if (prefix == "xml") {
        return XPath.XML_NAMESPACE_URI;
      } else if (prefix == "xmlns") {
        return XPath.XMLNS_NAMESPACE_URI;
      }
      if (n.nodeType == NodeTypes.DOCUMENT_NODE) {
        n = n.documentElement;
      } else if (n.nodeType == NodeTypes.ATTRIBUTE_NODE) {
        n = PathExpr.getOwnerElement(n);
      } else if (n.nodeType != NodeTypes.ELEMENT_NODE) {
        n = n.parentNode;
      }
      while (n != null && n.nodeType == NodeTypes.ELEMENT_NODE) {
        var nnm = n.attributes;
        for (var i = 0; i < nnm.length; i++) {
          var a = nnm.item(i);
          var aname = a.name || a.nodeName;
          if (aname === "xmlns" && prefix === "" || aname === "xmlns:" + prefix) {
            return String(a.value || a.nodeValue);
          }
        }
        n = n.parentNode;
      }
      return null;
    };
    var Functions = new Object();
    Functions.last = function(c) {
      if (arguments.length != 1) {
        throw new Error("Function last expects ()");
      }
      return new XNumber(c.contextSize);
    };
    Functions.position = function(c) {
      if (arguments.length != 1) {
        throw new Error("Function position expects ()");
      }
      return new XNumber(c.contextPosition);
    };
    Functions.count = function() {
      var c = arguments[0];
      var ns;
      if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
        throw new Error("Function count expects (node-set)");
      }
      return new XNumber(ns.size);
    };
    Functions.id = function() {
      var c = arguments[0];
      var id;
      if (arguments.length != 2) {
        throw new Error("Function id expects (object)");
      }
      id = arguments[1].evaluate(c);
      if (Utilities.instance_of(id, XNodeSet)) {
        id = id.toArray().join(" ");
      } else {
        id = id.stringValue();
      }
      var ids = id.split(/[\x0d\x0a\x09\x20]+/);
      var count = 0;
      var ns = new XNodeSet();
      var doc = c.contextNode.nodeType == NodeTypes.DOCUMENT_NODE ? c.contextNode : c.contextNode.ownerDocument;
      for (var i = 0; i < ids.length; i++) {
        var n;
        if (doc.getElementById) {
          n = doc.getElementById(ids[i]);
        } else {
          n = Utilities.getElementById(doc, ids[i]);
        }
        if (n != null) {
          ns.add(n);
          count++;
        }
      }
      return ns;
    };
    Functions.localName = function(c, eNode) {
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = eNode.evaluate(c).first();
      } else {
        throw new Error("Function local-name expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      return new XString(
        n.localName || //  standard elements and attributes
        n.baseName || //  IE
        n.target || //  processing instructions
        n.nodeName || //  DOM1 elements
        ""
        //  fallback
      );
    };
    Functions.namespaceURI = function() {
      var c = arguments[0];
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = arguments[1].evaluate(c).first();
      } else {
        throw new Error("Function namespace-uri expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      return new XString(n.namespaceURI || "");
    };
    Functions.name = function() {
      var c = arguments[0];
      var n;
      if (arguments.length == 1) {
        n = c.contextNode;
      } else if (arguments.length == 2) {
        n = arguments[1].evaluate(c).first();
      } else {
        throw new Error("Function name expects (node-set?)");
      }
      if (n == null) {
        return new XString("");
      }
      if (n.nodeType == NodeTypes.ELEMENT_NODE) {
        return new XString(n.nodeName);
      } else if (n.nodeType == NodeTypes.ATTRIBUTE_NODE) {
        return new XString(n.name || n.nodeName);
      } else if (n.nodeType === NodeTypes.PROCESSING_INSTRUCTION_NODE) {
        return new XString(n.target || n.nodeName);
      } else if (n.localName == null) {
        return new XString("");
      } else {
        return new XString(n.localName);
      }
    };
    Functions.string = function() {
      var c = arguments[0];
      if (arguments.length == 1) {
        return new XString(XNodeSet.prototype.stringForNode(c.contextNode));
      } else if (arguments.length == 2) {
        return arguments[1].evaluate(c).string();
      }
      throw new Error("Function string expects (object?)");
    };
    Functions.concat = function(c) {
      if (arguments.length < 3) {
        throw new Error("Function concat expects (string, string[, string]*)");
      }
      var s = "";
      for (var i = 1; i < arguments.length; i++) {
        s += arguments[i].evaluate(c).stringValue();
      }
      return new XString(s);
    };
    Functions.startsWith = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function startsWith expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XBoolean(s1.substring(0, s2.length) == s2);
    };
    Functions.contains = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function contains expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XBoolean(s1.indexOf(s2) !== -1);
    };
    Functions.substringBefore = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function substring-before expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      return new XString(s1.substring(0, s1.indexOf(s2)));
    };
    Functions.substringAfter = function() {
      var c = arguments[0];
      if (arguments.length != 3) {
        throw new Error("Function substring-after expects (string, string)");
      }
      var s1 = arguments[1].evaluate(c).stringValue();
      var s2 = arguments[2].evaluate(c).stringValue();
      if (s2.length == 0) {
        return new XString(s1);
      }
      var i = s1.indexOf(s2);
      if (i == -1) {
        return new XString("");
      }
      return new XString(s1.substring(i + s2.length));
    };
    Functions.substring = function() {
      var c = arguments[0];
      if (!(arguments.length == 3 || arguments.length == 4)) {
        throw new Error("Function substring expects (string, number, number?)");
      }
      var s = arguments[1].evaluate(c).stringValue();
      var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
      var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : void 0;
      return new XString(s.substring(n1, n2));
    };
    Functions.stringLength = function() {
      var c = arguments[0];
      var s;
      if (arguments.length == 1) {
        s = XNodeSet.prototype.stringForNode(c.contextNode);
      } else if (arguments.length == 2) {
        s = arguments[1].evaluate(c).stringValue();
      } else {
        throw new Error("Function string-length expects (string?)");
      }
      return new XNumber(s.length);
    };
    Functions.normalizeSpace = function() {
      var c = arguments[0];
      var s;
      if (arguments.length == 1) {
        s = XNodeSet.prototype.stringForNode(c.contextNode);
      } else if (arguments.length == 2) {
        s = arguments[1].evaluate(c).stringValue();
      } else {
        throw new Error("Function normalize-space expects (string?)");
      }
      var i = 0;
      var j = s.length - 1;
      while (Utilities.isSpace(s.charCodeAt(j))) {
        j--;
      }
      var t = "";
      while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
        i++;
      }
      while (i <= j) {
        if (Utilities.isSpace(s.charCodeAt(i))) {
          t += " ";
          while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
            i++;
          }
        } else {
          t += s.charAt(i);
          i++;
        }
      }
      return new XString(t);
    };
    Functions.translate = function(c, eValue, eFrom, eTo) {
      if (arguments.length != 4) {
        throw new Error("Function translate expects (string, string, string)");
      }
      var value = eValue.evaluate(c).stringValue();
      var from = eFrom.evaluate(c).stringValue();
      var to = eTo.evaluate(c).stringValue();
      var cMap = reduce(function(acc, ch, i) {
        if (!(ch in acc)) {
          acc[ch] = i > to.length ? "" : to[i];
        }
        return acc;
      }, {}, from);
      var t = join(
        "",
        map(function(ch) {
          return ch in cMap ? cMap[ch] : ch;
        }, value)
      );
      return new XString(t);
    };
    Functions.boolean_ = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function boolean expects (object)");
      }
      return arguments[1].evaluate(c).bool();
    };
    Functions.not = function(c, eValue) {
      if (arguments.length != 2) {
        throw new Error("Function not expects (object)");
      }
      return eValue.evaluate(c).bool().not();
    };
    Functions.true_ = function() {
      if (arguments.length != 1) {
        throw new Error("Function true expects ()");
      }
      return XBoolean.true_;
    };
    Functions.false_ = function() {
      if (arguments.length != 1) {
        throw new Error("Function false expects ()");
      }
      return XBoolean.false_;
    };
    Functions.lang = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function lang expects (string)");
      }
      var lang;
      for (var n = c.contextNode; n != null && n.nodeType != NodeTypes.DOCUMENT_NODE; n = n.parentNode) {
        var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
        if (a != null) {
          lang = String(a);
          break;
        }
      }
      if (lang == null) {
        return XBoolean.false_;
      }
      var s = arguments[1].evaluate(c).stringValue();
      return new XBoolean(lang.substring(0, s.length) == s && (lang.length == s.length || lang.charAt(s.length) == "-"));
    };
    Functions.number = function() {
      var c = arguments[0];
      if (!(arguments.length == 1 || arguments.length == 2)) {
        throw new Error("Function number expects (object?)");
      }
      if (arguments.length == 1) {
        return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
      }
      return arguments[1].evaluate(c).number();
    };
    Functions.sum = function() {
      var c = arguments[0];
      var ns;
      if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
        throw new Error("Function sum expects (node-set)");
      }
      ns = ns.toUnsortedArray();
      var n = 0;
      for (var i = 0; i < ns.length; i++) {
        n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
      }
      return new XNumber(n);
    };
    Functions.floor = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function floor expects (number)");
      }
      return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
    };
    Functions.ceiling = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function ceiling expects (number)");
      }
      return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
    };
    Functions.round = function() {
      var c = arguments[0];
      if (arguments.length != 2) {
        throw new Error("Function round expects (number)");
      }
      return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
    };
    var Utilities = new Object();
    var isAttributeLike = function(val) {
      return val && (val.nodeType === NodeTypes.ATTRIBUTE_NODE || val.ownerElement || val.isXPathNamespace);
    };
    Utilities.splitQName = function(qn) {
      var i = qn.indexOf(":");
      if (i == -1) {
        return [null, qn];
      }
      return [qn.substring(0, i), qn.substring(i + 1)];
    };
    Utilities.resolveQName = function(qn, nr, n, useDefault) {
      var parts = Utilities.splitQName(qn);
      if (parts[0] != null) {
        parts[0] = nr.getNamespace(parts[0], n);
      } else {
        if (useDefault) {
          parts[0] = nr.getNamespace("", n);
          if (parts[0] == null) {
            parts[0] = "";
          }
        } else {
          parts[0] = "";
        }
      }
      return parts;
    };
    Utilities.isSpace = function(c) {
      return c == 9 || c == 13 || c == 10 || c == 32;
    };
    Utilities.isLetter = function(c) {
      return c >= 65 && c <= 90 || c >= 97 && c <= 122 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 255 || c >= 256 && c <= 305 || c >= 308 && c <= 318 || c >= 321 && c <= 328 || c >= 330 && c <= 382 || c >= 384 && c <= 451 || c >= 461 && c <= 496 || c >= 500 && c <= 501 || c >= 506 && c <= 535 || c >= 592 && c <= 680 || c >= 699 && c <= 705 || c == 902 || c >= 904 && c <= 906 || c == 908 || c >= 910 && c <= 929 || c >= 931 && c <= 974 || c >= 976 && c <= 982 || c == 986 || c == 988 || c == 990 || c == 992 || c >= 994 && c <= 1011 || c >= 1025 && c <= 1036 || c >= 1038 && c <= 1103 || c >= 1105 && c <= 1116 || c >= 1118 && c <= 1153 || c >= 1168 && c <= 1220 || c >= 1223 && c <= 1224 || c >= 1227 && c <= 1228 || c >= 1232 && c <= 1259 || c >= 1262 && c <= 1269 || c >= 1272 && c <= 1273 || c >= 1329 && c <= 1366 || c == 1369 || c >= 1377 && c <= 1414 || c >= 1488 && c <= 1514 || c >= 1520 && c <= 1522 || c >= 1569 && c <= 1594 || c >= 1601 && c <= 1610 || c >= 1649 && c <= 1719 || c >= 1722 && c <= 1726 || c >= 1728 && c <= 1742 || c >= 1744 && c <= 1747 || c == 1749 || c >= 1765 && c <= 1766 || c >= 2309 && c <= 2361 || c == 2365 || c >= 2392 && c <= 2401 || c >= 2437 && c <= 2444 || c >= 2447 && c <= 2448 || c >= 2451 && c <= 2472 || c >= 2474 && c <= 2480 || c == 2482 || c >= 2486 && c <= 2489 || c >= 2524 && c <= 2525 || c >= 2527 && c <= 2529 || c >= 2544 && c <= 2545 || c >= 2565 && c <= 2570 || c >= 2575 && c <= 2576 || c >= 2579 && c <= 2600 || c >= 2602 && c <= 2608 || c >= 2610 && c <= 2611 || c >= 2613 && c <= 2614 || c >= 2616 && c <= 2617 || c >= 2649 && c <= 2652 || c == 2654 || c >= 2674 && c <= 2676 || c >= 2693 && c <= 2699 || c == 2701 || c >= 2703 && c <= 2705 || c >= 2707 && c <= 2728 || c >= 2730 && c <= 2736 || c >= 2738 && c <= 2739 || c >= 2741 && c <= 2745 || c == 2749 || c == 2784 || c >= 2821 && c <= 2828 || c >= 2831 && c <= 2832 || c >= 2835 && c <= 2856 || c >= 2858 && c <= 2864 || c >= 2866 && c <= 2867 || c >= 2870 && c <= 2873 || c == 2877 || c >= 2908 && c <= 2909 || c >= 2911 && c <= 2913 || c >= 2949 && c <= 2954 || c >= 2958 && c <= 2960 || c >= 2962 && c <= 2965 || c >= 2969 && c <= 2970 || c == 2972 || c >= 2974 && c <= 2975 || c >= 2979 && c <= 2980 || c >= 2984 && c <= 2986 || c >= 2990 && c <= 2997 || c >= 2999 && c <= 3001 || c >= 3077 && c <= 3084 || c >= 3086 && c <= 3088 || c >= 3090 && c <= 3112 || c >= 3114 && c <= 3123 || c >= 3125 && c <= 3129 || c >= 3168 && c <= 3169 || c >= 3205 && c <= 3212 || c >= 3214 && c <= 3216 || c >= 3218 && c <= 3240 || c >= 3242 && c <= 3251 || c >= 3253 && c <= 3257 || c == 3294 || c >= 3296 && c <= 3297 || c >= 3333 && c <= 3340 || c >= 3342 && c <= 3344 || c >= 3346 && c <= 3368 || c >= 3370 && c <= 3385 || c >= 3424 && c <= 3425 || c >= 3585 && c <= 3630 || c == 3632 || c >= 3634 && c <= 3635 || c >= 3648 && c <= 3653 || c >= 3713 && c <= 3714 || c == 3716 || c >= 3719 && c <= 3720 || c == 3722 || c == 3725 || c >= 3732 && c <= 3735 || c >= 3737 && c <= 3743 || c >= 3745 && c <= 3747 || c == 3749 || c == 3751 || c >= 3754 && c <= 3755 || c >= 3757 && c <= 3758 || c == 3760 || c >= 3762 && c <= 3763 || c == 3773 || c >= 3776 && c <= 3780 || c >= 3904 && c <= 3911 || c >= 3913 && c <= 3945 || c >= 4256 && c <= 4293 || c >= 4304 && c <= 4342 || c == 4352 || c >= 4354 && c <= 4355 || c >= 4357 && c <= 4359 || c == 4361 || c >= 4363 && c <= 4364 || c >= 4366 && c <= 4370 || c == 4412 || c == 4414 || c == 4416 || c == 4428 || c == 4430 || c == 4432 || c >= 4436 && c <= 4437 || c == 4441 || c >= 4447 && c <= 4449 || c == 4451 || c == 4453 || c == 4455 || c == 4457 || c >= 4461 && c <= 4462 || c >= 4466 && c <= 4467 || c == 4469 || c == 4510 || c == 4520 || c == 4523 || c >= 4526 && c <= 4527 || c >= 4535 && c <= 4536 || c == 4538 || c >= 4540 && c <= 4546 || c == 4587 || c == 4592 || c == 4601 || c >= 7680 && c <= 7835 || c >= 7840 && c <= 7929 || c >= 7936 && c <= 7957 || c >= 7960 && c <= 7965 || c >= 7968 && c <= 8005 || c >= 8008 && c <= 8013 || c >= 8016 && c <= 8023 || c == 8025 || c == 8027 || c == 8029 || c >= 8031 && c <= 8061 || c >= 8064 && c <= 8116 || c >= 8118 && c <= 8124 || c == 8126 || c >= 8130 && c <= 8132 || c >= 8134 && c <= 8140 || c >= 8144 && c <= 8147 || c >= 8150 && c <= 8155 || c >= 8160 && c <= 8172 || c >= 8178 && c <= 8180 || c >= 8182 && c <= 8188 || c == 8486 || c >= 8490 && c <= 8491 || c == 8494 || c >= 8576 && c <= 8578 || c >= 12353 && c <= 12436 || c >= 12449 && c <= 12538 || c >= 12549 && c <= 12588 || c >= 44032 && c <= 55203 || c >= 19968 && c <= 40869 || c == 12295 || c >= 12321 && c <= 12329;
    };
    Utilities.isNCNameChar = function(c) {
      return c >= 48 && c <= 57 || c >= 1632 && c <= 1641 || c >= 1776 && c <= 1785 || c >= 2406 && c <= 2415 || c >= 2534 && c <= 2543 || c >= 2662 && c <= 2671 || c >= 2790 && c <= 2799 || c >= 2918 && c <= 2927 || c >= 3047 && c <= 3055 || c >= 3174 && c <= 3183 || c >= 3302 && c <= 3311 || c >= 3430 && c <= 3439 || c >= 3664 && c <= 3673 || c >= 3792 && c <= 3801 || c >= 3872 && c <= 3881 || c == 46 || c == 45 || c == 95 || Utilities.isLetter(c) || c >= 768 && c <= 837 || c >= 864 && c <= 865 || c >= 1155 && c <= 1158 || c >= 1425 && c <= 1441 || c >= 1443 && c <= 1465 || c >= 1467 && c <= 1469 || c == 1471 || c >= 1473 && c <= 1474 || c == 1476 || c >= 1611 && c <= 1618 || c == 1648 || c >= 1750 && c <= 1756 || c >= 1757 && c <= 1759 || c >= 1760 && c <= 1764 || c >= 1767 && c <= 1768 || c >= 1770 && c <= 1773 || c >= 2305 && c <= 2307 || c == 2364 || c >= 2366 && c <= 2380 || c == 2381 || c >= 2385 && c <= 2388 || c >= 2402 && c <= 2403 || c >= 2433 && c <= 2435 || c == 2492 || c == 2494 || c == 2495 || c >= 2496 && c <= 2500 || c >= 2503 && c <= 2504 || c >= 2507 && c <= 2509 || c == 2519 || c >= 2530 && c <= 2531 || c == 2562 || c == 2620 || c == 2622 || c == 2623 || c >= 2624 && c <= 2626 || c >= 2631 && c <= 2632 || c >= 2635 && c <= 2637 || c >= 2672 && c <= 2673 || c >= 2689 && c <= 2691 || c == 2748 || c >= 2750 && c <= 2757 || c >= 2759 && c <= 2761 || c >= 2763 && c <= 2765 || c >= 2817 && c <= 2819 || c == 2876 || c >= 2878 && c <= 2883 || c >= 2887 && c <= 2888 || c >= 2891 && c <= 2893 || c >= 2902 && c <= 2903 || c >= 2946 && c <= 2947 || c >= 3006 && c <= 3010 || c >= 3014 && c <= 3016 || c >= 3018 && c <= 3021 || c == 3031 || c >= 3073 && c <= 3075 || c >= 3134 && c <= 3140 || c >= 3142 && c <= 3144 || c >= 3146 && c <= 3149 || c >= 3157 && c <= 3158 || c >= 3202 && c <= 3203 || c >= 3262 && c <= 3268 || c >= 3270 && c <= 3272 || c >= 3274 && c <= 3277 || c >= 3285 && c <= 3286 || c >= 3330 && c <= 3331 || c >= 3390 && c <= 3395 || c >= 3398 && c <= 3400 || c >= 3402 && c <= 3405 || c == 3415 || c == 3633 || c >= 3636 && c <= 3642 || c >= 3655 && c <= 3662 || c == 3761 || c >= 3764 && c <= 3769 || c >= 3771 && c <= 3772 || c >= 3784 && c <= 3789 || c >= 3864 && c <= 3865 || c == 3893 || c == 3895 || c == 3897 || c == 3902 || c == 3903 || c >= 3953 && c <= 3972 || c >= 3974 && c <= 3979 || c >= 3984 && c <= 3989 || c == 3991 || c >= 3993 && c <= 4013 || c >= 4017 && c <= 4023 || c == 4025 || c >= 8400 && c <= 8412 || c == 8417 || c >= 12330 && c <= 12335 || c == 12441 || c == 12442 || c == 183 || c == 720 || c == 721 || c == 903 || c == 1600 || c == 3654 || c == 3782 || c == 12293 || c >= 12337 && c <= 12341 || c >= 12445 && c <= 12446 || c >= 12540 && c <= 12542;
    };
    Utilities.coalesceText = function(n) {
      for (var m = n.firstChild; m != null; m = m.nextSibling) {
        if (m.nodeType == NodeTypes.TEXT_NODE || m.nodeType == NodeTypes.CDATA_SECTION_NODE) {
          var s = m.nodeValue;
          var first = m;
          m = m.nextSibling;
          while (m != null && (m.nodeType == NodeTypes.TEXT_NODE || m.nodeType == NodeTypes.CDATA_SECTION_NODE)) {
            s += m.nodeValue;
            var del = m;
            m = m.nextSibling;
            del.parentNode.removeChild(del);
          }
          if (first.nodeType == NodeTypes.CDATA_SECTION_NODE) {
            var p = first.parentNode;
            if (first.nextSibling == null) {
              p.removeChild(first);
              p.appendChild(p.ownerDocument.createTextNode(s));
            } else {
              var next = first.nextSibling;
              p.removeChild(first);
              p.insertBefore(p.ownerDocument.createTextNode(s), next);
            }
          } else {
            first.nodeValue = s;
          }
          if (m == null) {
            break;
          }
        } else if (m.nodeType == NodeTypes.ELEMENT_NODE) {
          Utilities.coalesceText(m);
        }
      }
    };
    Utilities.instance_of = function(o, c) {
      while (o != null) {
        if (o.constructor === c) {
          return true;
        }
        if (o === Object) {
          return false;
        }
        o = o.constructor.superclass;
      }
      return false;
    };
    Utilities.getElementById = function(n, id) {
      if (n.nodeType == NodeTypes.ELEMENT_NODE) {
        if (n.getAttribute("id") == id || n.getAttributeNS(null, "id") == id) {
          return n;
        }
      }
      for (var m = n.firstChild; m != null; m = m.nextSibling) {
        var res = Utilities.getElementById(m, id);
        if (res != null) {
          return res;
        }
      }
      return null;
    };
    var XPathException = function() {
      function getMessage(code, exception) {
        var msg = exception ? ": " + exception.toString() : "";
        switch (code) {
          case XPathException2.INVALID_EXPRESSION_ERR:
            return "Invalid expression" + msg;
          case XPathException2.TYPE_ERR:
            return "Type error" + msg;
        }
        return null;
      }
      function XPathException2(code, error, message) {
        var err = Error.call(this, getMessage(code, error) || message);
        err.code = code;
        err.exception = error;
        return err;
      }
      XPathException2.prototype = Object.create(Error.prototype);
      XPathException2.prototype.constructor = XPathException2;
      XPathException2.superclass = Error;
      XPathException2.prototype.toString = function() {
        return this.message;
      };
      XPathException2.fromMessage = function(message, error) {
        return new XPathException2(null, error, message);
      };
      XPathException2.INVALID_EXPRESSION_ERR = 51;
      XPathException2.TYPE_ERR = 52;
      return XPathException2;
    }();
    XPathExpression.prototype = {};
    XPathExpression.prototype.constructor = XPathExpression;
    XPathExpression.superclass = Object.prototype;
    function XPathExpression(e, r, p) {
      this.xpath = p.parse(e);
      this.context = new XPathContext();
      this.context.namespaceResolver = new XPathNSResolverWrapper(r);
    }
    XPathExpression.getOwnerDocument = function(n) {
      return n.nodeType === NodeTypes.DOCUMENT_NODE ? n : n.ownerDocument;
    };
    XPathExpression.detectHtmlDom = function(n) {
      if (!n) {
        return false;
      }
      var doc = XPathExpression.getOwnerDocument(n);
      try {
        return doc.implementation.hasFeature("HTML", "2.0");
      } catch (e) {
        return true;
      }
    };
    XPathExpression.prototype.evaluate = function(n, t, res) {
      this.context.expressionContextNode = n;
      this.context.caseInsensitive = XPathExpression.detectHtmlDom(n);
      var result = this.xpath.evaluate(this.context);
      return new XPathResult(result, t);
    };
    XPathNSResolverWrapper.prototype = {};
    XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
    XPathNSResolverWrapper.superclass = Object.prototype;
    function XPathNSResolverWrapper(r) {
      this.xpathNSResolver = r;
    }
    XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
      if (this.xpathNSResolver == null) {
        return null;
      }
      return this.xpathNSResolver.lookupNamespaceURI(prefix);
    };
    NodeXPathNSResolver.prototype = {};
    NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
    NodeXPathNSResolver.superclass = Object.prototype;
    function NodeXPathNSResolver(n) {
      this.node = n;
      this.namespaceResolver = new NamespaceResolver();
    }
    NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
      return this.namespaceResolver.getNamespace(prefix, this.node);
    };
    XPathResult.prototype = {};
    XPathResult.prototype.constructor = XPathResult;
    XPathResult.superclass = Object.prototype;
    function XPathResult(v, t) {
      if (t == XPathResult.ANY_TYPE) {
        if (v.constructor === XString) {
          t = XPathResult.STRING_TYPE;
        } else if (v.constructor === XNumber) {
          t = XPathResult.NUMBER_TYPE;
        } else if (v.constructor === XBoolean) {
          t = XPathResult.BOOLEAN_TYPE;
        } else if (v.constructor === XNodeSet) {
          t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
        }
      }
      this.resultType = t;
      switch (t) {
        case XPathResult.NUMBER_TYPE:
          this.numberValue = v.numberValue();
          return;
        case XPathResult.STRING_TYPE:
          this.stringValue = v.stringValue();
          return;
        case XPathResult.BOOLEAN_TYPE:
          this.booleanValue = v.booleanValue();
          return;
        case XPathResult.ANY_UNORDERED_NODE_TYPE:
        case XPathResult.FIRST_ORDERED_NODE_TYPE:
          if (v.constructor === XNodeSet) {
            this.singleNodeValue = v.first();
            return;
          }
          break;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
          if (v.constructor === XNodeSet) {
            this.invalidIteratorState = false;
            this.nodes = v.toArray();
            this.iteratorIndex = 0;
            return;
          }
          break;
        case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
        case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
          if (v.constructor === XNodeSet) {
            this.nodes = v.toArray();
            this.snapshotLength = this.nodes.length;
            return;
          }
          break;
      }
      throw new XPathException(XPathException.TYPE_ERR);
    }
    ;
    XPathResult.prototype.iterateNext = function() {
      if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE && this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
        throw new XPathException(XPathException.TYPE_ERR);
      }
      return this.nodes[this.iteratorIndex++];
    };
    XPathResult.prototype.snapshotItem = function(i) {
      if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE && this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
        throw new XPathException(XPathException.TYPE_ERR);
      }
      return this.nodes[i];
    };
    XPathResult.ANY_TYPE = 0;
    XPathResult.NUMBER_TYPE = 1;
    XPathResult.STRING_TYPE = 2;
    XPathResult.BOOLEAN_TYPE = 3;
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
    XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
    XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
    XPathResult.FIRST_ORDERED_NODE_TYPE = 9;
    function installDOM3XPathSupport(doc, p) {
      doc.createExpression = function(e, r) {
        try {
          return new XPathExpression(e, r, p);
        } catch (e2) {
          throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e2);
        }
      };
      doc.createNSResolver = function(n) {
        return new NodeXPathNSResolver(n);
      };
      doc.evaluate = function(e, cn, r, t, res) {
        if (t < 0 || t > 9) {
          throw { code: 0, toString: function() {
            return "Request type not supported";
          } };
        }
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
      };
    }
    ;
    try {
      var shouldInstall = true;
      try {
        if (document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XPath", null)) {
          shouldInstall = false;
        }
      } catch (e) {
      }
      if (shouldInstall) {
        installDOM3XPathSupport(document, new XPathParser());
      }
    } catch (e) {
    }
    installDOM3XPathSupport(exports2, new XPathParser());
    (function() {
      var parser = new XPathParser();
      var defaultNSResolver = new NamespaceResolver();
      var defaultFunctionResolver = new FunctionResolver();
      var defaultVariableResolver = new VariableResolver();
      function makeNSResolverFromFunction(func) {
        return {
          getNamespace: function(prefix, node) {
            var ns = func(prefix, node);
            return ns || defaultNSResolver.getNamespace(prefix, node);
          }
        };
      }
      function makeNSResolverFromObject(obj) {
        return makeNSResolverFromFunction(obj.getNamespace.bind(obj));
      }
      function makeNSResolverFromMap(map2) {
        return makeNSResolverFromFunction(function(prefix) {
          return map2[prefix];
        });
      }
      function makeNSResolver(resolver) {
        if (resolver && typeof resolver.getNamespace === "function") {
          return makeNSResolverFromObject(resolver);
        }
        if (typeof resolver === "function") {
          return makeNSResolverFromFunction(resolver);
        }
        if (typeof resolver === "object") {
          return makeNSResolverFromMap(resolver);
        }
        return defaultNSResolver;
      }
      function convertValue(value) {
        if (value === null || typeof value === "undefined" || value instanceof XString || value instanceof XBoolean || value instanceof XNumber || value instanceof XNodeSet) {
          return value;
        }
        switch (typeof value) {
          case "string":
            return new XString(value);
          case "boolean":
            return new XBoolean(value);
          case "number":
            return new XNumber(value);
        }
        var ns = new XNodeSet();
        ns.addArray([].concat(value));
        return ns;
      }
      function makeEvaluator(func) {
        return function(context) {
          var args = Array.prototype.slice.call(arguments, 1).map(function(arg) {
            return arg.evaluate(context);
          });
          var result = func.apply(this, [].concat(context, args));
          return convertValue(result);
        };
      }
      function makeFunctionResolverFromFunction(func) {
        return {
          getFunction: function(name2, namespace) {
            var found = func(name2, namespace);
            if (found) {
              return makeEvaluator(found);
            }
            return defaultFunctionResolver.getFunction(name2, namespace);
          }
        };
      }
      function makeFunctionResolverFromObject(obj) {
        return makeFunctionResolverFromFunction(obj.getFunction.bind(obj));
      }
      function makeFunctionResolverFromMap(map2) {
        return makeFunctionResolverFromFunction(function(name2) {
          return map2[name2];
        });
      }
      function makeFunctionResolver(resolver) {
        if (resolver && typeof resolver.getFunction === "function") {
          return makeFunctionResolverFromObject(resolver);
        }
        if (typeof resolver === "function") {
          return makeFunctionResolverFromFunction(resolver);
        }
        if (typeof resolver === "object") {
          return makeFunctionResolverFromMap(resolver);
        }
        return defaultFunctionResolver;
      }
      function makeVariableResolverFromFunction(func) {
        return {
          getVariable: function(name2, namespace) {
            var value = func(name2, namespace);
            return convertValue(value);
          }
        };
      }
      function makeVariableResolver(resolver) {
        if (resolver) {
          if (typeof resolver.getVariable === "function") {
            return makeVariableResolverFromFunction(resolver.getVariable.bind(resolver));
          }
          if (typeof resolver === "function") {
            return makeVariableResolverFromFunction(resolver);
          }
          if (typeof resolver === "object") {
            return makeVariableResolverFromFunction(function(name2) {
              return resolver[name2];
            });
          }
        }
        return defaultVariableResolver;
      }
      function copyIfPresent(prop, dest, source) {
        if (prop in source) {
          dest[prop] = source[prop];
        }
      }
      function makeContext(options) {
        var context = new XPathContext();
        if (options) {
          context.namespaceResolver = makeNSResolver(options.namespaces);
          context.functionResolver = makeFunctionResolver(options.functions);
          context.variableResolver = makeVariableResolver(options.variables);
          context.expressionContextNode = options.node;
          copyIfPresent("allowAnyNamespaceForNoPrefix", context, options);
          copyIfPresent("isHtml", context, options);
        } else {
          context.namespaceResolver = defaultNSResolver;
        }
        return context;
      }
      function evaluate(parsedExpression, options) {
        var context = makeContext(options);
        return parsedExpression.evaluate(context);
      }
      var evaluatorPrototype = {
        evaluate: function(options) {
          return evaluate(this.expression, options);
        },
        evaluateNumber: function(options) {
          return this.evaluate(options).numberValue();
        },
        evaluateString: function(options) {
          return this.evaluate(options).stringValue();
        },
        evaluateBoolean: function(options) {
          return this.evaluate(options).booleanValue();
        },
        evaluateNodeSet: function(options) {
          return this.evaluate(options).nodeset();
        },
        select: function(options) {
          return this.evaluateNodeSet(options).toArray();
        },
        select1: function(options) {
          return this.select(options)[0];
        }
      };
      function parse2(xpath3) {
        var parsed = parser.parse(xpath3);
        return Object.create(evaluatorPrototype, {
          expression: {
            value: parsed
          }
        });
      }
      exports2.parse = parse2;
    })();
    assign2(
      exports2,
      {
        XPath,
        XPathParser,
        XPathResult,
        Step,
        PathExpr,
        NodeTest,
        LocationPath,
        OrOperation,
        AndOperation,
        BarOperation,
        EqualsOperation,
        NotEqualOperation,
        LessThanOperation,
        GreaterThanOperation,
        LessThanOrEqualOperation,
        GreaterThanOrEqualOperation,
        PlusOperation,
        MinusOperation,
        MultiplyOperation,
        DivOperation,
        ModOperation,
        UnaryMinusOperation,
        FunctionCall,
        VariableReference,
        XPathContext,
        XNodeSet,
        XBoolean,
        XString,
        XNumber,
        NamespaceResolver,
        FunctionResolver,
        VariableResolver,
        Utilities
      }
    );
    exports2.select = function(e, doc, single) {
      return exports2.selectWithResolver(e, doc, null, single);
    };
    exports2.useNamespaces = function(mappings) {
      var resolver = {
        mappings: mappings || {},
        lookupNamespaceURI: function(prefix) {
          return this.mappings[prefix];
        }
      };
      return function(e, doc, single) {
        return exports2.selectWithResolver(e, doc, resolver, single);
      };
    };
    exports2.selectWithResolver = function(e, doc, resolver, single) {
      var expression = new XPathExpression(e, resolver, new XPathParser());
      var type = XPathResult.ANY_TYPE;
      var result = expression.evaluate(doc, type, null);
      if (result.resultType == XPathResult.STRING_TYPE) {
        result = result.stringValue;
      } else if (result.resultType == XPathResult.NUMBER_TYPE) {
        result = result.numberValue;
      } else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
        result = result.booleanValue;
      } else {
        result = result.nodes;
        if (single) {
          result = result[0];
        }
      }
      return result;
    };
    exports2.select1 = function(e, doc) {
      return exports2.select(e, doc, true);
    };
    var isArrayOfNodes = function(value) {
      return Array.isArray(value) && value.every(isNodeLike);
    };
    var isNodeOfType = function(type) {
      return function(value) {
        return isNodeLike(value) && value.nodeType === type;
      };
    };
    assign2(
      exports2,
      {
        isNodeLike,
        isArrayOfNodes,
        isElement: isNodeOfType(NodeTypes.ELEMENT_NODE),
        isAttribute: isNodeOfType(NodeTypes.ATTRIBUTE_NODE),
        isTextNode: isNodeOfType(NodeTypes.TEXT_NODE),
        isCDATASection: isNodeOfType(NodeTypes.CDATA_SECTION_NODE),
        isProcessingInstruction: isNodeOfType(NodeTypes.PROCESSING_INSTRUCTION_NODE),
        isComment: isNodeOfType(NodeTypes.COMMENT_NODE),
        isDocumentNode: isNodeOfType(NodeTypes.DOCUMENT_NODE),
        isDocumentTypeNode: isNodeOfType(NodeTypes.DOCUMENT_TYPE_NODE),
        isDocumentFragment: isNodeOfType(NodeTypes.DOCUMENT_FRAGMENT_NODE)
      }
    );
  })(xpath2);
})(xpath$1);
const xpath = /* @__PURE__ */ getDefaultExportFromCjs(xpath$1);
var lib = {};
var dom$2 = {};
var conventions$2 = {};
"use strict";
function find$1(list, predicate, ac) {
  if (ac === void 0) {
    ac = Array.prototype;
  }
  if (list && typeof ac.find === "function") {
    return ac.find.call(list, predicate);
  }
  for (var i = 0; i < list.length; i++) {
    if (Object.prototype.hasOwnProperty.call(list, i)) {
      var item = list[i];
      if (predicate.call(void 0, item, i, list)) {
        return item;
      }
    }
  }
}
function freeze(object, oc) {
  if (oc === void 0) {
    oc = Object;
  }
  return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
}
function assign(target, source) {
  if (target === null || typeof target !== "object") {
    throw new TypeError("target is not an object");
  }
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
  return target;
}
var MIME_TYPE = freeze({
  /**
   * `text/html`, the only mime type that triggers treating an XML document as HTML.
   *
   * @see DOMParser.SupportedType.isHTML
   * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/HTML Wikipedia
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
   * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
   */
  HTML: "text/html",
  /**
   * Helper method to check a mime type if it indicates an HTML document
   *
   * @param {string} [value]
   * @returns {boolean}
   *
   * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/HTML Wikipedia
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
   * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
  isHTML: function(value) {
    return value === MIME_TYPE.HTML;
  },
  /**
   * `application/xml`, the standard mime type for XML documents.
   *
   * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
   * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
   * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
   */
  XML_APPLICATION: "application/xml",
  /**
   * `text/html`, an alias for `application/xml`.
   *
   * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
   * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
   */
  XML_TEXT: "text/xml",
  /**
   * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
   * but is parsed as an XML document.
   *
   * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
   * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
   */
  XML_XHTML_APPLICATION: "application/xhtml+xml",
  /**
   * `image/svg+xml`,
   *
   * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
   * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
   * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
   */
  XML_SVG_IMAGE: "image/svg+xml"
});
var NAMESPACE$3 = freeze({
  /**
   * The XHTML namespace.
   *
   * @see http://www.w3.org/1999/xhtml
   */
  HTML: "http://www.w3.org/1999/xhtml",
  /**
   * Checks if `uri` equals `NAMESPACE.HTML`.
   *
   * @param {string} [uri]
   *
   * @see NAMESPACE.HTML
   */
  isHTML: function(uri) {
    return uri === NAMESPACE$3.HTML;
  },
  /**
   * The SVG namespace.
   *
   * @see http://www.w3.org/2000/svg
   */
  SVG: "http://www.w3.org/2000/svg",
  /**
   * The `xml:` namespace.
   *
   * @see http://www.w3.org/XML/1998/namespace
   */
  XML: "http://www.w3.org/XML/1998/namespace",
  /**
   * The `xmlns:` namespace
   *
   * @see https://www.w3.org/2000/xmlns/
   */
  XMLNS: "http://www.w3.org/2000/xmlns/"
});
var assign_1 = conventions$2.assign = assign;
var find_1 = conventions$2.find = find$1;
var freeze_1 = conventions$2.freeze = freeze;
var MIME_TYPE_1 = conventions$2.MIME_TYPE = MIME_TYPE;
var NAMESPACE_1 = conventions$2.NAMESPACE = NAMESPACE$3;
var conventions$1 = conventions$2;
var find = conventions$1.find;
var NAMESPACE$2 = conventions$1.NAMESPACE;
function notEmptyString(input) {
  return input !== "";
}
function splitOnASCIIWhitespace(input) {
  return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
}
function orderedSetReducer(current, element) {
  if (!current.hasOwnProperty(element)) {
    current[element] = true;
  }
  return current;
}
function toOrderedSet(input) {
  if (!input)
    return [];
  var list = splitOnASCIIWhitespace(input);
  return Object.keys(list.reduce(orderedSetReducer, {}));
}
function arrayIncludes(list) {
  return function(element) {
    return list && list.indexOf(element) !== -1;
  };
}
function copy(src, dest) {
  for (var p in src) {
    if (Object.prototype.hasOwnProperty.call(src, p)) {
      dest[p] = src[p];
    }
  }
}
function _extends(Class, Super) {
  var pt = Class.prototype;
  if (!(pt instanceof Super)) {
    let t = function() {
    };
    ;
    t.prototype = Super.prototype;
    t = new t();
    copy(pt, t);
    Class.prototype = pt = t;
  }
  if (pt.constructor != Class) {
    if (typeof Class != "function") {
      console.error("unknown Class:" + Class);
    }
    pt.constructor = Class;
  }
}
var NodeType = {};
var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
var TEXT_NODE = NodeType.TEXT_NODE = 3;
var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
var ExceptionCode = {};
var ExceptionMessage = {};
var INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1);
var DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2);
var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3);
var WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4);
var INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5);
var NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7);
var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8);
var NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10);
var INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11);
var SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12);
var INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13);
var NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14);
var INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
function DOMException(code, message) {
  if (message instanceof Error) {
    var error = message;
  } else {
    error = this;
    Error.call(this, ExceptionMessage[code]);
    this.message = ExceptionMessage[code];
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, DOMException);
  }
  error.code = code;
  if (message)
    this.message = this.message + ": " + message;
  return error;
}
;
DOMException.prototype = Error.prototype;
copy(ExceptionCode, DOMException);
function NodeList() {
}
;
NodeList.prototype = {
  /**
   * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
   * @standard level1
   */
  length: 0,
  /**
   * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
   * @standard level1
   * @param index  unsigned long
   *   Index into the collection.
   * @return Node
   * 	The node at the indexth position in the NodeList, or null if that is not a valid index.
   */
  item: function(index) {
    return index >= 0 && index < this.length ? this[index] : null;
  },
  toString: function(isHTML, nodeFilter) {
    for (var buf = [], i = 0; i < this.length; i++) {
      serializeToString(this[i], buf, isHTML, nodeFilter);
    }
    return buf.join("");
  },
  /**
   * @private
   * @param {function (Node):boolean} predicate
   * @returns {Node[]}
   */
  filter: function(predicate) {
    return Array.prototype.filter.call(this, predicate);
  },
  /**
   * @private
   * @param {Node} item
   * @returns {number}
   */
  indexOf: function(item) {
    return Array.prototype.indexOf.call(this, item);
  }
};
function LiveNodeList(node, refresh) {
  this._node = node;
  this._refresh = refresh;
  _updateLiveList(this);
}
function _updateLiveList(list) {
  var inc = list._node._inc || list._node.ownerDocument._inc;
  if (list._inc !== inc) {
    var ls = list._refresh(list._node);
    __set__(list, "length", ls.length);
    if (!list.$$length || ls.length < list.$$length) {
      for (var i = ls.length; i in list; i++) {
        if (Object.prototype.hasOwnProperty.call(list, i)) {
          delete list[i];
        }
      }
    }
    copy(ls, list);
    list._inc = inc;
  }
}
LiveNodeList.prototype.item = function(i) {
  _updateLiveList(this);
  return this[i] || null;
};
_extends(LiveNodeList, NodeList);
function NamedNodeMap() {
}
;
function _findNodeIndex(list, node) {
  var i = list.length;
  while (i--) {
    if (list[i] === node) {
      return i;
    }
  }
}
function _addNamedNode(el, list, newAttr, oldAttr) {
  if (oldAttr) {
    list[_findNodeIndex(list, oldAttr)] = newAttr;
  } else {
    list[list.length++] = newAttr;
  }
  if (el) {
    newAttr.ownerElement = el;
    var doc = el.ownerDocument;
    if (doc) {
      oldAttr && _onRemoveAttribute(doc, el, oldAttr);
      _onAddAttribute(doc, el, newAttr);
    }
  }
}
function _removeNamedNode(el, list, attr) {
  var i = _findNodeIndex(list, attr);
  if (i >= 0) {
    var lastIndex = list.length - 1;
    while (i < lastIndex) {
      list[i] = list[++i];
    }
    list.length = lastIndex;
    if (el) {
      var doc = el.ownerDocument;
      if (doc) {
        _onRemoveAttribute(doc, el, attr);
        attr.ownerElement = null;
      }
    }
  } else {
    throw new DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
  }
}
NamedNodeMap.prototype = {
  length: 0,
  item: NodeList.prototype.item,
  getNamedItem: function(key) {
    var i = this.length;
    while (i--) {
      var attr = this[i];
      if (attr.nodeName == key) {
        return attr;
      }
    }
  },
  setNamedItem: function(attr) {
    var el = attr.ownerElement;
    if (el && el != this._ownerElement) {
      throw new DOMException(INUSE_ATTRIBUTE_ERR);
    }
    var oldAttr = this.getNamedItem(attr.nodeName);
    _addNamedNode(this._ownerElement, this, attr, oldAttr);
    return oldAttr;
  },
  /* returns Node */
  setNamedItemNS: function(attr) {
    var el = attr.ownerElement, oldAttr;
    if (el && el != this._ownerElement) {
      throw new DOMException(INUSE_ATTRIBUTE_ERR);
    }
    oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
    _addNamedNode(this._ownerElement, this, attr, oldAttr);
    return oldAttr;
  },
  /* returns Node */
  removeNamedItem: function(key) {
    var attr = this.getNamedItem(key);
    _removeNamedNode(this._ownerElement, this, attr);
    return attr;
  },
  // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
  //for level2
  removeNamedItemNS: function(namespaceURI, localName) {
    var attr = this.getNamedItemNS(namespaceURI, localName);
    _removeNamedNode(this._ownerElement, this, attr);
    return attr;
  },
  getNamedItemNS: function(namespaceURI, localName) {
    var i = this.length;
    while (i--) {
      var node = this[i];
      if (node.localName == localName && node.namespaceURI == namespaceURI) {
        return node;
      }
    }
    return null;
  }
};
function DOMImplementation$2() {
}
DOMImplementation$2.prototype = {
  /**
   * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
   * The different implementations fairly diverged in what kind of features were reported.
   * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
   *
   * @deprecated It is deprecated and modern browsers return true in all cases.
   *
   * @param {string} feature
   * @param {string} [version]
   * @returns {boolean} always true
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
   * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
   */
  hasFeature: function(feature, version) {
    return true;
  },
  /**
   * Creates an XML Document object of the specified type with its document element.
   *
   * __It behaves slightly different from the description in the living standard__:
   * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
   * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
   * - this implementation is not validating names or qualified names
   *   (when parsing XML strings, the SAX parser takes care of that)
   *
   * @param {string|null} namespaceURI
   * @param {string} qualifiedName
   * @param {DocumentType=null} doctype
   * @returns {Document}
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
   *
   * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
   * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
   * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
   */
  createDocument: function(namespaceURI, qualifiedName, doctype) {
    var doc = new Document();
    doc.implementation = this;
    doc.childNodes = new NodeList();
    doc.doctype = doctype || null;
    if (doctype) {
      doc.appendChild(doctype);
    }
    if (qualifiedName) {
      var root = doc.createElementNS(namespaceURI, qualifiedName);
      doc.appendChild(root);
    }
    return doc;
  },
  /**
   * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
   *
   * __This behavior is slightly different from the in the specs__:
   * - this implementation is not validating names or qualified names
   *   (when parsing XML strings, the SAX parser takes care of that)
   *
   * @param {string} qualifiedName
   * @param {string} [publicId]
   * @param {string} [systemId]
   * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
   * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
   *
   * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
   * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
   * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
   */
  createDocumentType: function(qualifiedName, publicId, systemId) {
    var node = new DocumentType();
    node.name = qualifiedName;
    node.nodeName = qualifiedName;
    node.publicId = publicId || "";
    node.systemId = systemId || "";
    return node;
  }
};
function Node() {
}
;
Node.prototype = {
  firstChild: null,
  lastChild: null,
  previousSibling: null,
  nextSibling: null,
  attributes: null,
  parentNode: null,
  childNodes: null,
  ownerDocument: null,
  nodeValue: null,
  namespaceURI: null,
  prefix: null,
  localName: null,
  // Modified in DOM Level 2:
  insertBefore: function(newChild, refChild) {
    return _insertBefore(this, newChild, refChild);
  },
  replaceChild: function(newChild, oldChild) {
    _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
    if (oldChild) {
      this.removeChild(oldChild);
    }
  },
  removeChild: function(oldChild) {
    return _removeChild(this, oldChild);
  },
  appendChild: function(newChild) {
    return this.insertBefore(newChild, null);
  },
  hasChildNodes: function() {
    return this.firstChild != null;
  },
  cloneNode: function(deep) {
    return cloneNode(this.ownerDocument || this, this, deep);
  },
  // Modified in DOM Level 2:
  normalize: function() {
    var child = this.firstChild;
    while (child) {
      var next = child.nextSibling;
      if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
        this.removeChild(next);
        child.appendData(next.data);
      } else {
        child.normalize();
        child = next;
      }
    }
  },
  // Introduced in DOM Level 2:
  isSupported: function(feature, version) {
    return this.ownerDocument.implementation.hasFeature(feature, version);
  },
  // Introduced in DOM Level 2:
  hasAttributes: function() {
    return this.attributes.length > 0;
  },
  /**
   * Look up the prefix associated to the given namespace URI, starting from this node.
   * **The default namespace declarations are ignored by this method.**
   * See Namespace Prefix Lookup for details on the algorithm used by this method.
   *
   * _Note: The implementation seems to be incomplete when compared to the algorithm described in the specs._
   *
   * @param {string | null} namespaceURI
   * @returns {string | null}
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
   * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
   * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
   * @see https://github.com/xmldom/xmldom/issues/322
   */
  lookupPrefix: function(namespaceURI) {
    var el = this;
    while (el) {
      var map = el._nsMap;
      if (map) {
        for (var n in map) {
          if (Object.prototype.hasOwnProperty.call(map, n) && map[n] === namespaceURI) {
            return n;
          }
        }
      }
      el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  lookupNamespaceURI: function(prefix) {
    var el = this;
    while (el) {
      var map = el._nsMap;
      if (map) {
        if (Object.prototype.hasOwnProperty.call(map, prefix)) {
          return map[prefix];
        }
      }
      el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  isDefaultNamespace: function(namespaceURI) {
    var prefix = this.lookupPrefix(namespaceURI);
    return prefix == null;
  }
};
function _xmlEncoder(c) {
  return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
}
copy(NodeType, Node);
copy(NodeType, Node.prototype);
function _visitNode(node, callback) {
  if (callback(node)) {
    return true;
  }
  if (node = node.firstChild) {
    do {
      if (_visitNode(node, callback)) {
        return true;
      }
    } while (node = node.nextSibling);
  }
}
function Document() {
  this.ownerDocument = this;
}
function _onAddAttribute(doc, el, newAttr) {
  doc && doc._inc++;
  var ns = newAttr.namespaceURI;
  if (ns === NAMESPACE$2.XMLNS) {
    el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
  }
}
function _onRemoveAttribute(doc, el, newAttr, remove) {
  doc && doc._inc++;
  var ns = newAttr.namespaceURI;
  if (ns === NAMESPACE$2.XMLNS) {
    delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
  }
}
function _onUpdateChild(doc, el, newChild) {
  if (doc && doc._inc) {
    doc._inc++;
    var cs = el.childNodes;
    if (newChild) {
      cs[cs.length++] = newChild;
    } else {
      var child = el.firstChild;
      var i = 0;
      while (child) {
        cs[i++] = child;
        child = child.nextSibling;
      }
      cs.length = i;
      delete cs[cs.length];
    }
  }
}
function _removeChild(parentNode, child) {
  var previous = child.previousSibling;
  var next = child.nextSibling;
  if (previous) {
    previous.nextSibling = next;
  } else {
    parentNode.firstChild = next;
  }
  if (next) {
    next.previousSibling = previous;
  } else {
    parentNode.lastChild = previous;
  }
  child.parentNode = null;
  child.previousSibling = null;
  child.nextSibling = null;
  _onUpdateChild(parentNode.ownerDocument, parentNode);
  return child;
}
function hasValidParentNodeType(node) {
  return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
}
function hasInsertableNodeType(node) {
  return node && (isElementNode(node) || isTextNode(node) || isDocTypeNode(node) || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE);
}
function isDocTypeNode(node) {
  return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
}
function isElementNode(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}
function isTextNode(node) {
  return node && node.nodeType === Node.TEXT_NODE;
}
function isElementInsertionPossible(doc, child) {
  var parentChildNodes = doc.childNodes || [];
  if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
    return false;
  }
  var docTypeNode = find(parentChildNodes, isDocTypeNode);
  return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
}
function isElementReplacementPossible(doc, child) {
  var parentChildNodes = doc.childNodes || [];
  function hasElementChildThatIsNotChild(node) {
    return isElementNode(node) && node !== child;
  }
  if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
    return false;
  }
  var docTypeNode = find(parentChildNodes, isDocTypeNode);
  return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
}
function assertPreInsertionValidity1to5(parent, node, child) {
  if (!hasValidParentNodeType(parent)) {
    throw new DOMException(HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
  }
  if (child && child.parentNode !== parent) {
    throw new DOMException(NOT_FOUND_ERR, "child not in parent");
  }
  if (
    // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
    !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
    // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
    // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
    // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
    isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
  ) {
    throw new DOMException(
      HIERARCHY_REQUEST_ERR,
      "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
    );
  }
}
function assertPreInsertionValidityInDocument(parent, node, child) {
  var parentChildNodes = parent.childNodes || [];
  var nodeChildNodes = node.childNodes || [];
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    var nodeChildElements = nodeChildNodes.filter(isElementNode);
    if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
    }
    if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
    }
  }
  if (isElementNode(node)) {
    if (!isElementInsertionPossible(parent, child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
    }
  }
  if (isDocTypeNode(node)) {
    if (find(parentChildNodes, isDocTypeNode)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
    }
    var parentElementChild = find(parentChildNodes, isElementNode);
    if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
    }
    if (!child && parentElementChild) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
    }
  }
}
function assertPreReplacementValidityInDocument(parent, node, child) {
  var parentChildNodes = parent.childNodes || [];
  var nodeChildNodes = node.childNodes || [];
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    var nodeChildElements = nodeChildNodes.filter(isElementNode);
    if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
    }
    if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
    }
  }
  if (isElementNode(node)) {
    if (!isElementReplacementPossible(parent, child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
    }
  }
  if (isDocTypeNode(node)) {
    let hasDoctypeChildThatIsNotChild = function(node2) {
      return isDocTypeNode(node2) && node2 !== child;
    };
    if (find(parentChildNodes, hasDoctypeChildThatIsNotChild)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
    }
    var parentElementChild = find(parentChildNodes, isElementNode);
    if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
      throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
    }
  }
}
function _insertBefore(parent, node, child, _inDocumentAssertion) {
  assertPreInsertionValidity1to5(parent, node, child);
  if (parent.nodeType === Node.DOCUMENT_NODE) {
    (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
  }
  var cp = node.parentNode;
  if (cp) {
    cp.removeChild(node);
  }
  if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
    var newFirst = node.firstChild;
    if (newFirst == null) {
      return node;
    }
    var newLast = node.lastChild;
  } else {
    newFirst = newLast = node;
  }
  var pre = child ? child.previousSibling : parent.lastChild;
  newFirst.previousSibling = pre;
  newLast.nextSibling = child;
  if (pre) {
    pre.nextSibling = newFirst;
  } else {
    parent.firstChild = newFirst;
  }
  if (child == null) {
    parent.lastChild = newLast;
  } else {
    child.previousSibling = newLast;
  }
  do {
    newFirst.parentNode = parent;
  } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
  _onUpdateChild(parent.ownerDocument || parent, parent);
  if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
    node.firstChild = node.lastChild = null;
  }
  return node;
}
function _appendSingleChild(parentNode, newChild) {
  if (newChild.parentNode) {
    newChild.parentNode.removeChild(newChild);
  }
  newChild.parentNode = parentNode;
  newChild.previousSibling = parentNode.lastChild;
  newChild.nextSibling = null;
  if (newChild.previousSibling) {
    newChild.previousSibling.nextSibling = newChild;
  } else {
    parentNode.firstChild = newChild;
  }
  parentNode.lastChild = newChild;
  _onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
  return newChild;
}
Document.prototype = {
  //implementation : null,
  nodeName: "#document",
  nodeType: DOCUMENT_NODE,
  /**
   * The DocumentType node of the document.
   *
   * @readonly
   * @type DocumentType
   */
  doctype: null,
  documentElement: null,
  _inc: 1,
  insertBefore: function(newChild, refChild) {
    if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
      var child = newChild.firstChild;
      while (child) {
        var next = child.nextSibling;
        this.insertBefore(child, refChild);
        child = next;
      }
      return newChild;
    }
    _insertBefore(this, newChild, refChild);
    newChild.ownerDocument = this;
    if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
      this.documentElement = newChild;
    }
    return newChild;
  },
  removeChild: function(oldChild) {
    if (this.documentElement == oldChild) {
      this.documentElement = null;
    }
    return _removeChild(this, oldChild);
  },
  replaceChild: function(newChild, oldChild) {
    _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
    newChild.ownerDocument = this;
    if (oldChild) {
      this.removeChild(oldChild);
    }
    if (isElementNode(newChild)) {
      this.documentElement = newChild;
    }
  },
  // Introduced in DOM Level 2:
  importNode: function(importedNode, deep) {
    return importNode(this, importedNode, deep);
  },
  // Introduced in DOM Level 2:
  getElementById: function(id) {
    var rtv = null;
    _visitNode(this.documentElement, function(node) {
      if (node.nodeType == ELEMENT_NODE) {
        if (node.getAttribute("id") == id) {
          rtv = node;
          return true;
        }
      }
    });
    return rtv;
  },
  /**
   * The `getElementsByClassName` method of `Document` interface returns an array-like object
   * of all child elements which have **all** of the given class name(s).
   *
   * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
   *
   *
   * Warning: This is a live LiveNodeList.
   * Changes in the DOM will reflect in the array as the changes occur.
   * If an element selected by this array no longer qualifies for the selector,
   * it will automatically be removed. Be aware of this for iteration purposes.
   *
   * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
   */
  getElementsByClassName: function(classNames) {
    var classNamesSet = toOrderedSet(classNames);
    return new LiveNodeList(this, function(base) {
      var ls = [];
      if (classNamesSet.length > 0) {
        _visitNode(base.documentElement, function(node) {
          if (node !== base && node.nodeType === ELEMENT_NODE) {
            var nodeClassNames = node.getAttribute("class");
            if (nodeClassNames) {
              var matches = classNames === nodeClassNames;
              if (!matches) {
                var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
              }
              if (matches) {
                ls.push(node);
              }
            }
          }
        });
      }
      return ls;
    });
  },
  //document factory method:
  createElement: function(tagName) {
    var node = new Element();
    node.ownerDocument = this;
    node.nodeName = tagName;
    node.tagName = tagName;
    node.localName = tagName;
    node.childNodes = new NodeList();
    var attrs = node.attributes = new NamedNodeMap();
    attrs._ownerElement = node;
    return node;
  },
  createDocumentFragment: function() {
    var node = new DocumentFragment();
    node.ownerDocument = this;
    node.childNodes = new NodeList();
    return node;
  },
  createTextNode: function(data) {
    var node = new Text();
    node.ownerDocument = this;
    node.appendData(data);
    return node;
  },
  createComment: function(data) {
    var node = new Comment();
    node.ownerDocument = this;
    node.appendData(data);
    return node;
  },
  createCDATASection: function(data) {
    var node = new CDATASection();
    node.ownerDocument = this;
    node.appendData(data);
    return node;
  },
  createProcessingInstruction: function(target, data) {
    var node = new ProcessingInstruction();
    node.ownerDocument = this;
    node.tagName = node.nodeName = node.target = target;
    node.nodeValue = node.data = data;
    return node;
  },
  createAttribute: function(name2) {
    var node = new Attr();
    node.ownerDocument = this;
    node.name = name2;
    node.nodeName = name2;
    node.localName = name2;
    node.specified = true;
    return node;
  },
  createEntityReference: function(name2) {
    var node = new EntityReference();
    node.ownerDocument = this;
    node.nodeName = name2;
    return node;
  },
  // Introduced in DOM Level 2:
  createElementNS: function(namespaceURI, qualifiedName) {
    var node = new Element();
    var pl = qualifiedName.split(":");
    var attrs = node.attributes = new NamedNodeMap();
    node.childNodes = new NodeList();
    node.ownerDocument = this;
    node.nodeName = qualifiedName;
    node.tagName = qualifiedName;
    node.namespaceURI = namespaceURI;
    if (pl.length == 2) {
      node.prefix = pl[0];
      node.localName = pl[1];
    } else {
      node.localName = qualifiedName;
    }
    attrs._ownerElement = node;
    return node;
  },
  // Introduced in DOM Level 2:
  createAttributeNS: function(namespaceURI, qualifiedName) {
    var node = new Attr();
    var pl = qualifiedName.split(":");
    node.ownerDocument = this;
    node.nodeName = qualifiedName;
    node.name = qualifiedName;
    node.namespaceURI = namespaceURI;
    node.specified = true;
    if (pl.length == 2) {
      node.prefix = pl[0];
      node.localName = pl[1];
    } else {
      node.localName = qualifiedName;
    }
    return node;
  }
};
_extends(Document, Node);
function Element() {
  this._nsMap = {};
}
;
Element.prototype = {
  nodeType: ELEMENT_NODE,
  hasAttribute: function(name2) {
    return this.getAttributeNode(name2) != null;
  },
  getAttribute: function(name2) {
    var attr = this.getAttributeNode(name2);
    return attr && attr.value || "";
  },
  getAttributeNode: function(name2) {
    return this.attributes.getNamedItem(name2);
  },
  setAttribute: function(name2, value) {
    var attr = this.ownerDocument.createAttribute(name2);
    attr.value = attr.nodeValue = "" + value;
    this.setAttributeNode(attr);
  },
  removeAttribute: function(name2) {
    var attr = this.getAttributeNode(name2);
    attr && this.removeAttributeNode(attr);
  },
  //four real opeartion method
  appendChild: function(newChild) {
    if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return this.insertBefore(newChild, null);
    } else {
      return _appendSingleChild(this, newChild);
    }
  },
  setAttributeNode: function(newAttr) {
    return this.attributes.setNamedItem(newAttr);
  },
  setAttributeNodeNS: function(newAttr) {
    return this.attributes.setNamedItemNS(newAttr);
  },
  removeAttributeNode: function(oldAttr) {
    return this.attributes.removeNamedItem(oldAttr.nodeName);
  },
  //get real attribute name,and remove it by removeAttributeNode
  removeAttributeNS: function(namespaceURI, localName) {
    var old = this.getAttributeNodeNS(namespaceURI, localName);
    old && this.removeAttributeNode(old);
  },
  hasAttributeNS: function(namespaceURI, localName) {
    return this.getAttributeNodeNS(namespaceURI, localName) != null;
  },
  getAttributeNS: function(namespaceURI, localName) {
    var attr = this.getAttributeNodeNS(namespaceURI, localName);
    return attr && attr.value || "";
  },
  setAttributeNS: function(namespaceURI, qualifiedName, value) {
    var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
    attr.value = attr.nodeValue = "" + value;
    this.setAttributeNode(attr);
  },
  getAttributeNodeNS: function(namespaceURI, localName) {
    return this.attributes.getNamedItemNS(namespaceURI, localName);
  },
  getElementsByTagName: function(tagName) {
    return new LiveNodeList(this, function(base) {
      var ls = [];
      _visitNode(base, function(node) {
        if (node !== base && node.nodeType == ELEMENT_NODE && (tagName === "*" || node.tagName == tagName)) {
          ls.push(node);
        }
      });
      return ls;
    });
  },
  getElementsByTagNameNS: function(namespaceURI, localName) {
    return new LiveNodeList(this, function(base) {
      var ls = [];
      _visitNode(base, function(node) {
        if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
          ls.push(node);
        }
      });
      return ls;
    });
  }
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
_extends(Element, Node);
function Attr() {
}
;
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr, Node);
function CharacterData() {
}
;
CharacterData.prototype = {
  data: "",
  substringData: function(offset, count) {
    return this.data.substring(offset, offset + count);
  },
  appendData: function(text) {
    text = this.data + text;
    this.nodeValue = this.data = text;
    this.length = text.length;
  },
  insertData: function(offset, text) {
    this.replaceData(offset, 0, text);
  },
  appendChild: function(newChild) {
    throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
  },
  deleteData: function(offset, count) {
    this.replaceData(offset, count, "");
  },
  replaceData: function(offset, count, text) {
    var start = this.data.substring(0, offset);
    var end = this.data.substring(offset + count);
    text = start + text + end;
    this.nodeValue = this.data = text;
    this.length = text.length;
  }
};
_extends(CharacterData, Node);
function Text() {
}
;
Text.prototype = {
  nodeName: "#text",
  nodeType: TEXT_NODE,
  splitText: function(offset) {
    var text = this.data;
    var newText = text.substring(offset);
    text = text.substring(0, offset);
    this.data = this.nodeValue = text;
    this.length = text.length;
    var newNode = this.ownerDocument.createTextNode(newText);
    if (this.parentNode) {
      this.parentNode.insertBefore(newNode, this.nextSibling);
    }
    return newNode;
  }
};
_extends(Text, CharacterData);
function Comment() {
}
;
Comment.prototype = {
  nodeName: "#comment",
  nodeType: COMMENT_NODE
};
_extends(Comment, CharacterData);
function CDATASection() {
}
;
CDATASection.prototype = {
  nodeName: "#cdata-section",
  nodeType: CDATA_SECTION_NODE
};
_extends(CDATASection, CharacterData);
function DocumentType() {
}
;
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType, Node);
function Notation() {
}
;
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation, Node);
function Entity() {
}
;
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity, Node);
function EntityReference() {
}
;
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference, Node);
function DocumentFragment() {
}
;
DocumentFragment.prototype.nodeName = "#document-fragment";
DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment, Node);
function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction, Node);
function XMLSerializer$1() {
}
XMLSerializer$1.prototype.serializeToString = function(node, isHtml, nodeFilter) {
  return nodeSerializeToString.call(node, isHtml, nodeFilter);
};
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml, nodeFilter) {
  var buf = [];
  var refNode = this.nodeType == 9 && this.documentElement || this;
  var prefix = refNode.prefix;
  var uri = refNode.namespaceURI;
  if (uri && prefix == null) {
    var prefix = refNode.lookupPrefix(uri);
    if (prefix == null) {
      var visibleNamespaces = [
        { namespace: uri, prefix: null }
        //{namespace:uri,prefix:''}
      ];
    }
  }
  serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces);
  return buf.join("");
}
function needNamespaceDefine(node, isHTML, visibleNamespaces) {
  var prefix = node.prefix || "";
  var uri = node.namespaceURI;
  if (!uri) {
    return false;
  }
  if (prefix === "xml" && uri === NAMESPACE$2.XML || uri === NAMESPACE$2.XMLNS) {
    return false;
  }
  var i = visibleNamespaces.length;
  while (i--) {
    var ns = visibleNamespaces[i];
    if (ns.prefix === prefix) {
      return ns.namespace !== uri;
    }
  }
  return true;
}
function addSerializedAttribute(buf, qualifiedName, value) {
  buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
}
function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
  if (!visibleNamespaces) {
    visibleNamespaces = [];
  }
  if (nodeFilter) {
    node = nodeFilter(node);
    if (node) {
      if (typeof node == "string") {
        buf.push(node);
        return;
      }
    } else {
      return;
    }
  }
  switch (node.nodeType) {
    case ELEMENT_NODE:
      var attrs = node.attributes;
      var len = attrs.length;
      var child = node.firstChild;
      var nodeName = node.tagName;
      isHTML = NAMESPACE$2.isHTML(node.namespaceURI) || isHTML;
      var prefixedNodeName = nodeName;
      if (!isHTML && !node.prefix && node.namespaceURI) {
        var defaultNS;
        for (var ai = 0; ai < attrs.length; ai++) {
          if (attrs.item(ai).name === "xmlns") {
            defaultNS = attrs.item(ai).value;
            break;
          }
        }
        if (!defaultNS) {
          for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
            var namespace = visibleNamespaces[nsi];
            if (namespace.prefix === "" && namespace.namespace === node.namespaceURI) {
              defaultNS = namespace.namespace;
              break;
            }
          }
        }
        if (defaultNS !== node.namespaceURI) {
          for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
            var namespace = visibleNamespaces[nsi];
            if (namespace.namespace === node.namespaceURI) {
              if (namespace.prefix) {
                prefixedNodeName = namespace.prefix + ":" + nodeName;
              }
              break;
            }
          }
        }
      }
      buf.push("<", prefixedNodeName);
      for (var i = 0; i < len; i++) {
        var attr = attrs.item(i);
        if (attr.prefix == "xmlns") {
          visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
        } else if (attr.nodeName == "xmlns") {
          visibleNamespaces.push({ prefix: "", namespace: attr.value });
        }
      }
      for (var i = 0; i < len; i++) {
        var attr = attrs.item(i);
        if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
          var prefix = attr.prefix || "";
          var uri = attr.namespaceURI;
          addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
          visibleNamespaces.push({ prefix, namespace: uri });
        }
        serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
      }
      if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
        var prefix = node.prefix || "";
        var uri = node.namespaceURI;
        addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
        visibleNamespaces.push({ prefix, namespace: uri });
      }
      if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
        buf.push(">");
        if (isHTML && /^script$/i.test(nodeName)) {
          while (child) {
            if (child.data) {
              buf.push(child.data);
            } else {
              serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
            }
            child = child.nextSibling;
          }
        } else {
          while (child) {
            serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
            child = child.nextSibling;
          }
        }
        buf.push("</", prefixedNodeName, ">");
      } else {
        buf.push("/>");
      }
      return;
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      var child = node.firstChild;
      while (child) {
        serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
        child = child.nextSibling;
      }
      return;
    case ATTRIBUTE_NODE:
      return addSerializedAttribute(buf, node.name, node.value);
    case TEXT_NODE:
      return buf.push(
        node.data.replace(/[<&>]/g, _xmlEncoder)
      );
    case CDATA_SECTION_NODE:
      return buf.push("<![CDATA[", node.data, "]]>");
    case COMMENT_NODE:
      return buf.push("<!--", node.data, "-->");
    case DOCUMENT_TYPE_NODE:
      var pubid = node.publicId;
      var sysid = node.systemId;
      buf.push("<!DOCTYPE ", node.name);
      if (pubid) {
        buf.push(" PUBLIC ", pubid);
        if (sysid && sysid != ".") {
          buf.push(" ", sysid);
        }
        buf.push(">");
      } else if (sysid && sysid != ".") {
        buf.push(" SYSTEM ", sysid, ">");
      } else {
        var sub = node.internalSubset;
        if (sub) {
          buf.push(" [", sub, "]");
        }
        buf.push(">");
      }
      return;
    case PROCESSING_INSTRUCTION_NODE:
      return buf.push("<?", node.target, " ", node.data, "?>");
    case ENTITY_REFERENCE_NODE:
      return buf.push("&", node.nodeName, ";");
    default:
      buf.push("??", node.nodeName);
  }
}
function importNode(doc, node, deep) {
  var node2;
  switch (node.nodeType) {
    case ELEMENT_NODE:
      node2 = node.cloneNode(false);
      node2.ownerDocument = doc;
    case DOCUMENT_FRAGMENT_NODE:
      break;
    case ATTRIBUTE_NODE:
      deep = true;
      break;
  }
  if (!node2) {
    node2 = node.cloneNode(false);
  }
  node2.ownerDocument = doc;
  node2.parentNode = null;
  if (deep) {
    var child = node.firstChild;
    while (child) {
      node2.appendChild(importNode(doc, child, deep));
      child = child.nextSibling;
    }
  }
  return node2;
}
function cloneNode(doc, node, deep) {
  var node2 = new node.constructor();
  for (var n in node) {
    if (Object.prototype.hasOwnProperty.call(node, n)) {
      var v = node[n];
      if (typeof v != "object") {
        if (v != node2[n]) {
          node2[n] = v;
        }
      }
    }
  }
  if (node.childNodes) {
    node2.childNodes = new NodeList();
  }
  node2.ownerDocument = doc;
  switch (node2.nodeType) {
    case ELEMENT_NODE:
      var attrs = node.attributes;
      var attrs2 = node2.attributes = new NamedNodeMap();
      var len = attrs.length;
      attrs2._ownerElement = node2;
      for (var i = 0; i < len; i++) {
        node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
      }
      break;
      ;
    case ATTRIBUTE_NODE:
      deep = true;
  }
  if (deep) {
    var child = node.firstChild;
    while (child) {
      node2.appendChild(cloneNode(doc, child, deep));
      child = child.nextSibling;
    }
  }
  return node2;
}
function __set__(object, key, value) {
  object[key] = value;
}
try {
  if (Object.defineProperty) {
    let getTextContent = function(node) {
      switch (node.nodeType) {
        case ELEMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE:
          var buf = [];
          node = node.firstChild;
          while (node) {
            if (node.nodeType !== 7 && node.nodeType !== 8) {
              buf.push(getTextContent(node));
            }
            node = node.nextSibling;
          }
          return buf.join("");
        default:
          return node.nodeValue;
      }
    };
    Object.defineProperty(LiveNodeList.prototype, "length", {
      get: function() {
        _updateLiveList(this);
        return this.$$length;
      }
    });
    Object.defineProperty(Node.prototype, "textContent", {
      get: function() {
        return getTextContent(this);
      },
      set: function(data) {
        switch (this.nodeType) {
          case ELEMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            while (this.firstChild) {
              this.removeChild(this.firstChild);
            }
            if (data || String(data)) {
              this.appendChild(this.ownerDocument.createTextNode(data));
            }
            break;
          default:
            this.data = data;
            this.value = data;
            this.nodeValue = data;
        }
      }
    });
    __set__ = function(object, key, value) {
      object["$$" + key] = value;
    };
  }
} catch (e) {
}
var DocumentType_1 = dom$2.DocumentType = DocumentType;
var DOMException_1 = dom$2.DOMException = DOMException;
var DOMImplementation_1 = dom$2.DOMImplementation = DOMImplementation$2;
var Element_1 = dom$2.Element = Element;
var Node_1 = dom$2.Node = Node;
var NodeList_1 = dom$2.NodeList = NodeList;
var XMLSerializer_1 = dom$2.XMLSerializer = XMLSerializer$1;
var domParser = {};
var entities$2 = {};
(function(exports) {
  "use strict";
  var freeze2 = conventions$2.freeze;
  exports.XML_ENTITIES = freeze2({
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
  });
  exports.HTML_ENTITIES = freeze2({
    Aacute: "Á",
    aacute: "á",
    Abreve: "Ă",
    abreve: "ă",
    ac: "∾",
    acd: "∿",
    acE: "∾̳",
    Acirc: "Â",
    acirc: "â",
    acute: "´",
    Acy: "А",
    acy: "а",
    AElig: "Æ",
    aelig: "æ",
    af: "⁡",
    Afr: "𝔄",
    afr: "𝔞",
    Agrave: "À",
    agrave: "à",
    alefsym: "ℵ",
    aleph: "ℵ",
    Alpha: "Α",
    alpha: "α",
    Amacr: "Ā",
    amacr: "ā",
    amalg: "⨿",
    AMP: "&",
    amp: "&",
    And: "⩓",
    and: "∧",
    andand: "⩕",
    andd: "⩜",
    andslope: "⩘",
    andv: "⩚",
    ang: "∠",
    ange: "⦤",
    angle: "∠",
    angmsd: "∡",
    angmsdaa: "⦨",
    angmsdab: "⦩",
    angmsdac: "⦪",
    angmsdad: "⦫",
    angmsdae: "⦬",
    angmsdaf: "⦭",
    angmsdag: "⦮",
    angmsdah: "⦯",
    angrt: "∟",
    angrtvb: "⊾",
    angrtvbd: "⦝",
    angsph: "∢",
    angst: "Å",
    angzarr: "⍼",
    Aogon: "Ą",
    aogon: "ą",
    Aopf: "𝔸",
    aopf: "𝕒",
    ap: "≈",
    apacir: "⩯",
    apE: "⩰",
    ape: "≊",
    apid: "≋",
    apos: "'",
    ApplyFunction: "⁡",
    approx: "≈",
    approxeq: "≊",
    Aring: "Å",
    aring: "å",
    Ascr: "𝒜",
    ascr: "𝒶",
    Assign: "≔",
    ast: "*",
    asymp: "≈",
    asympeq: "≍",
    Atilde: "Ã",
    atilde: "ã",
    Auml: "Ä",
    auml: "ä",
    awconint: "∳",
    awint: "⨑",
    backcong: "≌",
    backepsilon: "϶",
    backprime: "‵",
    backsim: "∽",
    backsimeq: "⋍",
    Backslash: "∖",
    Barv: "⫧",
    barvee: "⊽",
    Barwed: "⌆",
    barwed: "⌅",
    barwedge: "⌅",
    bbrk: "⎵",
    bbrktbrk: "⎶",
    bcong: "≌",
    Bcy: "Б",
    bcy: "б",
    bdquo: "„",
    becaus: "∵",
    Because: "∵",
    because: "∵",
    bemptyv: "⦰",
    bepsi: "϶",
    bernou: "ℬ",
    Bernoullis: "ℬ",
    Beta: "Β",
    beta: "β",
    beth: "ℶ",
    between: "≬",
    Bfr: "𝔅",
    bfr: "𝔟",
    bigcap: "⋂",
    bigcirc: "◯",
    bigcup: "⋃",
    bigodot: "⨀",
    bigoplus: "⨁",
    bigotimes: "⨂",
    bigsqcup: "⨆",
    bigstar: "★",
    bigtriangledown: "▽",
    bigtriangleup: "△",
    biguplus: "⨄",
    bigvee: "⋁",
    bigwedge: "⋀",
    bkarow: "⤍",
    blacklozenge: "⧫",
    blacksquare: "▪",
    blacktriangle: "▴",
    blacktriangledown: "▾",
    blacktriangleleft: "◂",
    blacktriangleright: "▸",
    blank: "␣",
    blk12: "▒",
    blk14: "░",
    blk34: "▓",
    block: "█",
    bne: "=⃥",
    bnequiv: "≡⃥",
    bNot: "⫭",
    bnot: "⌐",
    Bopf: "𝔹",
    bopf: "𝕓",
    bot: "⊥",
    bottom: "⊥",
    bowtie: "⋈",
    boxbox: "⧉",
    boxDL: "╗",
    boxDl: "╖",
    boxdL: "╕",
    boxdl: "┐",
    boxDR: "╔",
    boxDr: "╓",
    boxdR: "╒",
    boxdr: "┌",
    boxH: "═",
    boxh: "─",
    boxHD: "╦",
    boxHd: "╤",
    boxhD: "╥",
    boxhd: "┬",
    boxHU: "╩",
    boxHu: "╧",
    boxhU: "╨",
    boxhu: "┴",
    boxminus: "⊟",
    boxplus: "⊞",
    boxtimes: "⊠",
    boxUL: "╝",
    boxUl: "╜",
    boxuL: "╛",
    boxul: "┘",
    boxUR: "╚",
    boxUr: "╙",
    boxuR: "╘",
    boxur: "└",
    boxV: "║",
    boxv: "│",
    boxVH: "╬",
    boxVh: "╫",
    boxvH: "╪",
    boxvh: "┼",
    boxVL: "╣",
    boxVl: "╢",
    boxvL: "╡",
    boxvl: "┤",
    boxVR: "╠",
    boxVr: "╟",
    boxvR: "╞",
    boxvr: "├",
    bprime: "‵",
    Breve: "˘",
    breve: "˘",
    brvbar: "¦",
    Bscr: "ℬ",
    bscr: "𝒷",
    bsemi: "⁏",
    bsim: "∽",
    bsime: "⋍",
    bsol: "\\",
    bsolb: "⧅",
    bsolhsub: "⟈",
    bull: "•",
    bullet: "•",
    bump: "≎",
    bumpE: "⪮",
    bumpe: "≏",
    Bumpeq: "≎",
    bumpeq: "≏",
    Cacute: "Ć",
    cacute: "ć",
    Cap: "⋒",
    cap: "∩",
    capand: "⩄",
    capbrcup: "⩉",
    capcap: "⩋",
    capcup: "⩇",
    capdot: "⩀",
    CapitalDifferentialD: "ⅅ",
    caps: "∩︀",
    caret: "⁁",
    caron: "ˇ",
    Cayleys: "ℭ",
    ccaps: "⩍",
    Ccaron: "Č",
    ccaron: "č",
    Ccedil: "Ç",
    ccedil: "ç",
    Ccirc: "Ĉ",
    ccirc: "ĉ",
    Cconint: "∰",
    ccups: "⩌",
    ccupssm: "⩐",
    Cdot: "Ċ",
    cdot: "ċ",
    cedil: "¸",
    Cedilla: "¸",
    cemptyv: "⦲",
    cent: "¢",
    CenterDot: "·",
    centerdot: "·",
    Cfr: "ℭ",
    cfr: "𝔠",
    CHcy: "Ч",
    chcy: "ч",
    check: "✓",
    checkmark: "✓",
    Chi: "Χ",
    chi: "χ",
    cir: "○",
    circ: "ˆ",
    circeq: "≗",
    circlearrowleft: "↺",
    circlearrowright: "↻",
    circledast: "⊛",
    circledcirc: "⊚",
    circleddash: "⊝",
    CircleDot: "⊙",
    circledR: "®",
    circledS: "Ⓢ",
    CircleMinus: "⊖",
    CirclePlus: "⊕",
    CircleTimes: "⊗",
    cirE: "⧃",
    cire: "≗",
    cirfnint: "⨐",
    cirmid: "⫯",
    cirscir: "⧂",
    ClockwiseContourIntegral: "∲",
    CloseCurlyDoubleQuote: "”",
    CloseCurlyQuote: "’",
    clubs: "♣",
    clubsuit: "♣",
    Colon: "∷",
    colon: ":",
    Colone: "⩴",
    colone: "≔",
    coloneq: "≔",
    comma: ",",
    commat: "@",
    comp: "∁",
    compfn: "∘",
    complement: "∁",
    complexes: "ℂ",
    cong: "≅",
    congdot: "⩭",
    Congruent: "≡",
    Conint: "∯",
    conint: "∮",
    ContourIntegral: "∮",
    Copf: "ℂ",
    copf: "𝕔",
    coprod: "∐",
    Coproduct: "∐",
    COPY: "©",
    copy: "©",
    copysr: "℗",
    CounterClockwiseContourIntegral: "∳",
    crarr: "↵",
    Cross: "⨯",
    cross: "✗",
    Cscr: "𝒞",
    cscr: "𝒸",
    csub: "⫏",
    csube: "⫑",
    csup: "⫐",
    csupe: "⫒",
    ctdot: "⋯",
    cudarrl: "⤸",
    cudarrr: "⤵",
    cuepr: "⋞",
    cuesc: "⋟",
    cularr: "↶",
    cularrp: "⤽",
    Cup: "⋓",
    cup: "∪",
    cupbrcap: "⩈",
    CupCap: "≍",
    cupcap: "⩆",
    cupcup: "⩊",
    cupdot: "⊍",
    cupor: "⩅",
    cups: "∪︀",
    curarr: "↷",
    curarrm: "⤼",
    curlyeqprec: "⋞",
    curlyeqsucc: "⋟",
    curlyvee: "⋎",
    curlywedge: "⋏",
    curren: "¤",
    curvearrowleft: "↶",
    curvearrowright: "↷",
    cuvee: "⋎",
    cuwed: "⋏",
    cwconint: "∲",
    cwint: "∱",
    cylcty: "⌭",
    Dagger: "‡",
    dagger: "†",
    daleth: "ℸ",
    Darr: "↡",
    dArr: "⇓",
    darr: "↓",
    dash: "‐",
    Dashv: "⫤",
    dashv: "⊣",
    dbkarow: "⤏",
    dblac: "˝",
    Dcaron: "Ď",
    dcaron: "ď",
    Dcy: "Д",
    dcy: "д",
    DD: "ⅅ",
    dd: "ⅆ",
    ddagger: "‡",
    ddarr: "⇊",
    DDotrahd: "⤑",
    ddotseq: "⩷",
    deg: "°",
    Del: "∇",
    Delta: "Δ",
    delta: "δ",
    demptyv: "⦱",
    dfisht: "⥿",
    Dfr: "𝔇",
    dfr: "𝔡",
    dHar: "⥥",
    dharl: "⇃",
    dharr: "⇂",
    DiacriticalAcute: "´",
    DiacriticalDot: "˙",
    DiacriticalDoubleAcute: "˝",
    DiacriticalGrave: "`",
    DiacriticalTilde: "˜",
    diam: "⋄",
    Diamond: "⋄",
    diamond: "⋄",
    diamondsuit: "♦",
    diams: "♦",
    die: "¨",
    DifferentialD: "ⅆ",
    digamma: "ϝ",
    disin: "⋲",
    div: "÷",
    divide: "÷",
    divideontimes: "⋇",
    divonx: "⋇",
    DJcy: "Ђ",
    djcy: "ђ",
    dlcorn: "⌞",
    dlcrop: "⌍",
    dollar: "$",
    Dopf: "𝔻",
    dopf: "𝕕",
    Dot: "¨",
    dot: "˙",
    DotDot: "⃜",
    doteq: "≐",
    doteqdot: "≑",
    DotEqual: "≐",
    dotminus: "∸",
    dotplus: "∔",
    dotsquare: "⊡",
    doublebarwedge: "⌆",
    DoubleContourIntegral: "∯",
    DoubleDot: "¨",
    DoubleDownArrow: "⇓",
    DoubleLeftArrow: "⇐",
    DoubleLeftRightArrow: "⇔",
    DoubleLeftTee: "⫤",
    DoubleLongLeftArrow: "⟸",
    DoubleLongLeftRightArrow: "⟺",
    DoubleLongRightArrow: "⟹",
    DoubleRightArrow: "⇒",
    DoubleRightTee: "⊨",
    DoubleUpArrow: "⇑",
    DoubleUpDownArrow: "⇕",
    DoubleVerticalBar: "∥",
    DownArrow: "↓",
    Downarrow: "⇓",
    downarrow: "↓",
    DownArrowBar: "⤓",
    DownArrowUpArrow: "⇵",
    DownBreve: "̑",
    downdownarrows: "⇊",
    downharpoonleft: "⇃",
    downharpoonright: "⇂",
    DownLeftRightVector: "⥐",
    DownLeftTeeVector: "⥞",
    DownLeftVector: "↽",
    DownLeftVectorBar: "⥖",
    DownRightTeeVector: "⥟",
    DownRightVector: "⇁",
    DownRightVectorBar: "⥗",
    DownTee: "⊤",
    DownTeeArrow: "↧",
    drbkarow: "⤐",
    drcorn: "⌟",
    drcrop: "⌌",
    Dscr: "𝒟",
    dscr: "𝒹",
    DScy: "Ѕ",
    dscy: "ѕ",
    dsol: "⧶",
    Dstrok: "Đ",
    dstrok: "đ",
    dtdot: "⋱",
    dtri: "▿",
    dtrif: "▾",
    duarr: "⇵",
    duhar: "⥯",
    dwangle: "⦦",
    DZcy: "Џ",
    dzcy: "џ",
    dzigrarr: "⟿",
    Eacute: "É",
    eacute: "é",
    easter: "⩮",
    Ecaron: "Ě",
    ecaron: "ě",
    ecir: "≖",
    Ecirc: "Ê",
    ecirc: "ê",
    ecolon: "≕",
    Ecy: "Э",
    ecy: "э",
    eDDot: "⩷",
    Edot: "Ė",
    eDot: "≑",
    edot: "ė",
    ee: "ⅇ",
    efDot: "≒",
    Efr: "𝔈",
    efr: "𝔢",
    eg: "⪚",
    Egrave: "È",
    egrave: "è",
    egs: "⪖",
    egsdot: "⪘",
    el: "⪙",
    Element: "∈",
    elinters: "⏧",
    ell: "ℓ",
    els: "⪕",
    elsdot: "⪗",
    Emacr: "Ē",
    emacr: "ē",
    empty: "∅",
    emptyset: "∅",
    EmptySmallSquare: "◻",
    emptyv: "∅",
    EmptyVerySmallSquare: "▫",
    emsp: " ",
    emsp13: " ",
    emsp14: " ",
    ENG: "Ŋ",
    eng: "ŋ",
    ensp: " ",
    Eogon: "Ę",
    eogon: "ę",
    Eopf: "𝔼",
    eopf: "𝕖",
    epar: "⋕",
    eparsl: "⧣",
    eplus: "⩱",
    epsi: "ε",
    Epsilon: "Ε",
    epsilon: "ε",
    epsiv: "ϵ",
    eqcirc: "≖",
    eqcolon: "≕",
    eqsim: "≂",
    eqslantgtr: "⪖",
    eqslantless: "⪕",
    Equal: "⩵",
    equals: "=",
    EqualTilde: "≂",
    equest: "≟",
    Equilibrium: "⇌",
    equiv: "≡",
    equivDD: "⩸",
    eqvparsl: "⧥",
    erarr: "⥱",
    erDot: "≓",
    Escr: "ℰ",
    escr: "ℯ",
    esdot: "≐",
    Esim: "⩳",
    esim: "≂",
    Eta: "Η",
    eta: "η",
    ETH: "Ð",
    eth: "ð",
    Euml: "Ë",
    euml: "ë",
    euro: "€",
    excl: "!",
    exist: "∃",
    Exists: "∃",
    expectation: "ℰ",
    ExponentialE: "ⅇ",
    exponentiale: "ⅇ",
    fallingdotseq: "≒",
    Fcy: "Ф",
    fcy: "ф",
    female: "♀",
    ffilig: "ﬃ",
    fflig: "ﬀ",
    ffllig: "ﬄ",
    Ffr: "𝔉",
    ffr: "𝔣",
    filig: "ﬁ",
    FilledSmallSquare: "◼",
    FilledVerySmallSquare: "▪",
    fjlig: "fj",
    flat: "♭",
    fllig: "ﬂ",
    fltns: "▱",
    fnof: "ƒ",
    Fopf: "𝔽",
    fopf: "𝕗",
    ForAll: "∀",
    forall: "∀",
    fork: "⋔",
    forkv: "⫙",
    Fouriertrf: "ℱ",
    fpartint: "⨍",
    frac12: "½",
    frac13: "⅓",
    frac14: "¼",
    frac15: "⅕",
    frac16: "⅙",
    frac18: "⅛",
    frac23: "⅔",
    frac25: "⅖",
    frac34: "¾",
    frac35: "⅗",
    frac38: "⅜",
    frac45: "⅘",
    frac56: "⅚",
    frac58: "⅝",
    frac78: "⅞",
    frasl: "⁄",
    frown: "⌢",
    Fscr: "ℱ",
    fscr: "𝒻",
    gacute: "ǵ",
    Gamma: "Γ",
    gamma: "γ",
    Gammad: "Ϝ",
    gammad: "ϝ",
    gap: "⪆",
    Gbreve: "Ğ",
    gbreve: "ğ",
    Gcedil: "Ģ",
    Gcirc: "Ĝ",
    gcirc: "ĝ",
    Gcy: "Г",
    gcy: "г",
    Gdot: "Ġ",
    gdot: "ġ",
    gE: "≧",
    ge: "≥",
    gEl: "⪌",
    gel: "⋛",
    geq: "≥",
    geqq: "≧",
    geqslant: "⩾",
    ges: "⩾",
    gescc: "⪩",
    gesdot: "⪀",
    gesdoto: "⪂",
    gesdotol: "⪄",
    gesl: "⋛︀",
    gesles: "⪔",
    Gfr: "𝔊",
    gfr: "𝔤",
    Gg: "⋙",
    gg: "≫",
    ggg: "⋙",
    gimel: "ℷ",
    GJcy: "Ѓ",
    gjcy: "ѓ",
    gl: "≷",
    gla: "⪥",
    glE: "⪒",
    glj: "⪤",
    gnap: "⪊",
    gnapprox: "⪊",
    gnE: "≩",
    gne: "⪈",
    gneq: "⪈",
    gneqq: "≩",
    gnsim: "⋧",
    Gopf: "𝔾",
    gopf: "𝕘",
    grave: "`",
    GreaterEqual: "≥",
    GreaterEqualLess: "⋛",
    GreaterFullEqual: "≧",
    GreaterGreater: "⪢",
    GreaterLess: "≷",
    GreaterSlantEqual: "⩾",
    GreaterTilde: "≳",
    Gscr: "𝒢",
    gscr: "ℊ",
    gsim: "≳",
    gsime: "⪎",
    gsiml: "⪐",
    Gt: "≫",
    GT: ">",
    gt: ">",
    gtcc: "⪧",
    gtcir: "⩺",
    gtdot: "⋗",
    gtlPar: "⦕",
    gtquest: "⩼",
    gtrapprox: "⪆",
    gtrarr: "⥸",
    gtrdot: "⋗",
    gtreqless: "⋛",
    gtreqqless: "⪌",
    gtrless: "≷",
    gtrsim: "≳",
    gvertneqq: "≩︀",
    gvnE: "≩︀",
    Hacek: "ˇ",
    hairsp: " ",
    half: "½",
    hamilt: "ℋ",
    HARDcy: "Ъ",
    hardcy: "ъ",
    hArr: "⇔",
    harr: "↔",
    harrcir: "⥈",
    harrw: "↭",
    Hat: "^",
    hbar: "ℏ",
    Hcirc: "Ĥ",
    hcirc: "ĥ",
    hearts: "♥",
    heartsuit: "♥",
    hellip: "…",
    hercon: "⊹",
    Hfr: "ℌ",
    hfr: "𝔥",
    HilbertSpace: "ℋ",
    hksearow: "⤥",
    hkswarow: "⤦",
    hoarr: "⇿",
    homtht: "∻",
    hookleftarrow: "↩",
    hookrightarrow: "↪",
    Hopf: "ℍ",
    hopf: "𝕙",
    horbar: "―",
    HorizontalLine: "─",
    Hscr: "ℋ",
    hscr: "𝒽",
    hslash: "ℏ",
    Hstrok: "Ħ",
    hstrok: "ħ",
    HumpDownHump: "≎",
    HumpEqual: "≏",
    hybull: "⁃",
    hyphen: "‐",
    Iacute: "Í",
    iacute: "í",
    ic: "⁣",
    Icirc: "Î",
    icirc: "î",
    Icy: "И",
    icy: "и",
    Idot: "İ",
    IEcy: "Е",
    iecy: "е",
    iexcl: "¡",
    iff: "⇔",
    Ifr: "ℑ",
    ifr: "𝔦",
    Igrave: "Ì",
    igrave: "ì",
    ii: "ⅈ",
    iiiint: "⨌",
    iiint: "∭",
    iinfin: "⧜",
    iiota: "℩",
    IJlig: "Ĳ",
    ijlig: "ĳ",
    Im: "ℑ",
    Imacr: "Ī",
    imacr: "ī",
    image: "ℑ",
    ImaginaryI: "ⅈ",
    imagline: "ℐ",
    imagpart: "ℑ",
    imath: "ı",
    imof: "⊷",
    imped: "Ƶ",
    Implies: "⇒",
    in: "∈",
    incare: "℅",
    infin: "∞",
    infintie: "⧝",
    inodot: "ı",
    Int: "∬",
    int: "∫",
    intcal: "⊺",
    integers: "ℤ",
    Integral: "∫",
    intercal: "⊺",
    Intersection: "⋂",
    intlarhk: "⨗",
    intprod: "⨼",
    InvisibleComma: "⁣",
    InvisibleTimes: "⁢",
    IOcy: "Ё",
    iocy: "ё",
    Iogon: "Į",
    iogon: "į",
    Iopf: "𝕀",
    iopf: "𝕚",
    Iota: "Ι",
    iota: "ι",
    iprod: "⨼",
    iquest: "¿",
    Iscr: "ℐ",
    iscr: "𝒾",
    isin: "∈",
    isindot: "⋵",
    isinE: "⋹",
    isins: "⋴",
    isinsv: "⋳",
    isinv: "∈",
    it: "⁢",
    Itilde: "Ĩ",
    itilde: "ĩ",
    Iukcy: "І",
    iukcy: "і",
    Iuml: "Ï",
    iuml: "ï",
    Jcirc: "Ĵ",
    jcirc: "ĵ",
    Jcy: "Й",
    jcy: "й",
    Jfr: "𝔍",
    jfr: "𝔧",
    jmath: "ȷ",
    Jopf: "𝕁",
    jopf: "𝕛",
    Jscr: "𝒥",
    jscr: "𝒿",
    Jsercy: "Ј",
    jsercy: "ј",
    Jukcy: "Є",
    jukcy: "є",
    Kappa: "Κ",
    kappa: "κ",
    kappav: "ϰ",
    Kcedil: "Ķ",
    kcedil: "ķ",
    Kcy: "К",
    kcy: "к",
    Kfr: "𝔎",
    kfr: "𝔨",
    kgreen: "ĸ",
    KHcy: "Х",
    khcy: "х",
    KJcy: "Ќ",
    kjcy: "ќ",
    Kopf: "𝕂",
    kopf: "𝕜",
    Kscr: "𝒦",
    kscr: "𝓀",
    lAarr: "⇚",
    Lacute: "Ĺ",
    lacute: "ĺ",
    laemptyv: "⦴",
    lagran: "ℒ",
    Lambda: "Λ",
    lambda: "λ",
    Lang: "⟪",
    lang: "⟨",
    langd: "⦑",
    langle: "⟨",
    lap: "⪅",
    Laplacetrf: "ℒ",
    laquo: "«",
    Larr: "↞",
    lArr: "⇐",
    larr: "←",
    larrb: "⇤",
    larrbfs: "⤟",
    larrfs: "⤝",
    larrhk: "↩",
    larrlp: "↫",
    larrpl: "⤹",
    larrsim: "⥳",
    larrtl: "↢",
    lat: "⪫",
    lAtail: "⤛",
    latail: "⤙",
    late: "⪭",
    lates: "⪭︀",
    lBarr: "⤎",
    lbarr: "⤌",
    lbbrk: "❲",
    lbrace: "{",
    lbrack: "[",
    lbrke: "⦋",
    lbrksld: "⦏",
    lbrkslu: "⦍",
    Lcaron: "Ľ",
    lcaron: "ľ",
    Lcedil: "Ļ",
    lcedil: "ļ",
    lceil: "⌈",
    lcub: "{",
    Lcy: "Л",
    lcy: "л",
    ldca: "⤶",
    ldquo: "“",
    ldquor: "„",
    ldrdhar: "⥧",
    ldrushar: "⥋",
    ldsh: "↲",
    lE: "≦",
    le: "≤",
    LeftAngleBracket: "⟨",
    LeftArrow: "←",
    Leftarrow: "⇐",
    leftarrow: "←",
    LeftArrowBar: "⇤",
    LeftArrowRightArrow: "⇆",
    leftarrowtail: "↢",
    LeftCeiling: "⌈",
    LeftDoubleBracket: "⟦",
    LeftDownTeeVector: "⥡",
    LeftDownVector: "⇃",
    LeftDownVectorBar: "⥙",
    LeftFloor: "⌊",
    leftharpoondown: "↽",
    leftharpoonup: "↼",
    leftleftarrows: "⇇",
    LeftRightArrow: "↔",
    Leftrightarrow: "⇔",
    leftrightarrow: "↔",
    leftrightarrows: "⇆",
    leftrightharpoons: "⇋",
    leftrightsquigarrow: "↭",
    LeftRightVector: "⥎",
    LeftTee: "⊣",
    LeftTeeArrow: "↤",
    LeftTeeVector: "⥚",
    leftthreetimes: "⋋",
    LeftTriangle: "⊲",
    LeftTriangleBar: "⧏",
    LeftTriangleEqual: "⊴",
    LeftUpDownVector: "⥑",
    LeftUpTeeVector: "⥠",
    LeftUpVector: "↿",
    LeftUpVectorBar: "⥘",
    LeftVector: "↼",
    LeftVectorBar: "⥒",
    lEg: "⪋",
    leg: "⋚",
    leq: "≤",
    leqq: "≦",
    leqslant: "⩽",
    les: "⩽",
    lescc: "⪨",
    lesdot: "⩿",
    lesdoto: "⪁",
    lesdotor: "⪃",
    lesg: "⋚︀",
    lesges: "⪓",
    lessapprox: "⪅",
    lessdot: "⋖",
    lesseqgtr: "⋚",
    lesseqqgtr: "⪋",
    LessEqualGreater: "⋚",
    LessFullEqual: "≦",
    LessGreater: "≶",
    lessgtr: "≶",
    LessLess: "⪡",
    lesssim: "≲",
    LessSlantEqual: "⩽",
    LessTilde: "≲",
    lfisht: "⥼",
    lfloor: "⌊",
    Lfr: "𝔏",
    lfr: "𝔩",
    lg: "≶",
    lgE: "⪑",
    lHar: "⥢",
    lhard: "↽",
    lharu: "↼",
    lharul: "⥪",
    lhblk: "▄",
    LJcy: "Љ",
    ljcy: "љ",
    Ll: "⋘",
    ll: "≪",
    llarr: "⇇",
    llcorner: "⌞",
    Lleftarrow: "⇚",
    llhard: "⥫",
    lltri: "◺",
    Lmidot: "Ŀ",
    lmidot: "ŀ",
    lmoust: "⎰",
    lmoustache: "⎰",
    lnap: "⪉",
    lnapprox: "⪉",
    lnE: "≨",
    lne: "⪇",
    lneq: "⪇",
    lneqq: "≨",
    lnsim: "⋦",
    loang: "⟬",
    loarr: "⇽",
    lobrk: "⟦",
    LongLeftArrow: "⟵",
    Longleftarrow: "⟸",
    longleftarrow: "⟵",
    LongLeftRightArrow: "⟷",
    Longleftrightarrow: "⟺",
    longleftrightarrow: "⟷",
    longmapsto: "⟼",
    LongRightArrow: "⟶",
    Longrightarrow: "⟹",
    longrightarrow: "⟶",
    looparrowleft: "↫",
    looparrowright: "↬",
    lopar: "⦅",
    Lopf: "𝕃",
    lopf: "𝕝",
    loplus: "⨭",
    lotimes: "⨴",
    lowast: "∗",
    lowbar: "_",
    LowerLeftArrow: "↙",
    LowerRightArrow: "↘",
    loz: "◊",
    lozenge: "◊",
    lozf: "⧫",
    lpar: "(",
    lparlt: "⦓",
    lrarr: "⇆",
    lrcorner: "⌟",
    lrhar: "⇋",
    lrhard: "⥭",
    lrm: "‎",
    lrtri: "⊿",
    lsaquo: "‹",
    Lscr: "ℒ",
    lscr: "𝓁",
    Lsh: "↰",
    lsh: "↰",
    lsim: "≲",
    lsime: "⪍",
    lsimg: "⪏",
    lsqb: "[",
    lsquo: "‘",
    lsquor: "‚",
    Lstrok: "Ł",
    lstrok: "ł",
    Lt: "≪",
    LT: "<",
    lt: "<",
    ltcc: "⪦",
    ltcir: "⩹",
    ltdot: "⋖",
    lthree: "⋋",
    ltimes: "⋉",
    ltlarr: "⥶",
    ltquest: "⩻",
    ltri: "◃",
    ltrie: "⊴",
    ltrif: "◂",
    ltrPar: "⦖",
    lurdshar: "⥊",
    luruhar: "⥦",
    lvertneqq: "≨︀",
    lvnE: "≨︀",
    macr: "¯",
    male: "♂",
    malt: "✠",
    maltese: "✠",
    Map: "⤅",
    map: "↦",
    mapsto: "↦",
    mapstodown: "↧",
    mapstoleft: "↤",
    mapstoup: "↥",
    marker: "▮",
    mcomma: "⨩",
    Mcy: "М",
    mcy: "м",
    mdash: "—",
    mDDot: "∺",
    measuredangle: "∡",
    MediumSpace: " ",
    Mellintrf: "ℳ",
    Mfr: "𝔐",
    mfr: "𝔪",
    mho: "℧",
    micro: "µ",
    mid: "∣",
    midast: "*",
    midcir: "⫰",
    middot: "·",
    minus: "−",
    minusb: "⊟",
    minusd: "∸",
    minusdu: "⨪",
    MinusPlus: "∓",
    mlcp: "⫛",
    mldr: "…",
    mnplus: "∓",
    models: "⊧",
    Mopf: "𝕄",
    mopf: "𝕞",
    mp: "∓",
    Mscr: "ℳ",
    mscr: "𝓂",
    mstpos: "∾",
    Mu: "Μ",
    mu: "μ",
    multimap: "⊸",
    mumap: "⊸",
    nabla: "∇",
    Nacute: "Ń",
    nacute: "ń",
    nang: "∠⃒",
    nap: "≉",
    napE: "⩰̸",
    napid: "≋̸",
    napos: "ŉ",
    napprox: "≉",
    natur: "♮",
    natural: "♮",
    naturals: "ℕ",
    nbsp: " ",
    nbump: "≎̸",
    nbumpe: "≏̸",
    ncap: "⩃",
    Ncaron: "Ň",
    ncaron: "ň",
    Ncedil: "Ņ",
    ncedil: "ņ",
    ncong: "≇",
    ncongdot: "⩭̸",
    ncup: "⩂",
    Ncy: "Н",
    ncy: "н",
    ndash: "–",
    ne: "≠",
    nearhk: "⤤",
    neArr: "⇗",
    nearr: "↗",
    nearrow: "↗",
    nedot: "≐̸",
    NegativeMediumSpace: "​",
    NegativeThickSpace: "​",
    NegativeThinSpace: "​",
    NegativeVeryThinSpace: "​",
    nequiv: "≢",
    nesear: "⤨",
    nesim: "≂̸",
    NestedGreaterGreater: "≫",
    NestedLessLess: "≪",
    NewLine: "\n",
    nexist: "∄",
    nexists: "∄",
    Nfr: "𝔑",
    nfr: "𝔫",
    ngE: "≧̸",
    nge: "≱",
    ngeq: "≱",
    ngeqq: "≧̸",
    ngeqslant: "⩾̸",
    nges: "⩾̸",
    nGg: "⋙̸",
    ngsim: "≵",
    nGt: "≫⃒",
    ngt: "≯",
    ngtr: "≯",
    nGtv: "≫̸",
    nhArr: "⇎",
    nharr: "↮",
    nhpar: "⫲",
    ni: "∋",
    nis: "⋼",
    nisd: "⋺",
    niv: "∋",
    NJcy: "Њ",
    njcy: "њ",
    nlArr: "⇍",
    nlarr: "↚",
    nldr: "‥",
    nlE: "≦̸",
    nle: "≰",
    nLeftarrow: "⇍",
    nleftarrow: "↚",
    nLeftrightarrow: "⇎",
    nleftrightarrow: "↮",
    nleq: "≰",
    nleqq: "≦̸",
    nleqslant: "⩽̸",
    nles: "⩽̸",
    nless: "≮",
    nLl: "⋘̸",
    nlsim: "≴",
    nLt: "≪⃒",
    nlt: "≮",
    nltri: "⋪",
    nltrie: "⋬",
    nLtv: "≪̸",
    nmid: "∤",
    NoBreak: "⁠",
    NonBreakingSpace: " ",
    Nopf: "ℕ",
    nopf: "𝕟",
    Not: "⫬",
    not: "¬",
    NotCongruent: "≢",
    NotCupCap: "≭",
    NotDoubleVerticalBar: "∦",
    NotElement: "∉",
    NotEqual: "≠",
    NotEqualTilde: "≂̸",
    NotExists: "∄",
    NotGreater: "≯",
    NotGreaterEqual: "≱",
    NotGreaterFullEqual: "≧̸",
    NotGreaterGreater: "≫̸",
    NotGreaterLess: "≹",
    NotGreaterSlantEqual: "⩾̸",
    NotGreaterTilde: "≵",
    NotHumpDownHump: "≎̸",
    NotHumpEqual: "≏̸",
    notin: "∉",
    notindot: "⋵̸",
    notinE: "⋹̸",
    notinva: "∉",
    notinvb: "⋷",
    notinvc: "⋶",
    NotLeftTriangle: "⋪",
    NotLeftTriangleBar: "⧏̸",
    NotLeftTriangleEqual: "⋬",
    NotLess: "≮",
    NotLessEqual: "≰",
    NotLessGreater: "≸",
    NotLessLess: "≪̸",
    NotLessSlantEqual: "⩽̸",
    NotLessTilde: "≴",
    NotNestedGreaterGreater: "⪢̸",
    NotNestedLessLess: "⪡̸",
    notni: "∌",
    notniva: "∌",
    notnivb: "⋾",
    notnivc: "⋽",
    NotPrecedes: "⊀",
    NotPrecedesEqual: "⪯̸",
    NotPrecedesSlantEqual: "⋠",
    NotReverseElement: "∌",
    NotRightTriangle: "⋫",
    NotRightTriangleBar: "⧐̸",
    NotRightTriangleEqual: "⋭",
    NotSquareSubset: "⊏̸",
    NotSquareSubsetEqual: "⋢",
    NotSquareSuperset: "⊐̸",
    NotSquareSupersetEqual: "⋣",
    NotSubset: "⊂⃒",
    NotSubsetEqual: "⊈",
    NotSucceeds: "⊁",
    NotSucceedsEqual: "⪰̸",
    NotSucceedsSlantEqual: "⋡",
    NotSucceedsTilde: "≿̸",
    NotSuperset: "⊃⃒",
    NotSupersetEqual: "⊉",
    NotTilde: "≁",
    NotTildeEqual: "≄",
    NotTildeFullEqual: "≇",
    NotTildeTilde: "≉",
    NotVerticalBar: "∤",
    npar: "∦",
    nparallel: "∦",
    nparsl: "⫽⃥",
    npart: "∂̸",
    npolint: "⨔",
    npr: "⊀",
    nprcue: "⋠",
    npre: "⪯̸",
    nprec: "⊀",
    npreceq: "⪯̸",
    nrArr: "⇏",
    nrarr: "↛",
    nrarrc: "⤳̸",
    nrarrw: "↝̸",
    nRightarrow: "⇏",
    nrightarrow: "↛",
    nrtri: "⋫",
    nrtrie: "⋭",
    nsc: "⊁",
    nsccue: "⋡",
    nsce: "⪰̸",
    Nscr: "𝒩",
    nscr: "𝓃",
    nshortmid: "∤",
    nshortparallel: "∦",
    nsim: "≁",
    nsime: "≄",
    nsimeq: "≄",
    nsmid: "∤",
    nspar: "∦",
    nsqsube: "⋢",
    nsqsupe: "⋣",
    nsub: "⊄",
    nsubE: "⫅̸",
    nsube: "⊈",
    nsubset: "⊂⃒",
    nsubseteq: "⊈",
    nsubseteqq: "⫅̸",
    nsucc: "⊁",
    nsucceq: "⪰̸",
    nsup: "⊅",
    nsupE: "⫆̸",
    nsupe: "⊉",
    nsupset: "⊃⃒",
    nsupseteq: "⊉",
    nsupseteqq: "⫆̸",
    ntgl: "≹",
    Ntilde: "Ñ",
    ntilde: "ñ",
    ntlg: "≸",
    ntriangleleft: "⋪",
    ntrianglelefteq: "⋬",
    ntriangleright: "⋫",
    ntrianglerighteq: "⋭",
    Nu: "Ν",
    nu: "ν",
    num: "#",
    numero: "№",
    numsp: " ",
    nvap: "≍⃒",
    nVDash: "⊯",
    nVdash: "⊮",
    nvDash: "⊭",
    nvdash: "⊬",
    nvge: "≥⃒",
    nvgt: ">⃒",
    nvHarr: "⤄",
    nvinfin: "⧞",
    nvlArr: "⤂",
    nvle: "≤⃒",
    nvlt: "<⃒",
    nvltrie: "⊴⃒",
    nvrArr: "⤃",
    nvrtrie: "⊵⃒",
    nvsim: "∼⃒",
    nwarhk: "⤣",
    nwArr: "⇖",
    nwarr: "↖",
    nwarrow: "↖",
    nwnear: "⤧",
    Oacute: "Ó",
    oacute: "ó",
    oast: "⊛",
    ocir: "⊚",
    Ocirc: "Ô",
    ocirc: "ô",
    Ocy: "О",
    ocy: "о",
    odash: "⊝",
    Odblac: "Ő",
    odblac: "ő",
    odiv: "⨸",
    odot: "⊙",
    odsold: "⦼",
    OElig: "Œ",
    oelig: "œ",
    ofcir: "⦿",
    Ofr: "𝔒",
    ofr: "𝔬",
    ogon: "˛",
    Ograve: "Ò",
    ograve: "ò",
    ogt: "⧁",
    ohbar: "⦵",
    ohm: "Ω",
    oint: "∮",
    olarr: "↺",
    olcir: "⦾",
    olcross: "⦻",
    oline: "‾",
    olt: "⧀",
    Omacr: "Ō",
    omacr: "ō",
    Omega: "Ω",
    omega: "ω",
    Omicron: "Ο",
    omicron: "ο",
    omid: "⦶",
    ominus: "⊖",
    Oopf: "𝕆",
    oopf: "𝕠",
    opar: "⦷",
    OpenCurlyDoubleQuote: "“",
    OpenCurlyQuote: "‘",
    operp: "⦹",
    oplus: "⊕",
    Or: "⩔",
    or: "∨",
    orarr: "↻",
    ord: "⩝",
    order: "ℴ",
    orderof: "ℴ",
    ordf: "ª",
    ordm: "º",
    origof: "⊶",
    oror: "⩖",
    orslope: "⩗",
    orv: "⩛",
    oS: "Ⓢ",
    Oscr: "𝒪",
    oscr: "ℴ",
    Oslash: "Ø",
    oslash: "ø",
    osol: "⊘",
    Otilde: "Õ",
    otilde: "õ",
    Otimes: "⨷",
    otimes: "⊗",
    otimesas: "⨶",
    Ouml: "Ö",
    ouml: "ö",
    ovbar: "⌽",
    OverBar: "‾",
    OverBrace: "⏞",
    OverBracket: "⎴",
    OverParenthesis: "⏜",
    par: "∥",
    para: "¶",
    parallel: "∥",
    parsim: "⫳",
    parsl: "⫽",
    part: "∂",
    PartialD: "∂",
    Pcy: "П",
    pcy: "п",
    percnt: "%",
    period: ".",
    permil: "‰",
    perp: "⊥",
    pertenk: "‱",
    Pfr: "𝔓",
    pfr: "𝔭",
    Phi: "Φ",
    phi: "φ",
    phiv: "ϕ",
    phmmat: "ℳ",
    phone: "☎",
    Pi: "Π",
    pi: "π",
    pitchfork: "⋔",
    piv: "ϖ",
    planck: "ℏ",
    planckh: "ℎ",
    plankv: "ℏ",
    plus: "+",
    plusacir: "⨣",
    plusb: "⊞",
    pluscir: "⨢",
    plusdo: "∔",
    plusdu: "⨥",
    pluse: "⩲",
    PlusMinus: "±",
    plusmn: "±",
    plussim: "⨦",
    plustwo: "⨧",
    pm: "±",
    Poincareplane: "ℌ",
    pointint: "⨕",
    Popf: "ℙ",
    popf: "𝕡",
    pound: "£",
    Pr: "⪻",
    pr: "≺",
    prap: "⪷",
    prcue: "≼",
    prE: "⪳",
    pre: "⪯",
    prec: "≺",
    precapprox: "⪷",
    preccurlyeq: "≼",
    Precedes: "≺",
    PrecedesEqual: "⪯",
    PrecedesSlantEqual: "≼",
    PrecedesTilde: "≾",
    preceq: "⪯",
    precnapprox: "⪹",
    precneqq: "⪵",
    precnsim: "⋨",
    precsim: "≾",
    Prime: "″",
    prime: "′",
    primes: "ℙ",
    prnap: "⪹",
    prnE: "⪵",
    prnsim: "⋨",
    prod: "∏",
    Product: "∏",
    profalar: "⌮",
    profline: "⌒",
    profsurf: "⌓",
    prop: "∝",
    Proportion: "∷",
    Proportional: "∝",
    propto: "∝",
    prsim: "≾",
    prurel: "⊰",
    Pscr: "𝒫",
    pscr: "𝓅",
    Psi: "Ψ",
    psi: "ψ",
    puncsp: " ",
    Qfr: "𝔔",
    qfr: "𝔮",
    qint: "⨌",
    Qopf: "ℚ",
    qopf: "𝕢",
    qprime: "⁗",
    Qscr: "𝒬",
    qscr: "𝓆",
    quaternions: "ℍ",
    quatint: "⨖",
    quest: "?",
    questeq: "≟",
    QUOT: '"',
    quot: '"',
    rAarr: "⇛",
    race: "∽̱",
    Racute: "Ŕ",
    racute: "ŕ",
    radic: "√",
    raemptyv: "⦳",
    Rang: "⟫",
    rang: "⟩",
    rangd: "⦒",
    range: "⦥",
    rangle: "⟩",
    raquo: "»",
    Rarr: "↠",
    rArr: "⇒",
    rarr: "→",
    rarrap: "⥵",
    rarrb: "⇥",
    rarrbfs: "⤠",
    rarrc: "⤳",
    rarrfs: "⤞",
    rarrhk: "↪",
    rarrlp: "↬",
    rarrpl: "⥅",
    rarrsim: "⥴",
    Rarrtl: "⤖",
    rarrtl: "↣",
    rarrw: "↝",
    rAtail: "⤜",
    ratail: "⤚",
    ratio: "∶",
    rationals: "ℚ",
    RBarr: "⤐",
    rBarr: "⤏",
    rbarr: "⤍",
    rbbrk: "❳",
    rbrace: "}",
    rbrack: "]",
    rbrke: "⦌",
    rbrksld: "⦎",
    rbrkslu: "⦐",
    Rcaron: "Ř",
    rcaron: "ř",
    Rcedil: "Ŗ",
    rcedil: "ŗ",
    rceil: "⌉",
    rcub: "}",
    Rcy: "Р",
    rcy: "р",
    rdca: "⤷",
    rdldhar: "⥩",
    rdquo: "”",
    rdquor: "”",
    rdsh: "↳",
    Re: "ℜ",
    real: "ℜ",
    realine: "ℛ",
    realpart: "ℜ",
    reals: "ℝ",
    rect: "▭",
    REG: "®",
    reg: "®",
    ReverseElement: "∋",
    ReverseEquilibrium: "⇋",
    ReverseUpEquilibrium: "⥯",
    rfisht: "⥽",
    rfloor: "⌋",
    Rfr: "ℜ",
    rfr: "𝔯",
    rHar: "⥤",
    rhard: "⇁",
    rharu: "⇀",
    rharul: "⥬",
    Rho: "Ρ",
    rho: "ρ",
    rhov: "ϱ",
    RightAngleBracket: "⟩",
    RightArrow: "→",
    Rightarrow: "⇒",
    rightarrow: "→",
    RightArrowBar: "⇥",
    RightArrowLeftArrow: "⇄",
    rightarrowtail: "↣",
    RightCeiling: "⌉",
    RightDoubleBracket: "⟧",
    RightDownTeeVector: "⥝",
    RightDownVector: "⇂",
    RightDownVectorBar: "⥕",
    RightFloor: "⌋",
    rightharpoondown: "⇁",
    rightharpoonup: "⇀",
    rightleftarrows: "⇄",
    rightleftharpoons: "⇌",
    rightrightarrows: "⇉",
    rightsquigarrow: "↝",
    RightTee: "⊢",
    RightTeeArrow: "↦",
    RightTeeVector: "⥛",
    rightthreetimes: "⋌",
    RightTriangle: "⊳",
    RightTriangleBar: "⧐",
    RightTriangleEqual: "⊵",
    RightUpDownVector: "⥏",
    RightUpTeeVector: "⥜",
    RightUpVector: "↾",
    RightUpVectorBar: "⥔",
    RightVector: "⇀",
    RightVectorBar: "⥓",
    ring: "˚",
    risingdotseq: "≓",
    rlarr: "⇄",
    rlhar: "⇌",
    rlm: "‏",
    rmoust: "⎱",
    rmoustache: "⎱",
    rnmid: "⫮",
    roang: "⟭",
    roarr: "⇾",
    robrk: "⟧",
    ropar: "⦆",
    Ropf: "ℝ",
    ropf: "𝕣",
    roplus: "⨮",
    rotimes: "⨵",
    RoundImplies: "⥰",
    rpar: ")",
    rpargt: "⦔",
    rppolint: "⨒",
    rrarr: "⇉",
    Rrightarrow: "⇛",
    rsaquo: "›",
    Rscr: "ℛ",
    rscr: "𝓇",
    Rsh: "↱",
    rsh: "↱",
    rsqb: "]",
    rsquo: "’",
    rsquor: "’",
    rthree: "⋌",
    rtimes: "⋊",
    rtri: "▹",
    rtrie: "⊵",
    rtrif: "▸",
    rtriltri: "⧎",
    RuleDelayed: "⧴",
    ruluhar: "⥨",
    rx: "℞",
    Sacute: "Ś",
    sacute: "ś",
    sbquo: "‚",
    Sc: "⪼",
    sc: "≻",
    scap: "⪸",
    Scaron: "Š",
    scaron: "š",
    sccue: "≽",
    scE: "⪴",
    sce: "⪰",
    Scedil: "Ş",
    scedil: "ş",
    Scirc: "Ŝ",
    scirc: "ŝ",
    scnap: "⪺",
    scnE: "⪶",
    scnsim: "⋩",
    scpolint: "⨓",
    scsim: "≿",
    Scy: "С",
    scy: "с",
    sdot: "⋅",
    sdotb: "⊡",
    sdote: "⩦",
    searhk: "⤥",
    seArr: "⇘",
    searr: "↘",
    searrow: "↘",
    sect: "§",
    semi: ";",
    seswar: "⤩",
    setminus: "∖",
    setmn: "∖",
    sext: "✶",
    Sfr: "𝔖",
    sfr: "𝔰",
    sfrown: "⌢",
    sharp: "♯",
    SHCHcy: "Щ",
    shchcy: "щ",
    SHcy: "Ш",
    shcy: "ш",
    ShortDownArrow: "↓",
    ShortLeftArrow: "←",
    shortmid: "∣",
    shortparallel: "∥",
    ShortRightArrow: "→",
    ShortUpArrow: "↑",
    shy: "­",
    Sigma: "Σ",
    sigma: "σ",
    sigmaf: "ς",
    sigmav: "ς",
    sim: "∼",
    simdot: "⩪",
    sime: "≃",
    simeq: "≃",
    simg: "⪞",
    simgE: "⪠",
    siml: "⪝",
    simlE: "⪟",
    simne: "≆",
    simplus: "⨤",
    simrarr: "⥲",
    slarr: "←",
    SmallCircle: "∘",
    smallsetminus: "∖",
    smashp: "⨳",
    smeparsl: "⧤",
    smid: "∣",
    smile: "⌣",
    smt: "⪪",
    smte: "⪬",
    smtes: "⪬︀",
    SOFTcy: "Ь",
    softcy: "ь",
    sol: "/",
    solb: "⧄",
    solbar: "⌿",
    Sopf: "𝕊",
    sopf: "𝕤",
    spades: "♠",
    spadesuit: "♠",
    spar: "∥",
    sqcap: "⊓",
    sqcaps: "⊓︀",
    sqcup: "⊔",
    sqcups: "⊔︀",
    Sqrt: "√",
    sqsub: "⊏",
    sqsube: "⊑",
    sqsubset: "⊏",
    sqsubseteq: "⊑",
    sqsup: "⊐",
    sqsupe: "⊒",
    sqsupset: "⊐",
    sqsupseteq: "⊒",
    squ: "□",
    Square: "□",
    square: "□",
    SquareIntersection: "⊓",
    SquareSubset: "⊏",
    SquareSubsetEqual: "⊑",
    SquareSuperset: "⊐",
    SquareSupersetEqual: "⊒",
    SquareUnion: "⊔",
    squarf: "▪",
    squf: "▪",
    srarr: "→",
    Sscr: "𝒮",
    sscr: "𝓈",
    ssetmn: "∖",
    ssmile: "⌣",
    sstarf: "⋆",
    Star: "⋆",
    star: "☆",
    starf: "★",
    straightepsilon: "ϵ",
    straightphi: "ϕ",
    strns: "¯",
    Sub: "⋐",
    sub: "⊂",
    subdot: "⪽",
    subE: "⫅",
    sube: "⊆",
    subedot: "⫃",
    submult: "⫁",
    subnE: "⫋",
    subne: "⊊",
    subplus: "⪿",
    subrarr: "⥹",
    Subset: "⋐",
    subset: "⊂",
    subseteq: "⊆",
    subseteqq: "⫅",
    SubsetEqual: "⊆",
    subsetneq: "⊊",
    subsetneqq: "⫋",
    subsim: "⫇",
    subsub: "⫕",
    subsup: "⫓",
    succ: "≻",
    succapprox: "⪸",
    succcurlyeq: "≽",
    Succeeds: "≻",
    SucceedsEqual: "⪰",
    SucceedsSlantEqual: "≽",
    SucceedsTilde: "≿",
    succeq: "⪰",
    succnapprox: "⪺",
    succneqq: "⪶",
    succnsim: "⋩",
    succsim: "≿",
    SuchThat: "∋",
    Sum: "∑",
    sum: "∑",
    sung: "♪",
    Sup: "⋑",
    sup: "⊃",
    sup1: "¹",
    sup2: "²",
    sup3: "³",
    supdot: "⪾",
    supdsub: "⫘",
    supE: "⫆",
    supe: "⊇",
    supedot: "⫄",
    Superset: "⊃",
    SupersetEqual: "⊇",
    suphsol: "⟉",
    suphsub: "⫗",
    suplarr: "⥻",
    supmult: "⫂",
    supnE: "⫌",
    supne: "⊋",
    supplus: "⫀",
    Supset: "⋑",
    supset: "⊃",
    supseteq: "⊇",
    supseteqq: "⫆",
    supsetneq: "⊋",
    supsetneqq: "⫌",
    supsim: "⫈",
    supsub: "⫔",
    supsup: "⫖",
    swarhk: "⤦",
    swArr: "⇙",
    swarr: "↙",
    swarrow: "↙",
    swnwar: "⤪",
    szlig: "ß",
    Tab: "	",
    target: "⌖",
    Tau: "Τ",
    tau: "τ",
    tbrk: "⎴",
    Tcaron: "Ť",
    tcaron: "ť",
    Tcedil: "Ţ",
    tcedil: "ţ",
    Tcy: "Т",
    tcy: "т",
    tdot: "⃛",
    telrec: "⌕",
    Tfr: "𝔗",
    tfr: "𝔱",
    there4: "∴",
    Therefore: "∴",
    therefore: "∴",
    Theta: "Θ",
    theta: "θ",
    thetasym: "ϑ",
    thetav: "ϑ",
    thickapprox: "≈",
    thicksim: "∼",
    ThickSpace: "  ",
    thinsp: " ",
    ThinSpace: " ",
    thkap: "≈",
    thksim: "∼",
    THORN: "Þ",
    thorn: "þ",
    Tilde: "∼",
    tilde: "˜",
    TildeEqual: "≃",
    TildeFullEqual: "≅",
    TildeTilde: "≈",
    times: "×",
    timesb: "⊠",
    timesbar: "⨱",
    timesd: "⨰",
    tint: "∭",
    toea: "⤨",
    top: "⊤",
    topbot: "⌶",
    topcir: "⫱",
    Topf: "𝕋",
    topf: "𝕥",
    topfork: "⫚",
    tosa: "⤩",
    tprime: "‴",
    TRADE: "™",
    trade: "™",
    triangle: "▵",
    triangledown: "▿",
    triangleleft: "◃",
    trianglelefteq: "⊴",
    triangleq: "≜",
    triangleright: "▹",
    trianglerighteq: "⊵",
    tridot: "◬",
    trie: "≜",
    triminus: "⨺",
    TripleDot: "⃛",
    triplus: "⨹",
    trisb: "⧍",
    tritime: "⨻",
    trpezium: "⏢",
    Tscr: "𝒯",
    tscr: "𝓉",
    TScy: "Ц",
    tscy: "ц",
    TSHcy: "Ћ",
    tshcy: "ћ",
    Tstrok: "Ŧ",
    tstrok: "ŧ",
    twixt: "≬",
    twoheadleftarrow: "↞",
    twoheadrightarrow: "↠",
    Uacute: "Ú",
    uacute: "ú",
    Uarr: "↟",
    uArr: "⇑",
    uarr: "↑",
    Uarrocir: "⥉",
    Ubrcy: "Ў",
    ubrcy: "ў",
    Ubreve: "Ŭ",
    ubreve: "ŭ",
    Ucirc: "Û",
    ucirc: "û",
    Ucy: "У",
    ucy: "у",
    udarr: "⇅",
    Udblac: "Ű",
    udblac: "ű",
    udhar: "⥮",
    ufisht: "⥾",
    Ufr: "𝔘",
    ufr: "𝔲",
    Ugrave: "Ù",
    ugrave: "ù",
    uHar: "⥣",
    uharl: "↿",
    uharr: "↾",
    uhblk: "▀",
    ulcorn: "⌜",
    ulcorner: "⌜",
    ulcrop: "⌏",
    ultri: "◸",
    Umacr: "Ū",
    umacr: "ū",
    uml: "¨",
    UnderBar: "_",
    UnderBrace: "⏟",
    UnderBracket: "⎵",
    UnderParenthesis: "⏝",
    Union: "⋃",
    UnionPlus: "⊎",
    Uogon: "Ų",
    uogon: "ų",
    Uopf: "𝕌",
    uopf: "𝕦",
    UpArrow: "↑",
    Uparrow: "⇑",
    uparrow: "↑",
    UpArrowBar: "⤒",
    UpArrowDownArrow: "⇅",
    UpDownArrow: "↕",
    Updownarrow: "⇕",
    updownarrow: "↕",
    UpEquilibrium: "⥮",
    upharpoonleft: "↿",
    upharpoonright: "↾",
    uplus: "⊎",
    UpperLeftArrow: "↖",
    UpperRightArrow: "↗",
    Upsi: "ϒ",
    upsi: "υ",
    upsih: "ϒ",
    Upsilon: "Υ",
    upsilon: "υ",
    UpTee: "⊥",
    UpTeeArrow: "↥",
    upuparrows: "⇈",
    urcorn: "⌝",
    urcorner: "⌝",
    urcrop: "⌎",
    Uring: "Ů",
    uring: "ů",
    urtri: "◹",
    Uscr: "𝒰",
    uscr: "𝓊",
    utdot: "⋰",
    Utilde: "Ũ",
    utilde: "ũ",
    utri: "▵",
    utrif: "▴",
    uuarr: "⇈",
    Uuml: "Ü",
    uuml: "ü",
    uwangle: "⦧",
    vangrt: "⦜",
    varepsilon: "ϵ",
    varkappa: "ϰ",
    varnothing: "∅",
    varphi: "ϕ",
    varpi: "ϖ",
    varpropto: "∝",
    vArr: "⇕",
    varr: "↕",
    varrho: "ϱ",
    varsigma: "ς",
    varsubsetneq: "⊊︀",
    varsubsetneqq: "⫋︀",
    varsupsetneq: "⊋︀",
    varsupsetneqq: "⫌︀",
    vartheta: "ϑ",
    vartriangleleft: "⊲",
    vartriangleright: "⊳",
    Vbar: "⫫",
    vBar: "⫨",
    vBarv: "⫩",
    Vcy: "В",
    vcy: "в",
    VDash: "⊫",
    Vdash: "⊩",
    vDash: "⊨",
    vdash: "⊢",
    Vdashl: "⫦",
    Vee: "⋁",
    vee: "∨",
    veebar: "⊻",
    veeeq: "≚",
    vellip: "⋮",
    Verbar: "‖",
    verbar: "|",
    Vert: "‖",
    vert: "|",
    VerticalBar: "∣",
    VerticalLine: "|",
    VerticalSeparator: "❘",
    VerticalTilde: "≀",
    VeryThinSpace: " ",
    Vfr: "𝔙",
    vfr: "𝔳",
    vltri: "⊲",
    vnsub: "⊂⃒",
    vnsup: "⊃⃒",
    Vopf: "𝕍",
    vopf: "𝕧",
    vprop: "∝",
    vrtri: "⊳",
    Vscr: "𝒱",
    vscr: "𝓋",
    vsubnE: "⫋︀",
    vsubne: "⊊︀",
    vsupnE: "⫌︀",
    vsupne: "⊋︀",
    Vvdash: "⊪",
    vzigzag: "⦚",
    Wcirc: "Ŵ",
    wcirc: "ŵ",
    wedbar: "⩟",
    Wedge: "⋀",
    wedge: "∧",
    wedgeq: "≙",
    weierp: "℘",
    Wfr: "𝔚",
    wfr: "𝔴",
    Wopf: "𝕎",
    wopf: "𝕨",
    wp: "℘",
    wr: "≀",
    wreath: "≀",
    Wscr: "𝒲",
    wscr: "𝓌",
    xcap: "⋂",
    xcirc: "◯",
    xcup: "⋃",
    xdtri: "▽",
    Xfr: "𝔛",
    xfr: "𝔵",
    xhArr: "⟺",
    xharr: "⟷",
    Xi: "Ξ",
    xi: "ξ",
    xlArr: "⟸",
    xlarr: "⟵",
    xmap: "⟼",
    xnis: "⋻",
    xodot: "⨀",
    Xopf: "𝕏",
    xopf: "𝕩",
    xoplus: "⨁",
    xotime: "⨂",
    xrArr: "⟹",
    xrarr: "⟶",
    Xscr: "𝒳",
    xscr: "𝓍",
    xsqcup: "⨆",
    xuplus: "⨄",
    xutri: "△",
    xvee: "⋁",
    xwedge: "⋀",
    Yacute: "Ý",
    yacute: "ý",
    YAcy: "Я",
    yacy: "я",
    Ycirc: "Ŷ",
    ycirc: "ŷ",
    Ycy: "Ы",
    ycy: "ы",
    yen: "¥",
    Yfr: "𝔜",
    yfr: "𝔶",
    YIcy: "Ї",
    yicy: "ї",
    Yopf: "𝕐",
    yopf: "𝕪",
    Yscr: "𝒴",
    yscr: "𝓎",
    YUcy: "Ю",
    yucy: "ю",
    Yuml: "Ÿ",
    yuml: "ÿ",
    Zacute: "Ź",
    zacute: "ź",
    Zcaron: "Ž",
    zcaron: "ž",
    Zcy: "З",
    zcy: "з",
    Zdot: "Ż",
    zdot: "ż",
    zeetrf: "ℨ",
    ZeroWidthSpace: "​",
    Zeta: "Ζ",
    zeta: "ζ",
    Zfr: "ℨ",
    zfr: "𝔷",
    ZHcy: "Ж",
    zhcy: "ж",
    zigrarr: "⇝",
    Zopf: "ℤ",
    zopf: "𝕫",
    Zscr: "𝒵",
    zscr: "𝓏",
    zwj: "‍",
    zwnj: "‌"
  });
  exports.entityMap = exports.HTML_ENTITIES;
})(entities$2);
const entities$1 = /* @__PURE__ */ getDefaultExportFromCjs(entities$2);
var sax$1 = {};
var NAMESPACE$1 = conventions$2.NAMESPACE;
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
var nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$");
var S_TAG = 0;
var S_ATTR = 1;
var S_ATTR_SPACE = 2;
var S_EQ = 3;
var S_ATTR_NOQUOT_VALUE = 4;
var S_ATTR_END = 5;
var S_TAG_SPACE = 6;
var S_TAG_CLOSE = 7;
function ParseError$1(message, locator) {
  this.message = message;
  this.locator = locator;
  if (Error.captureStackTrace)
    Error.captureStackTrace(this, ParseError$1);
}
ParseError$1.prototype = new Error();
ParseError$1.prototype.name = ParseError$1.name;
function XMLReader$1() {
}
XMLReader$1.prototype = {
  parse: function(source, defaultNSMap, entityMap) {
    var domBuilder = this.domBuilder;
    domBuilder.startDocument();
    _copy(defaultNSMap, defaultNSMap = {});
    parse(
      source,
      defaultNSMap,
      entityMap,
      domBuilder,
      this.errorHandler
    );
    domBuilder.endDocument();
  }
};
function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
  function fixedFromCharCode(code) {
    if (code > 65535) {
      code -= 65536;
      var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
      return String.fromCharCode(surrogate1, surrogate2);
    } else {
      return String.fromCharCode(code);
    }
  }
  function entityReplacer(a2) {
    var k = a2.slice(1, -1);
    if (Object.hasOwnProperty.call(entityMap, k)) {
      return entityMap[k];
    } else if (k.charAt(0) === "#") {
      return fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x")));
    } else {
      errorHandler.error("entity not found:" + a2);
      return a2;
    }
  }
  function appendText(end2) {
    if (end2 > start) {
      var xt = source.substring(start, end2).replace(/&#?\w+;/g, entityReplacer);
      locator && position2(start);
      domBuilder.characters(xt, 0, end2 - start);
      start = end2;
    }
  }
  function position2(p, m) {
    while (p >= lineEnd && (m = linePattern.exec(source))) {
      lineStart = m.index;
      lineEnd = lineStart + m[0].length;
      locator.lineNumber++;
    }
    locator.columnNumber = p - lineStart + 1;
  }
  var lineStart = 0;
  var lineEnd = 0;
  var linePattern = /.*(?:\r\n?|\n)|.*$/g;
  var locator = domBuilder.locator;
  var parseStack = [{ currentNSMap: defaultNSMapCopy }];
  var closeMap = {};
  var start = 0;
  while (true) {
    try {
      var tagStart = source.indexOf("<", start);
      if (tagStart < 0) {
        if (!source.substr(start).match(/^\s*$/)) {
          var doc = domBuilder.doc;
          var text = doc.createTextNode(source.substr(start));
          doc.appendChild(text);
          domBuilder.currentElement = text;
        }
        return;
      }
      if (tagStart > start) {
        appendText(tagStart);
      }
      switch (source.charAt(tagStart + 1)) {
        case "/":
          var end = source.indexOf(">", tagStart + 3);
          var tagName = source.substring(tagStart + 2, end).replace(/[ \t\n\r]+$/g, "");
          var config = parseStack.pop();
          if (end < 0) {
            tagName = source.substring(tagStart + 2).replace(/[\s<].*/, "");
            errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName);
            end = tagStart + 1 + tagName.length;
          } else if (tagName.match(/\s</)) {
            tagName = tagName.replace(/[\s<].*/, "");
            errorHandler.error("end tag name: " + tagName + " maybe not complete");
            end = tagStart + 1 + tagName.length;
          }
          var localNSMap = config.localNSMap;
          var endMatch = config.tagName == tagName;
          var endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
          if (endIgnoreCaseMach) {
            domBuilder.endElement(config.uri, config.localName, tagName);
            if (localNSMap) {
              for (var prefix in localNSMap) {
                if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
                  domBuilder.endPrefixMapping(prefix);
                }
              }
            }
            if (!endMatch) {
              errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
            }
          } else {
            parseStack.push(config);
          }
          end++;
          break;
        case "?":
          locator && position2(tagStart);
          end = parseInstruction(source, tagStart, domBuilder);
          break;
        case "!":
          locator && position2(tagStart);
          end = parseDCC(source, tagStart, domBuilder, errorHandler);
          break;
        default:
          locator && position2(tagStart);
          var el = new ElementAttributes();
          var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
          var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler);
          var len = el.length;
          if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap)) {
            el.closed = true;
            if (!entityMap.nbsp) {
              errorHandler.warning("unclosed xml attribute");
            }
          }
          if (locator && len) {
            var locator2 = copyLocator(locator, {});
            for (var i = 0; i < len; i++) {
              var a = el[i];
              position2(a.offset);
              a.locator = copyLocator(locator, {});
            }
            domBuilder.locator = locator2;
            if (appendElement$1(el, domBuilder, currentNSMap)) {
              parseStack.push(el);
            }
            domBuilder.locator = locator;
          } else {
            if (appendElement$1(el, domBuilder, currentNSMap)) {
              parseStack.push(el);
            }
          }
          if (NAMESPACE$1.isHTML(el.uri) && !el.closed) {
            end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
          } else {
            end++;
          }
      }
    } catch (e) {
      if (e instanceof ParseError$1) {
        throw e;
      }
      errorHandler.error("element parse error: " + e);
      end = -1;
    }
    if (end > start) {
      start = end;
    } else {
      appendText(Math.max(tagStart, start) + 1);
    }
  }
}
function copyLocator(f, t) {
  t.lineNumber = f.lineNumber;
  t.columnNumber = f.columnNumber;
  return t;
}
function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
  function addAttribute(qname, value2, startIndex) {
    if (el.attributeNames.hasOwnProperty(qname)) {
      errorHandler.fatalError("Attribute " + qname + " redefined");
    }
    el.addValue(
      qname,
      // @see https://www.w3.org/TR/xml/#AVNormalize
      // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
      // - recursive replacement of (DTD) entity references
      // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
      value2.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, entityReplacer),
      startIndex
    );
  }
  var attrName;
  var value;
  var p = ++start;
  var s = S_TAG;
  while (true) {
    var c = source.charAt(p);
    switch (c) {
      case "=":
        if (s === S_ATTR) {
          attrName = source.slice(start, p);
          s = S_EQ;
        } else if (s === S_ATTR_SPACE) {
          s = S_EQ;
        } else {
          throw new Error("attribute equal must after attrName");
        }
        break;
      case "'":
      case '"':
        if (s === S_EQ || s === S_ATTR) {
          if (s === S_ATTR) {
            errorHandler.warning('attribute value must after "="');
            attrName = source.slice(start, p);
          }
          start = p + 1;
          p = source.indexOf(c, start);
          if (p > 0) {
            value = source.slice(start, p);
            addAttribute(attrName, value, start - 1);
            s = S_ATTR_END;
          } else {
            throw new Error("attribute value no end '" + c + "' match");
          }
        } else if (s == S_ATTR_NOQUOT_VALUE) {
          value = source.slice(start, p);
          addAttribute(attrName, value, start);
          errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
          start = p + 1;
          s = S_ATTR_END;
        } else {
          throw new Error('attribute value must after "="');
        }
        break;
      case "/":
        switch (s) {
          case S_TAG:
            el.setTagName(source.slice(start, p));
          case S_ATTR_END:
          case S_TAG_SPACE:
          case S_TAG_CLOSE:
            s = S_TAG_CLOSE;
            el.closed = true;
          case S_ATTR_NOQUOT_VALUE:
          case S_ATTR:
            break;
          case S_ATTR_SPACE:
            el.closed = true;
            break;
          default:
            throw new Error("attribute invalid close char('/')");
        }
        break;
      case "":
        errorHandler.error("unexpected end of input");
        if (s == S_TAG) {
          el.setTagName(source.slice(start, p));
        }
        return p;
      case ">":
        switch (s) {
          case S_TAG:
            el.setTagName(source.slice(start, p));
          case S_ATTR_END:
          case S_TAG_SPACE:
          case S_TAG_CLOSE:
            break;
          case S_ATTR_NOQUOT_VALUE:
          case S_ATTR:
            value = source.slice(start, p);
            if (value.slice(-1) === "/") {
              el.closed = true;
              value = value.slice(0, -1);
            }
          case S_ATTR_SPACE:
            if (s === S_ATTR_SPACE) {
              value = attrName;
            }
            if (s == S_ATTR_NOQUOT_VALUE) {
              errorHandler.warning('attribute "' + value + '" missed quot(")!');
              addAttribute(attrName, value, start);
            } else {
              if (!NAMESPACE$1.isHTML(currentNSMap[""]) || !value.match(/^(?:disabled|checked|selected)$/i)) {
                errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
              }
              addAttribute(value, value, start);
            }
            break;
          case S_EQ:
            throw new Error("attribute value missed!!");
        }
        return p;
      case "":
        c = " ";
      default:
        if (c <= " ") {
          switch (s) {
            case S_TAG:
              el.setTagName(source.slice(start, p));
              s = S_TAG_SPACE;
              break;
            case S_ATTR:
              attrName = source.slice(start, p);
              s = S_ATTR_SPACE;
              break;
            case S_ATTR_NOQUOT_VALUE:
              var value = source.slice(start, p);
              errorHandler.warning('attribute "' + value + '" missed quot(")!!');
              addAttribute(attrName, value, start);
            case S_ATTR_END:
              s = S_TAG_SPACE;
              break;
          }
        } else {
          switch (s) {
            case S_ATTR_SPACE:
              var tagName = el.tagName;
              if (!NAMESPACE$1.isHTML(currentNSMap[""]) || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
                errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
              }
              addAttribute(attrName, attrName, start);
              start = p;
              s = S_ATTR;
              break;
            case S_ATTR_END:
              errorHandler.warning('attribute space is required"' + attrName + '"!!');
            case S_TAG_SPACE:
              s = S_ATTR;
              start = p;
              break;
            case S_EQ:
              s = S_ATTR_NOQUOT_VALUE;
              start = p;
              break;
            case S_TAG_CLOSE:
              throw new Error("elements closed character '/' and '>' must be connected to");
          }
        }
    }
    p++;
  }
}
function appendElement$1(el, domBuilder, currentNSMap) {
  var tagName = el.tagName;
  var localNSMap = null;
  var i = el.length;
  while (i--) {
    var a = el[i];
    var qName = a.qName;
    var value = a.value;
    var nsp = qName.indexOf(":");
    if (nsp > 0) {
      var prefix = a.prefix = qName.slice(0, nsp);
      var localName = qName.slice(nsp + 1);
      var nsPrefix = prefix === "xmlns" && localName;
    } else {
      localName = qName;
      prefix = null;
      nsPrefix = qName === "xmlns" && "";
    }
    a.localName = localName;
    if (nsPrefix !== false) {
      if (localNSMap == null) {
        localNSMap = {};
        _copy(currentNSMap, currentNSMap = {});
      }
      currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
      a.uri = NAMESPACE$1.XMLNS;
      domBuilder.startPrefixMapping(nsPrefix, value);
    }
  }
  var i = el.length;
  while (i--) {
    a = el[i];
    var prefix = a.prefix;
    if (prefix) {
      if (prefix === "xml") {
        a.uri = NAMESPACE$1.XML;
      }
      if (prefix !== "xmlns") {
        a.uri = currentNSMap[prefix || ""];
      }
    }
  }
  var nsp = tagName.indexOf(":");
  if (nsp > 0) {
    prefix = el.prefix = tagName.slice(0, nsp);
    localName = el.localName = tagName.slice(nsp + 1);
  } else {
    prefix = null;
    localName = el.localName = tagName;
  }
  var ns = el.uri = currentNSMap[prefix || ""];
  domBuilder.startElement(ns, localName, tagName, el);
  if (el.closed) {
    domBuilder.endElement(ns, localName, tagName);
    if (localNSMap) {
      for (prefix in localNSMap) {
        if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
          domBuilder.endPrefixMapping(prefix);
        }
      }
    }
  } else {
    el.currentNSMap = currentNSMap;
    el.localNSMap = localNSMap;
    return true;
  }
}
function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
  if (/^(?:script|textarea)$/i.test(tagName)) {
    var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
    var text = source.substring(elStartEnd + 1, elEndStart);
    if (/[&<]/.test(text)) {
      if (/^script$/i.test(tagName)) {
        domBuilder.characters(text, 0, text.length);
        return elEndStart;
      }
      text = text.replace(/&#?\w+;/g, entityReplacer);
      domBuilder.characters(text, 0, text.length);
      return elEndStart;
    }
  }
  return elStartEnd + 1;
}
function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
  var pos = closeMap[tagName];
  if (pos == null) {
    pos = source.lastIndexOf("</" + tagName + ">");
    if (pos < elStartEnd) {
      pos = source.lastIndexOf("</" + tagName);
    }
    closeMap[tagName] = pos;
  }
  return pos < elStartEnd;
}
function _copy(source, target) {
  for (var n in source) {
    if (Object.prototype.hasOwnProperty.call(source, n)) {
      target[n] = source[n];
    }
  }
}
function parseDCC(source, start, domBuilder, errorHandler) {
  var next = source.charAt(start + 2);
  switch (next) {
    case "-":
      if (source.charAt(start + 3) === "-") {
        var end = source.indexOf("-->", start + 4);
        if (end > start) {
          domBuilder.comment(source, start + 4, end - start - 4);
          return end + 3;
        } else {
          errorHandler.error("Unclosed comment");
          return -1;
        }
      } else {
        return -1;
      }
    default:
      if (source.substr(start + 3, 6) == "CDATA[") {
        var end = source.indexOf("]]>", start + 9);
        domBuilder.startCDATA();
        domBuilder.characters(source, start + 9, end - start - 9);
        domBuilder.endCDATA();
        return end + 3;
      }
      var matchs = split(source, start);
      var len = matchs.length;
      if (len > 1 && /!doctype/i.test(matchs[0][0])) {
        var name2 = matchs[1][0];
        var pubid = false;
        var sysid = false;
        if (len > 3) {
          if (/^public$/i.test(matchs[2][0])) {
            pubid = matchs[3][0];
            sysid = len > 4 && matchs[4][0];
          } else if (/^system$/i.test(matchs[2][0])) {
            sysid = matchs[3][0];
          }
        }
        var lastMatch = matchs[len - 1];
        domBuilder.startDTD(name2, pubid, sysid);
        domBuilder.endDTD();
        return lastMatch.index + lastMatch[0].length;
      }
  }
  return -1;
}
function parseInstruction(source, start, domBuilder) {
  var end = source.indexOf("?>", start);
  if (end) {
    var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
    if (match) {
      var len = match[0].length;
      domBuilder.processingInstruction(match[1], match[2]);
      return end + 2;
    } else {
      return -1;
    }
  }
  return -1;
}
function ElementAttributes() {
  this.attributeNames = {};
}
ElementAttributes.prototype = {
  setTagName: function(tagName) {
    if (!tagNamePattern.test(tagName)) {
      throw new Error("invalid tagName:" + tagName);
    }
    this.tagName = tagName;
  },
  addValue: function(qName, value, offset) {
    if (!tagNamePattern.test(qName)) {
      throw new Error("invalid attribute:" + qName);
    }
    this.attributeNames[qName] = this.length;
    this[this.length++] = { qName, value, offset };
  },
  length: 0,
  getLocalName: function(i) {
    return this[i].localName;
  },
  getLocator: function(i) {
    return this[i].locator;
  },
  getQName: function(i) {
    return this[i].qName;
  },
  getURI: function(i) {
    return this[i].uri;
  },
  getValue: function(i) {
    return this[i].value;
  }
  //	,getIndex:function(uri, localName)){
  //		if(localName){
  //
  //		}else{
  //			var qName = uri
  //		}
  //	},
  //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
  //	getType:function(uri,localName){}
  //	getType:function(i){},
};
function split(source, start) {
  var match;
  var buf = [];
  var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
  reg.lastIndex = start;
  reg.exec(source);
  while (match = reg.exec(source)) {
    buf.push(match);
    if (match[1])
      return buf;
  }
}
var XMLReader_1 = sax$1.XMLReader = XMLReader$1;
var ParseError_1 = sax$1.ParseError = ParseError$1;
var conventions = conventions$2;
var dom$1 = dom$2;
var entities = entities$2;
var sax = sax$1;
var DOMImplementation$1 = dom$1.DOMImplementation;
var NAMESPACE = conventions.NAMESPACE;
var ParseError = sax.ParseError;
var XMLReader = sax.XMLReader;
function normalizeLineEndings(input) {
  return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028]/g, "\n");
}
function DOMParser$1(options) {
  this.options = options || { locator: {} };
}
DOMParser$1.prototype.parseFromString = function(source, mimeType) {
  var options = this.options;
  var sax2 = new XMLReader();
  var domBuilder = options.domBuilder || new DOMHandler();
  var errorHandler = options.errorHandler;
  var locator = options.locator;
  var defaultNSMap = options.xmlns || {};
  var isHTML = /\/x?html?$/.test(mimeType);
  var entityMap = isHTML ? entities.HTML_ENTITIES : entities.XML_ENTITIES;
  if (locator) {
    domBuilder.setDocumentLocator(locator);
  }
  sax2.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
  sax2.domBuilder = options.domBuilder || domBuilder;
  if (isHTML) {
    defaultNSMap[""] = NAMESPACE.HTML;
  }
  defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
  var normalize = options.normalizeLineEndings || normalizeLineEndings;
  if (source && typeof source === "string") {
    sax2.parse(
      normalize(source),
      defaultNSMap,
      entityMap
    );
  } else {
    sax2.errorHandler.error("invalid doc source");
  }
  return domBuilder.doc;
};
function buildErrorHandler(errorImpl, domBuilder, locator) {
  if (!errorImpl) {
    if (domBuilder instanceof DOMHandler) {
      return domBuilder;
    }
    errorImpl = domBuilder;
  }
  var errorHandler = {};
  var isCallback = errorImpl instanceof Function;
  locator = locator || {};
  function build(key) {
    var fn2 = errorImpl[key];
    if (!fn2 && isCallback) {
      fn2 = errorImpl.length == 2 ? function(msg) {
        errorImpl(key, msg);
      } : errorImpl;
    }
    errorHandler[key] = fn2 && function(msg) {
      fn2("[xmldom " + key + "]	" + msg + _locator(locator));
    } || function() {
    };
  }
  build("warning");
  build("error");
  build("fatalError");
  return errorHandler;
}
function DOMHandler() {
  this.cdata = false;
}
function position(locator, node) {
  node.lineNumber = locator.lineNumber;
  node.columnNumber = locator.columnNumber;
}
DOMHandler.prototype = {
  startDocument: function() {
    this.doc = new DOMImplementation$1().createDocument(null, null, null);
    if (this.locator) {
      this.doc.documentURI = this.locator.systemId;
    }
  },
  startElement: function(namespaceURI, localName, qName, attrs) {
    var doc = this.doc;
    var el = doc.createElementNS(namespaceURI, qName || localName);
    var len = attrs.length;
    appendElement(this, el);
    this.currentElement = el;
    this.locator && position(this.locator, el);
    for (var i = 0; i < len; i++) {
      var namespaceURI = attrs.getURI(i);
      var value = attrs.getValue(i);
      var qName = attrs.getQName(i);
      var attr = doc.createAttributeNS(namespaceURI, qName);
      this.locator && position(attrs.getLocator(i), attr);
      attr.value = attr.nodeValue = value;
      el.setAttributeNode(attr);
    }
  },
  endElement: function(namespaceURI, localName, qName) {
    var current = this.currentElement;
    var tagName = current.tagName;
    this.currentElement = current.parentNode;
  },
  startPrefixMapping: function(prefix, uri) {
  },
  endPrefixMapping: function(prefix) {
  },
  processingInstruction: function(target, data) {
    var ins = this.doc.createProcessingInstruction(target, data);
    this.locator && position(this.locator, ins);
    appendElement(this, ins);
  },
  ignorableWhitespace: function(ch, start, length) {
  },
  characters: function(chars, start, length) {
    chars = _toString.apply(this, arguments);
    if (chars) {
      if (this.cdata) {
        var charNode = this.doc.createCDATASection(chars);
      } else {
        var charNode = this.doc.createTextNode(chars);
      }
      if (this.currentElement) {
        this.currentElement.appendChild(charNode);
      } else if (/^\s*$/.test(chars)) {
        this.doc.appendChild(charNode);
      }
      this.locator && position(this.locator, charNode);
    }
  },
  skippedEntity: function(name2) {
  },
  endDocument: function() {
    this.doc.normalize();
  },
  setDocumentLocator: function(locator) {
    if (this.locator = locator) {
      locator.lineNumber = 0;
    }
  },
  //LexicalHandler
  comment: function(chars, start, length) {
    chars = _toString.apply(this, arguments);
    var comm = this.doc.createComment(chars);
    this.locator && position(this.locator, comm);
    appendElement(this, comm);
  },
  startCDATA: function() {
    this.cdata = true;
  },
  endCDATA: function() {
    this.cdata = false;
  },
  startDTD: function(name2, publicId, systemId) {
    var impl = this.doc.implementation;
    if (impl && impl.createDocumentType) {
      var dt = impl.createDocumentType(name2, publicId, systemId);
      this.locator && position(this.locator, dt);
      appendElement(this, dt);
      this.doc.doctype = dt;
    }
  },
  /**
   * @see org.xml.sax.ErrorHandler
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
   */
  warning: function(error) {
    console.warn("[xmldom warning]	" + error, _locator(this.locator));
  },
  error: function(error) {
    console.error("[xmldom error]	" + error, _locator(this.locator));
  },
  fatalError: function(error) {
    throw new ParseError(error, this.locator);
  }
};
function _locator(l) {
  if (l) {
    return "\n@" + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
  }
}
function _toString(chars, start, length) {
  if (typeof chars == "string") {
    return chars.substr(start, length);
  } else {
    if (chars.length >= start + length || start) {
      return new java.lang.String(chars, start, length) + "";
    }
    return chars;
  }
}
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(key) {
  DOMHandler.prototype[key] = function() {
    return null;
  };
});
function appendElement(hander, node) {
  if (!hander.currentElement) {
    hander.doc.appendChild(node);
  } else {
    hander.currentElement.appendChild(node);
  }
}
var __DOMHandler = domParser.__DOMHandler = DOMHandler;
var normalizeLineEndings_1 = domParser.normalizeLineEndings = normalizeLineEndings;
var DOMParser_1 = domParser.DOMParser = DOMParser$1;
var dom = dom$2;
var DOMImplementation = lib.DOMImplementation = dom.DOMImplementation;
var XMLSerializer = lib.XMLSerializer = dom.XMLSerializer;
var DOMParser = lib.DOMParser = domParser.DOMParser;
function pluginHookResponseFilter(filter, text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const filtered = `${xpath.select(filter, doc)}`;
  console.log("FILTERED", filtered);
  return { filtered };
}
export {
  pluginHookResponseFilter
};
