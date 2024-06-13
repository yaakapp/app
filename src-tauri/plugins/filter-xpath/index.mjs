function $t(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var nt = {};
(function(t) {
  var u = t;
  (function(n) {
    var s = "__namespace", c = function(e) {
      return e == null;
    }, f = function(e) {
      return e === s || Number.isInteger(e) && e >= 1 && e <= 11;
    }, A = function(e) {
      return e && f(e.nodeType) && typeof e.nodeName == "string";
    };
    function y(e) {
      var r = Array.prototype.slice, o = e.length, a = function(l, g) {
        return function() {
          return g.apply(this, l.concat(r.call(arguments)));
        };
      }, i = function() {
        var l = r.call(arguments);
        return l.length < o ? a(l, i) : e.apply(this, r.apply(arguments, [0, o]));
      };
      return i;
    }
    var N = function(e, r) {
      for (var o = 0; o < r.length; o += 1)
        e(r[o], o, r);
    }, w = function(e, r, o) {
      var a = r;
      return N(function(i, l) {
        a = e(a, i, l);
      }, o), a;
    }, S = function(e, r) {
      var o = new Array(r.length);
      return N(function(a, i) {
        o[i] = e(a);
      }, r), o;
    }, k = function(e, r) {
      var o = [];
      return N(function(a, i) {
        e(a, i) && o.push(a);
      }, r), o;
    }, q = function(e, r) {
      for (var o = 0; o < e.length; o += 1)
        if (e[o] === r)
          return !0;
      return !1;
    };
    function $(e) {
      return function() {
        return e;
      };
    }
    function J(e) {
      return e.toString();
    }
    var H = function(e, r) {
      return r.join(e);
    }, G = function(e, r, o) {
      return e + o + r;
    }, Q = Array.prototype.concat, He = function(e, r) {
      var o = new m();
      o.addArray(e);
      var a = o.toArray();
      return r ? a.reverse() : a;
    }, Y = 32767;
    function te(e) {
      for (var r = [], o = 0; o < e.length; o += Y) {
        var a = e.slice(o, o + Y);
        r = Q.apply(r, a);
      }
      return r;
    }
    function Se(e, r) {
      for (var o = Object(e), a = 1; a < arguments.length; a++) {
        var i = arguments[a];
        if (i != null)
          for (var l in i)
            Object.prototype.hasOwnProperty.call(i, l) && (o[l] = i[l]);
      }
      return o;
    }
    var x = {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NAMESPACE_NODE: s
    };
    p.prototype = new Object(), p.prototype.constructor = p, p.superclass = Object.prototype;
    function p() {
      this.init();
    }
    p.prototype.init = function() {
      this.reduceActions = [], this.reduceActions[3] = function(e) {
        return new ue(e[0], e[2]);
      }, this.reduceActions[5] = function(e) {
        return new pe(e[0], e[2]);
      }, this.reduceActions[7] = function(e) {
        return new M(e[0], e[2]);
      }, this.reduceActions[8] = function(e) {
        return new j(e[0], e[2]);
      }, this.reduceActions[10] = function(e) {
        return new ce(e[0], e[2]);
      }, this.reduceActions[11] = function(e) {
        return new Ae(e[0], e[2]);
      }, this.reduceActions[12] = function(e) {
        return new De(e[0], e[2]);
      }, this.reduceActions[13] = function(e) {
        return new ge(e[0], e[2]);
      }, this.reduceActions[15] = function(e) {
        return new de(e[0], e[2]);
      }, this.reduceActions[16] = function(e) {
        return new me(e[0], e[2]);
      }, this.reduceActions[18] = function(e) {
        return new Ne(e[0], e[2]);
      }, this.reduceActions[19] = function(e) {
        return new ve(e[0], e[2]);
      }, this.reduceActions[20] = function(e) {
        return new xe(e[0], e[2]);
      }, this.reduceActions[22] = function(e) {
        return new le(e[1]);
      }, this.reduceActions[24] = function(e) {
        return new Ce(e[0], e[2]);
      }, this.reduceActions[25] = function(e) {
        return new _(void 0, void 0, e[0]);
      }, this.reduceActions[27] = function(e) {
        return e[0].locationPath = e[2], e[0];
      }, this.reduceActions[28] = function(e) {
        return e[0].locationPath = e[2], e[0].locationPath.steps.unshift(new E(E.DESCENDANTORSELF, d.nodeTest, [])), e[0];
      }, this.reduceActions[29] = function(e) {
        return new _(e[0], [], void 0);
      }, this.reduceActions[30] = function(e) {
        return v.instance_of(e[0], _) ? (e[0].filterPredicates == null && (e[0].filterPredicates = []), e[0].filterPredicates.push(e[1]), e[0]) : new _(e[0], [e[1]], void 0);
      }, this.reduceActions[32] = function(e) {
        return e[1];
      }, this.reduceActions[33] = function(e) {
        return new T(e[0]);
      }, this.reduceActions[34] = function(e) {
        return new b(e[0]);
      }, this.reduceActions[36] = function(e) {
        return new ye(e[0], []);
      }, this.reduceActions[37] = function(e) {
        return new ye(e[0], e[2]);
      }, this.reduceActions[38] = function(e) {
        return [e[0]];
      }, this.reduceActions[39] = function(e) {
        return e[2].unshift(e[0]), e[2];
      }, this.reduceActions[43] = function(e) {
        return new Oe(!0, []);
      }, this.reduceActions[44] = function(e) {
        return e[1].absolute = !0, e[1];
      }, this.reduceActions[46] = function(e) {
        return new Oe(!1, [e[0]]);
      }, this.reduceActions[47] = function(e) {
        return e[0].steps.push(e[2]), e[0];
      }, this.reduceActions[49] = function(e) {
        return new E(e[0], e[1], []);
      }, this.reduceActions[50] = function(e) {
        return new E(E.CHILD, e[0], []);
      }, this.reduceActions[51] = function(e) {
        return new E(e[0], e[1], e[2]);
      }, this.reduceActions[52] = function(e) {
        return new E(E.CHILD, e[0], e[1]);
      }, this.reduceActions[54] = function(e) {
        return [e[0]];
      }, this.reduceActions[55] = function(e) {
        return e[1].unshift(e[0]), e[1];
      }, this.reduceActions[56] = function(e) {
        return e[0] == "ancestor" ? E.ANCESTOR : e[0] == "ancestor-or-self" ? E.ANCESTORORSELF : e[0] == "attribute" ? E.ATTRIBUTE : e[0] == "child" ? E.CHILD : e[0] == "descendant" ? E.DESCENDANT : e[0] == "descendant-or-self" ? E.DESCENDANTORSELF : e[0] == "following" ? E.FOLLOWING : e[0] == "following-sibling" ? E.FOLLOWINGSIBLING : e[0] == "namespace" ? E.NAMESPACE : e[0] == "parent" ? E.PARENT : e[0] == "preceding" ? E.PRECEDING : e[0] == "preceding-sibling" ? E.PRECEDINGSIBLING : e[0] == "self" ? E.SELF : -1;
      }, this.reduceActions[57] = function(e) {
        return E.ATTRIBUTE;
      }, this.reduceActions[59] = function(e) {
        return e[0] == "comment" ? d.commentTest : e[0] == "text" ? d.textTest : e[0] == "processing-instruction" ? d.anyPiTest : e[0] == "node" ? d.nodeTest : new d(-1, void 0);
      }, this.reduceActions[60] = function(e) {
        return new d.PITest(e[2]);
      }, this.reduceActions[61] = function(e) {
        return e[1];
      }, this.reduceActions[63] = function(e) {
        return e[1].absolute = !0, e[1].steps.unshift(new E(E.DESCENDANTORSELF, d.nodeTest, [])), e[1];
      }, this.reduceActions[64] = function(e) {
        return e[0].steps.push(new E(E.DESCENDANTORSELF, d.nodeTest, [])), e[0].steps.push(e[2]), e[0];
      }, this.reduceActions[65] = function(e) {
        return new E(E.SELF, d.nodeTest, []);
      }, this.reduceActions[66] = function(e) {
        return new E(E.PARENT, d.nodeTest, []);
      }, this.reduceActions[67] = function(e) {
        return new Fe(e[1]);
      }, this.reduceActions[68] = function(e) {
        return d.nameTestAny;
      }, this.reduceActions[69] = function(e) {
        return new d.NameTestPrefixAny(e[0].split(":")[0]);
      }, this.reduceActions[70] = function(e) {
        return new d.NameTestQName(e[0]);
      };
    }, p.actionTable = [
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
    ], p.actionTableNumber = [
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
    ], p.gotoTable = [
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
    ], p.productions = [
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
    ], p.DOUBLEDOT = 2, p.DOUBLECOLON = 3, p.DOUBLESLASH = 4, p.NOTEQUAL = 5, p.LESSTHANOREQUAL = 6, p.GREATERTHANOREQUAL = 7, p.AND = 8, p.OR = 9, p.MOD = 10, p.DIV = 11, p.MULTIPLYOPERATOR = 12, p.FUNCTIONNAME = 13, p.AXISNAME = 14, p.LITERAL = 15, p.NUMBER = 16, p.ASTERISKNAMETEST = 17, p.QNAME = 18, p.NCNAMECOLONASTERISK = 19, p.NODETYPE = 20, p.PROCESSINGINSTRUCTIONWITHLITERAL = 21, p.EQUALS = 22, p.LESSTHAN = 23, p.GREATERTHAN = 24, p.PLUS = 25, p.MINUS = 26, p.BAR = 27, p.SLASH = 28, p.LEFTPARENTHESIS = 29, p.RIGHTPARENTHESIS = 30, p.COMMA = 31, p.AT = 32, p.LEFTBRACKET = 33, p.RIGHTBRACKET = 34, p.DOT = 35, p.DOLLAR = 36, p.prototype.tokenize = function(e) {
      for (var r = [], o = [], a = e + "\0", i = 0, l = a.charAt(i++); ; ) {
        for (; l == " " || l == "	" || l == "\r" || l == `
`; )
          l = a.charAt(i++);
        if (l == "\0" || i >= a.length)
          break;
        if (l == "(") {
          r.push(p.LEFTPARENTHESIS), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == ")") {
          r.push(p.RIGHTPARENTHESIS), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "[") {
          r.push(p.LEFTBRACKET), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "]") {
          r.push(p.RIGHTBRACKET), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "@") {
          r.push(p.AT), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == ",") {
          r.push(p.COMMA), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "|") {
          r.push(p.BAR), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "+") {
          r.push(p.PLUS), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "-") {
          r.push(p.MINUS), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "=") {
          r.push(p.EQUALS), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == "$") {
          r.push(p.DOLLAR), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == ".") {
          if (l = a.charAt(i++), l == ".") {
            r.push(p.DOUBLEDOT), o.push(".."), l = a.charAt(i++);
            continue;
          }
          if (l >= "0" && l <= "9") {
            var g = "." + l;
            for (l = a.charAt(i++); l >= "0" && l <= "9"; )
              g += l, l = a.charAt(i++);
            r.push(p.NUMBER), o.push(g);
            continue;
          }
          r.push(p.DOT), o.push(".");
          continue;
        }
        if (l == "'" || l == '"') {
          for (var I = l, L = ""; i < a.length && (l = a.charAt(i)) !== I; )
            L += l, i += 1;
          if (l !== I)
            throw be.fromMessage("Unterminated string literal: " + I + L);
          i += 1, r.push(p.LITERAL), o.push(L), l = a.charAt(i++);
          continue;
        }
        if (l >= "0" && l <= "9") {
          var g = l;
          for (l = a.charAt(i++); l >= "0" && l <= "9"; )
            g += l, l = a.charAt(i++);
          if (l == "." && a.charAt(i) >= "0" && a.charAt(i) <= "9")
            for (g += l, g += a.charAt(i++), l = a.charAt(i++); l >= "0" && l <= "9"; )
              g += l, l = a.charAt(i++);
          r.push(p.NUMBER), o.push(g);
          continue;
        }
        if (l == "*") {
          if (r.length > 0) {
            var D = r[r.length - 1];
            if (D != p.AT && D != p.DOUBLECOLON && D != p.LEFTPARENTHESIS && D != p.LEFTBRACKET && D != p.AND && D != p.OR && D != p.MOD && D != p.DIV && D != p.MULTIPLYOPERATOR && D != p.SLASH && D != p.DOUBLESLASH && D != p.BAR && D != p.PLUS && D != p.MINUS && D != p.EQUALS && D != p.NOTEQUAL && D != p.LESSTHAN && D != p.LESSTHANOREQUAL && D != p.GREATERTHAN && D != p.GREATERTHANOREQUAL) {
              r.push(p.MULTIPLYOPERATOR), o.push(l), l = a.charAt(i++);
              continue;
            }
          }
          r.push(p.ASTERISKNAMETEST), o.push(l), l = a.charAt(i++);
          continue;
        }
        if (l == ":" && a.charAt(i) == ":") {
          r.push(p.DOUBLECOLON), o.push("::"), i++, l = a.charAt(i++);
          continue;
        }
        if (l == "/") {
          if (l = a.charAt(i++), l == "/") {
            r.push(p.DOUBLESLASH), o.push("//"), l = a.charAt(i++);
            continue;
          }
          r.push(p.SLASH), o.push("/");
          continue;
        }
        if (l == "!" && a.charAt(i) == "=") {
          r.push(p.NOTEQUAL), o.push("!="), i++, l = a.charAt(i++);
          continue;
        }
        if (l == "<") {
          if (a.charAt(i) == "=") {
            r.push(p.LESSTHANOREQUAL), o.push("<="), i++, l = a.charAt(i++);
            continue;
          }
          r.push(p.LESSTHAN), o.push("<"), l = a.charAt(i++);
          continue;
        }
        if (l == ">") {
          if (a.charAt(i) == "=") {
            r.push(p.GREATERTHANOREQUAL), o.push(">="), i++, l = a.charAt(i++);
            continue;
          }
          r.push(p.GREATERTHAN), o.push(">"), l = a.charAt(i++);
          continue;
        }
        if (l == "_" || v.isLetter(l.charCodeAt(0))) {
          var B = l;
          for (l = a.charAt(i++); v.isNCNameChar(l.charCodeAt(0)); )
            B += l, l = a.charAt(i++);
          if (r.length > 0) {
            var D = r[r.length - 1];
            if (D != p.AT && D != p.DOUBLECOLON && D != p.LEFTPARENTHESIS && D != p.LEFTBRACKET && D != p.AND && D != p.OR && D != p.MOD && D != p.DIV && D != p.MULTIPLYOPERATOR && D != p.SLASH && D != p.DOUBLESLASH && D != p.BAR && D != p.PLUS && D != p.MINUS && D != p.EQUALS && D != p.NOTEQUAL && D != p.LESSTHAN && D != p.LESSTHANOREQUAL && D != p.GREATERTHAN && D != p.GREATERTHANOREQUAL) {
              if (B == "and") {
                r.push(p.AND), o.push(B);
                continue;
              }
              if (B == "or") {
                r.push(p.OR), o.push(B);
                continue;
              }
              if (B == "mod") {
                r.push(p.MOD), o.push(B);
                continue;
              }
              if (B == "div") {
                r.push(p.DIV), o.push(B);
                continue;
              }
            }
          }
          if (l == ":") {
            if (a.charAt(i) == "*") {
              r.push(p.NCNAMECOLONASTERISK), o.push(B + ":*"), i++, l = a.charAt(i++);
              continue;
            }
            if (a.charAt(i) == "_" || v.isLetter(a.charCodeAt(i))) {
              for (B += ":", l = a.charAt(i++); v.isNCNameChar(l.charCodeAt(0)); )
                B += l, l = a.charAt(i++);
              if (l == "(") {
                r.push(p.FUNCTIONNAME), o.push(B);
                continue;
              }
              r.push(p.QNAME), o.push(B);
              continue;
            }
            if (a.charAt(i) == ":") {
              r.push(p.AXISNAME), o.push(B);
              continue;
            }
          }
          if (l == "(") {
            if (B == "comment" || B == "text" || B == "node") {
              r.push(p.NODETYPE), o.push(B);
              continue;
            }
            if (B == "processing-instruction") {
              a.charAt(i) == ")" ? r.push(p.NODETYPE) : r.push(p.PROCESSINGINSTRUCTIONWITHLITERAL), o.push(B);
              continue;
            }
            r.push(p.FUNCTIONNAME), o.push(B);
            continue;
          }
          r.push(p.QNAME), o.push(B);
          continue;
        }
        throw new Error("Unexpected character " + l);
      }
      return r.push(1), o.push("[EOF]"), [r, o];
    }, p.SHIFT = "s", p.REDUCE = "r", p.ACCEPT = "a", p.prototype.parse = function(L) {
      if (!L)
        throw new Error("XPath expression unspecified.");
      if (typeof L != "string")
        throw new Error("XPath expression must be a string.");
      var r, o, a = this.tokenize(L);
      if (a != null) {
        r = a[0], o = a[1];
        var i = 0, l = [], g = [], I = [], L, D, B;
        for (l.push(0), g.push(1), I.push("_S"), D = r[i], B = o[i++]; ; )
          switch (L = l[l.length - 1], p.actionTable[L].charAt(D - 1)) {
            case p.SHIFT:
              g.push(-D), I.push(B), l.push(p.actionTableNumber[L].charCodeAt(D - 1) - 32), D = r[i], B = o[i++];
              break;
            case p.REDUCE:
              for (var Ie = p.productions[p.actionTableNumber[L].charCodeAt(D - 1) - 32][1], je = [], ze = 0; ze < Ie; ze++)
                g.pop(), je.unshift(I.pop()), l.pop();
              var Ye = l[l.length - 1];
              g.push(p.productions[p.actionTableNumber[L].charCodeAt(D - 1) - 32][0]), this.reduceActions[p.actionTableNumber[L].charCodeAt(D - 1) - 32] == null ? I.push(je[0]) : I.push(this.reduceActions[p.actionTableNumber[L].charCodeAt(D - 1) - 32](je)), l.push(p.gotoTable[Ye].charCodeAt(p.productions[p.actionTableNumber[L].charCodeAt(D - 1) - 32][0] - 2) - 33);
              break;
            case p.ACCEPT:
              return new Z(I.pop());
            default:
              throw new Error("XPath parse error");
          }
      }
    }, Z.prototype = new Object(), Z.prototype.constructor = Z, Z.superclass = Object.prototype;
    function Z(e) {
      this.expression = e;
    }
    Z.prototype.toString = function() {
      return this.expression.toString();
    };
    function ee(e, r, o) {
      r in e || (e[r] = o);
    }
    Z.prototype.evaluate = function(e) {
      var r = e.expressionContextNode;
      if (!(c(r) || A(r)))
        throw new Error("Context node does not appear to be a valid DOM node.");
      return e.contextNode = e.expressionContextNode, e.contextSize = 1, e.contextPosition = 1, e.isHtml && (ee(e, "caseInsensitive", !0), ee(e, "allowAnyNamespaceForNoPrefix", !0)), ee(e, "caseInsensitive", !1), this.expression.evaluate(e);
    }, Z.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace", Z.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/", U.prototype = new Object(), U.prototype.constructor = U, U.superclass = Object.prototype;
    function U() {
    }
    U.prototype.init = function() {
    }, U.prototype.toString = function() {
      return "<Expression>";
    }, U.prototype.evaluate = function(e) {
      throw new Error("Could not evaluate expression.");
    }, X.prototype = new U(), X.prototype.constructor = X, X.superclass = U.prototype;
    function X(e) {
      arguments.length > 0 && this.init(e);
    }
    X.prototype.init = function(e) {
      this.rhs = e;
    }, le.prototype = new X(), le.prototype.constructor = le, le.superclass = X.prototype;
    function le(e) {
      arguments.length > 0 && this.init(e);
    }
    le.prototype.init = function(e) {
      le.superclass.init.call(this, e);
    }, le.prototype.evaluate = function(e) {
      return this.rhs.evaluate(e).number().negate();
    }, le.prototype.toString = function() {
      return "-" + this.rhs.toString();
    }, R.prototype = new U(), R.prototype.constructor = R, R.superclass = U.prototype;
    function R(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    R.prototype.init = function(e, r) {
      this.lhs = e, this.rhs = r;
    }, ue.prototype = new R(), ue.prototype.constructor = ue, ue.superclass = R.prototype;
    function ue(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    ue.prototype.init = function(e, r) {
      ue.superclass.init.call(this, e, r);
    }, ue.prototype.toString = function() {
      return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
    }, ue.prototype.evaluate = function(e) {
      var r = this.lhs.evaluate(e).bool();
      return r.booleanValue() ? r : this.rhs.evaluate(e).bool();
    }, pe.prototype = new R(), pe.prototype.constructor = pe, pe.superclass = R.prototype;
    function pe(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    pe.prototype.init = function(e, r) {
      pe.superclass.init.call(this, e, r);
    }, pe.prototype.toString = function() {
      return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
    }, pe.prototype.evaluate = function(e) {
      var r = this.lhs.evaluate(e).bool();
      return r.booleanValue() ? this.rhs.evaluate(e).bool() : r;
    }, M.prototype = new R(), M.prototype.constructor = M, M.superclass = R.prototype;
    function M(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    M.prototype.init = function(e, r) {
      M.superclass.init.call(this, e, r);
    }, M.prototype.toString = function() {
      return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
    }, M.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).equals(this.rhs.evaluate(e));
    }, j.prototype = new R(), j.prototype.constructor = j, j.superclass = R.prototype;
    function j(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    j.prototype.init = function(e, r) {
      j.superclass.init.call(this, e, r);
    }, j.prototype.toString = function() {
      return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
    }, j.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).notequal(this.rhs.evaluate(e));
    }, ce.prototype = new R(), ce.prototype.constructor = ce, ce.superclass = R.prototype;
    function ce(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    ce.prototype.init = function(e, r) {
      ce.superclass.init.call(this, e, r);
    }, ce.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).lessthan(this.rhs.evaluate(e));
    }, ce.prototype.toString = function() {
      return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
    }, Ae.prototype = new R(), Ae.prototype.constructor = Ae, Ae.superclass = R.prototype;
    function Ae(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    Ae.prototype.init = function(e, r) {
      Ae.superclass.init.call(this, e, r);
    }, Ae.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).greaterthan(this.rhs.evaluate(e));
    }, Ae.prototype.toString = function() {
      return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
    }, De.prototype = new R(), De.prototype.constructor = De, De.superclass = R.prototype;
    function De(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    De.prototype.init = function(e, r) {
      De.superclass.init.call(this, e, r);
    }, De.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).lessthanorequal(this.rhs.evaluate(e));
    }, De.prototype.toString = function() {
      return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
    }, ge.prototype = new R(), ge.prototype.constructor = ge, ge.superclass = R.prototype;
    function ge(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    ge.prototype.init = function(e, r) {
      ge.superclass.init.call(this, e, r);
    }, ge.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).greaterthanorequal(this.rhs.evaluate(e));
    }, ge.prototype.toString = function() {
      return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
    }, de.prototype = new R(), de.prototype.constructor = de, de.superclass = R.prototype;
    function de(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    de.prototype.init = function(e, r) {
      de.superclass.init.call(this, e, r);
    }, de.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).number().plus(this.rhs.evaluate(e).number());
    }, de.prototype.toString = function() {
      return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
    }, me.prototype = new R(), me.prototype.constructor = me, me.superclass = R.prototype;
    function me(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    me.prototype.init = function(e, r) {
      me.superclass.init.call(this, e, r);
    }, me.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).number().minus(this.rhs.evaluate(e).number());
    }, me.prototype.toString = function() {
      return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
    }, Ne.prototype = new R(), Ne.prototype.constructor = Ne, Ne.superclass = R.prototype;
    function Ne(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    Ne.prototype.init = function(e, r) {
      Ne.superclass.init.call(this, e, r);
    }, Ne.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).number().multiply(this.rhs.evaluate(e).number());
    }, Ne.prototype.toString = function() {
      return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
    }, ve.prototype = new R(), ve.prototype.constructor = ve, ve.superclass = R.prototype;
    function ve(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    ve.prototype.init = function(e, r) {
      ve.superclass.init.call(this, e, r);
    }, ve.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).number().div(this.rhs.evaluate(e).number());
    }, ve.prototype.toString = function() {
      return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
    }, xe.prototype = new R(), xe.prototype.constructor = xe, xe.superclass = R.prototype;
    function xe(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    xe.prototype.init = function(e, r) {
      xe.superclass.init.call(this, e, r);
    }, xe.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).number().mod(this.rhs.evaluate(e).number());
    }, xe.prototype.toString = function() {
      return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
    }, Ce.prototype = new R(), Ce.prototype.constructor = Ce, Ce.superclass = R.prototype;
    function Ce(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    Ce.prototype.init = function(e, r) {
      Ce.superclass.init.call(this, e, r);
    }, Ce.prototype.evaluate = function(e) {
      return this.lhs.evaluate(e).nodeset().union(this.rhs.evaluate(e).nodeset());
    }, Ce.prototype.toString = function() {
      return S(J, [this.lhs, this.rhs]).join(" | ");
    }, _.prototype = new U(), _.prototype.constructor = _, _.superclass = U.prototype;
    function _(e, r, o) {
      arguments.length > 0 && this.init(e, r, o);
    }
    _.prototype.init = function(e, r, o) {
      _.superclass.init.call(this), this.filter = e, this.filterPredicates = r, this.locationPath = o;
    };
    function It(e) {
      for (; e && e.parentNode; )
        e = e.parentNode;
      return e;
    }
    var Vr = function(e, r, o, a) {
      if (e.length === 0)
        return o;
      var i = r.extend({});
      return w(
        function(l, g) {
          return i.contextSize = l.length, k(
            function(I, L) {
              return i.contextNode = I, i.contextPosition = L + 1, _.predicateMatches(g, i);
            },
            l
          );
        },
        He(o, a),
        e
      );
    };
    _.getRoot = function(e, r) {
      var o = r[0];
      if (o && o.nodeType === x.DOCUMENT_NODE)
        return o;
      if (e.virtualRoot)
        return e.virtualRoot;
      if (!o)
        throw new Error("Context node not found when determining document root.");
      var a = o.ownerDocument;
      if (a)
        return a;
      for (var i = o; i.parentNode != null; )
        i = i.parentNode;
      return i;
    };
    var Lt = function(e) {
      var r = String(e.name);
      return r === "xmlns" ? "" : r.substring(0, 6) === "xmlns:" ? r.substring(6, r.length) : null;
    };
    _.applyStep = function(e, r, o) {
      if (!o)
        throw new Error("Context node not found when evaluating XPath step: " + e);
      var a = [];
      switch (r.contextNode = o, e.axis) {
        case E.ANCESTOR:
          if (r.contextNode === r.virtualRoot)
            break;
          var i;
          for (r.contextNode.nodeType == x.ATTRIBUTE_NODE ? i = _.getOwnerElement(r.contextNode) : i = r.contextNode.parentNode; i != null && (e.nodeTest.matches(i, r) && a.push(i), i !== r.virtualRoot); )
            i = i.parentNode;
          break;
        case E.ANCESTORORSELF:
          for (var i = r.contextNode; i != null && (e.nodeTest.matches(i, r) && a.push(i), i !== r.virtualRoot); i = i.nodeType == x.ATTRIBUTE_NODE ? _.getOwnerElement(i) : i.parentNode)
            ;
          break;
        case E.ATTRIBUTE:
          var l = r.contextNode.attributes;
          if (l != null)
            for (var g = 0; g < l.length; g++) {
              var i = l.item(g);
              e.nodeTest.matches(i, r) && a.push(i);
            }
          break;
        case E.CHILD:
          for (var i = r.contextNode.firstChild; i != null; i = i.nextSibling)
            e.nodeTest.matches(i, r) && a.push(i);
          break;
        case E.DESCENDANT:
          for (var B = [r.contextNode.firstChild]; B.length > 0; )
            for (var i = B.pop(); i != null; )
              e.nodeTest.matches(i, r) && a.push(i), i.firstChild != null ? (B.push(i.nextSibling), i = i.firstChild) : i = i.nextSibling;
          break;
        case E.DESCENDANTORSELF:
          e.nodeTest.matches(r.contextNode, r) && a.push(r.contextNode);
          for (var B = [r.contextNode.firstChild]; B.length > 0; )
            for (var i = B.pop(); i != null; )
              e.nodeTest.matches(i, r) && a.push(i), i.firstChild != null ? (B.push(i.nextSibling), i = i.firstChild) : i = i.nextSibling;
          break;
        case E.FOLLOWING:
          if (r.contextNode === r.virtualRoot)
            break;
          var B = [];
          r.contextNode.firstChild != null ? B.unshift(r.contextNode.firstChild) : B.unshift(r.contextNode.nextSibling);
          for (var i = r.contextNode.parentNode; i != null && i.nodeType != x.DOCUMENT_NODE && i !== r.virtualRoot; i = i.parentNode)
            B.unshift(i.nextSibling);
          do
            for (var i = B.pop(); i != null; )
              e.nodeTest.matches(i, r) && a.push(i), i.firstChild != null ? (B.push(i.nextSibling), i = i.firstChild) : i = i.nextSibling;
          while (B.length > 0);
          break;
        case E.FOLLOWINGSIBLING:
          if (r.contextNode === r.virtualRoot)
            break;
          for (var i = r.contextNode.nextSibling; i != null; i = i.nextSibling)
            e.nodeTest.matches(i, r) && a.push(i);
          break;
        case E.NAMESPACE:
          var I = {};
          if (r.contextNode.nodeType == x.ELEMENT_NODE) {
            I.xml = new Xe("xml", null, Z.XML_NAMESPACE_URI, r.contextNode);
            for (var i = r.contextNode; i != null && i.nodeType == x.ELEMENT_NODE; i = i.parentNode)
              for (var g = 0; g < i.attributes.length; g++) {
                var L = i.attributes.item(g), D = Lt(L);
                D != null && I[D] == null && (I[D] = new Xe(D, L, L.value, r.contextNode));
              }
            for (var D in I) {
              var o = I[D];
              e.nodeTest.matches(o, r) && a.push(o);
            }
          }
          break;
        case E.PARENT:
          i = null, r.contextNode !== r.virtualRoot && (r.contextNode.nodeType == x.ATTRIBUTE_NODE ? i = _.getOwnerElement(r.contextNode) : i = r.contextNode.parentNode), i != null && e.nodeTest.matches(i, r) && a.push(i);
          break;
        case E.PRECEDING:
          var B;
          r.virtualRoot != null ? B = [r.virtualRoot] : B = [It(r.contextNode)];
          e:
            for (; B.length > 0; )
              for (var i = B.pop(); i != null; ) {
                if (i == r.contextNode)
                  break e;
                e.nodeTest.matches(i, r) && a.unshift(i), i.firstChild != null ? (B.push(i.nextSibling), i = i.firstChild) : i = i.nextSibling;
              }
          break;
        case E.PRECEDINGSIBLING:
          if (r.contextNode === r.virtualRoot)
            break;
          for (var i = r.contextNode.previousSibling; i != null; i = i.previousSibling)
            e.nodeTest.matches(i, r) && a.push(i);
          break;
        case E.SELF:
          e.nodeTest.matches(r.contextNode, r) && a.push(r.contextNode);
          break;
      }
      return a;
    };
    function Pt(e, r, o) {
      return Vr(
        e.predicates,
        r,
        _.applyStep(e, r, o),
        q(Mt, e.axis)
      );
    }
    function qt(e, r, o) {
      return te(
        S(
          Pt.bind(null, o, e),
          r
        )
      );
    }
    _.applySteps = function(e, r, o) {
      return w(
        qt.bind(null, r),
        o,
        e
      );
    }, _.prototype.applyFilter = function(e, r) {
      if (!this.filter)
        return { nodes: [e.contextNode] };
      var o = this.filter.evaluate(e);
      if (!v.instance_of(o, m)) {
        if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null)
          throw new Error("Path expression filter must evaluate to a nodeset if predicates or location path are used");
        return { nonNodes: o };
      }
      return {
        nodes: Vr(
          this.filterPredicates || [],
          r,
          o.toUnsortedArray(),
          !1
          // reverse
        )
      };
    }, _.applyLocationPath = function(e, r, o) {
      if (!e)
        return o;
      var a = e.absolute ? [_.getRoot(r, o)] : o;
      return _.applySteps(e.steps, r, a);
    }, _.prototype.evaluate = function(e) {
      var r = Se(new Te(), e), o = this.applyFilter(e, r);
      if ("nonNodes" in o)
        return o.nonNodes;
      var a = new m();
      return a.addArray(_.applyLocationPath(this.locationPath, r, o.nodes)), a;
    }, _.predicateMatches = function(e, r) {
      var o = e.evaluate(r);
      return v.instance_of(o, b) ? r.contextPosition === o.numberValue() : o.booleanValue();
    }, _.predicateString = function(e) {
      return G("[", "]", e.toString());
    }, _.predicatesString = function(e) {
      return H(
        "",
        S(_.predicateString, e)
      );
    }, _.prototype.toString = function() {
      if (this.filter != null) {
        var e = J(this.filter);
        return v.instance_of(this.filter, T) ? G("'", "'", e) : this.filterPredicates != null && this.filterPredicates.length ? G("(", ")", e) + _.predicatesString(this.filterPredicates) : this.locationPath != null ? e + (this.locationPath.absolute ? "" : "/") + J(this.locationPath) : e;
      }
      return J(this.locationPath);
    }, _.getOwnerElement = function(e) {
      if (e.ownerElement)
        return e.ownerElement;
      try {
        if (e.selectSingleNode)
          return e.selectSingleNode("..");
      } catch {
      }
      for (var r = e.nodeType == x.DOCUMENT_NODE ? e : e.ownerDocument, o = r.getElementsByTagName("*"), a = 0; a < o.length; a++)
        for (var i = o.item(a), l = i.attributes, g = 0; g < l.length; g++) {
          var I = l.item(g);
          if (I === e)
            return i;
        }
      return null;
    }, Oe.prototype = new Object(), Oe.prototype.constructor = Oe, Oe.superclass = Object.prototype;
    function Oe(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    Oe.prototype.init = function(e, r) {
      this.absolute = e, this.steps = r;
    }, Oe.prototype.toString = function() {
      return (this.absolute ? "/" : "") + S(J, this.steps).join("/");
    }, E.prototype = new Object(), E.prototype.constructor = E, E.superclass = Object.prototype;
    function E(e, r, o) {
      arguments.length > 0 && this.init(e, r, o);
    }
    E.prototype.init = function(e, r, o) {
      this.axis = e, this.nodeTest = r, this.predicates = o;
    }, E.prototype.toString = function() {
      return E.STEPNAMES[this.axis] + "::" + this.nodeTest.toString() + _.predicatesString(this.predicates);
    }, E.ANCESTOR = 0, E.ANCESTORORSELF = 1, E.ATTRIBUTE = 2, E.CHILD = 3, E.DESCENDANT = 4, E.DESCENDANTORSELF = 5, E.FOLLOWING = 6, E.FOLLOWINGSIBLING = 7, E.NAMESPACE = 8, E.PARENT = 9, E.PRECEDING = 10, E.PRECEDINGSIBLING = 11, E.SELF = 12, E.STEPNAMES = w(function(e, r) {
      return e[r[0]] = r[1], e;
    }, {}, [
      [E.ANCESTOR, "ancestor"],
      [E.ANCESTORORSELF, "ancestor-or-self"],
      [E.ATTRIBUTE, "attribute"],
      [E.CHILD, "child"],
      [E.DESCENDANT, "descendant"],
      [E.DESCENDANTORSELF, "descendant-or-self"],
      [E.FOLLOWING, "following"],
      [E.FOLLOWINGSIBLING, "following-sibling"],
      [E.NAMESPACE, "namespace"],
      [E.PARENT, "parent"],
      [E.PRECEDING, "preceding"],
      [E.PRECEDINGSIBLING, "preceding-sibling"],
      [E.SELF, "self"]
    ]);
    var Mt = [
      E.ANCESTOR,
      E.ANCESTORORSELF,
      E.PARENT,
      E.PRECEDING,
      E.PRECEDINGSIBLING
    ];
    d.prototype = new Object(), d.prototype.constructor = d, d.superclass = Object.prototype;
    function d(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    d.prototype.init = function(e, r) {
      this.type = e, this.value = r;
    }, d.prototype.toString = function() {
      return "<unknown nodetest type>";
    }, d.prototype.matches = function(e, r) {
      console.warn("unknown node test type");
    }, d.NAMETESTANY = 0, d.NAMETESTPREFIXANY = 1, d.NAMETESTQNAME = 2, d.COMMENT = 3, d.TEXT = 4, d.PI = 5, d.NODE = 6, d.isNodeType = function(e) {
      return function(r) {
        return q(e, r.nodeType);
      };
    }, d.makeNodeTestType = function(e, r, o) {
      var a = o || function() {
      };
      return a.prototype = new d(e), a.prototype.constructor = a, Se(a.prototype, r), a;
    }, d.makeNodeTypeTest = function(e, r, o) {
      return new (d.makeNodeTestType(e, {
        matches: d.isNodeType(r),
        toString: $(o)
      }))();
    }, d.hasPrefix = function(e) {
      return e.prefix || (e.nodeName || e.tagName).indexOf(":") !== -1;
    }, d.isElementOrAttribute = d.isNodeType([1, 2]), d.nameSpaceMatches = function(e, r, o) {
      var a = o.namespaceURI || "";
      if (!e)
        return !a || r.allowAnyNamespaceForNoPrefix && !d.hasPrefix(o);
      var i = r.namespaceResolver.getNamespace(e, r.expressionContextNode);
      if (i == null)
        throw new Error("Cannot resolve QName " + e);
      return i === a;
    }, d.localNameMatches = function(e, r, o) {
      var a = o.localName || o.nodeName;
      return r.caseInsensitive ? e.toLowerCase() === a.toLowerCase() : e === a;
    }, d.NameTestPrefixAny = d.makeNodeTestType(
      d.NAMETESTPREFIXANY,
      {
        matches: function(e, r) {
          return d.isElementOrAttribute(e) && d.nameSpaceMatches(this.prefix, r, e);
        },
        toString: function() {
          return this.prefix + ":*";
        }
      },
      function(r) {
        this.prefix = r;
      }
    ), d.NameTestQName = d.makeNodeTestType(
      d.NAMETESTQNAME,
      {
        matches: function(e, r) {
          return d.isNodeType(
            [
              x.ELEMENT_NODE,
              x.ATTRIBUTE_NODE,
              x.NAMESPACE_NODE
            ]
          )(e) && d.nameSpaceMatches(this.prefix, r, e) && d.localNameMatches(this.localName, r, e);
        },
        toString: function() {
          return this.name;
        }
      },
      function(r) {
        var o = r.split(":");
        this.name = r, this.prefix = o.length > 1 ? o[0] : null, this.localName = o[o.length > 1 ? 1 : 0];
      }
    ), d.PITest = d.makeNodeTestType(d.PI, {
      matches: function(e, r) {
        return d.isNodeType(
          [x.PROCESSING_INSTRUCTION_NODE]
        )(e) && (e.target || e.nodeName) === this.name;
      },
      toString: function() {
        return G('processing-instruction("', '")', this.name);
      }
    }, function(e) {
      this.name = e;
    }), d.nameTestAny = d.makeNodeTypeTest(
      d.NAMETESTANY,
      [
        x.ELEMENT_NODE,
        x.ATTRIBUTE_NODE,
        x.NAMESPACE_NODE
      ],
      "*"
    ), d.textTest = d.makeNodeTypeTest(
      d.TEXT,
      [
        x.TEXT_NODE,
        x.CDATA_SECTION_NODE
      ],
      "text()"
    ), d.commentTest = d.makeNodeTypeTest(
      d.COMMENT,
      [x.COMMENT_NODE],
      "comment()"
    ), d.nodeTest = d.makeNodeTypeTest(
      d.NODE,
      [
        x.ELEMENT_NODE,
        x.ATTRIBUTE_NODE,
        x.TEXT_NODE,
        x.CDATA_SECTION_NODE,
        x.PROCESSING_INSTRUCTION_NODE,
        x.COMMENT_NODE,
        x.DOCUMENT_NODE
      ],
      "node()"
    ), d.anyPiTest = d.makeNodeTypeTest(
      d.PI,
      [x.PROCESSING_INSTRUCTION_NODE],
      "processing-instruction()"
    ), Fe.prototype = new U(), Fe.prototype.constructor = Fe, Fe.superclass = U.prototype;
    function Fe(e) {
      arguments.length > 0 && this.init(e);
    }
    Fe.prototype.init = function(e) {
      this.variable = e;
    }, Fe.prototype.toString = function() {
      return "$" + this.variable;
    }, Fe.prototype.evaluate = function(e) {
      var r = v.resolveQName(this.variable, e.namespaceResolver, e.contextNode, !1);
      if (r[0] == null)
        throw new Error("Cannot resolve QName " + fn);
      var o = e.variableResolver.getVariable(r[1], r[0]);
      if (!o)
        throw be.fromMessage("Undeclared variable: " + this.toString());
      return o;
    }, ye.prototype = new U(), ye.prototype.constructor = ye, ye.superclass = U.prototype;
    function ye(e, r) {
      arguments.length > 0 && this.init(e, r);
    }
    ye.prototype.init = function(e, r) {
      this.functionName = e, this.arguments = r;
    }, ye.prototype.toString = function() {
      for (var e = this.functionName + "(", r = 0; r < this.arguments.length; r++)
        r > 0 && (e += ", "), e += this.arguments[r].toString();
      return e + ")";
    }, ye.prototype.evaluate = function(e) {
      var r = fe.getFunctionFromContext(this.functionName, e);
      if (!r)
        throw new Error("Unknown function " + this.functionName);
      var o = [e].concat(this.arguments);
      return r.apply(e.functionResolver.thisArg, o);
    };
    var W = new Object();
    W.equals = function(e, r) {
      return e.equals(r);
    }, W.notequal = function(e, r) {
      return e.notequal(r);
    }, W.lessthan = function(e, r) {
      return e.lessthan(r);
    }, W.greaterthan = function(e, r) {
      return e.greaterthan(r);
    }, W.lessthanorequal = function(e, r) {
      return e.lessthanorequal(r);
    }, W.greaterthanorequal = function(e, r) {
      return e.greaterthanorequal(r);
    }, T.prototype = new U(), T.prototype.constructor = T, T.superclass = U.prototype;
    function T(e) {
      arguments.length > 0 && this.init(e);
    }
    T.prototype.init = function(e) {
      this.str = String(e);
    }, T.prototype.toString = function() {
      return this.str;
    }, T.prototype.evaluate = function(e) {
      return this;
    }, T.prototype.string = function() {
      return this;
    }, T.prototype.number = function() {
      return new b(this.str);
    }, T.prototype.bool = function() {
      return new C(this.str);
    }, T.prototype.nodeset = function() {
      throw new Error("Cannot convert string to nodeset");
    }, T.prototype.stringValue = function() {
      return this.str;
    }, T.prototype.numberValue = function() {
      return this.number().numberValue();
    }, T.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    }, T.prototype.equals = function(e) {
      return v.instance_of(e, C) ? this.bool().equals(e) : v.instance_of(e, b) ? this.number().equals(e) : v.instance_of(e, m) ? e.compareWithString(this, W.equals) : new C(this.str == e.str);
    }, T.prototype.notequal = function(e) {
      return v.instance_of(e, C) ? this.bool().notequal(e) : v.instance_of(e, b) ? this.number().notequal(e) : v.instance_of(e, m) ? e.compareWithString(this, W.notequal) : new C(this.str != e.str);
    }, T.prototype.lessthan = function(e) {
      return this.number().lessthan(e);
    }, T.prototype.greaterthan = function(e) {
      return this.number().greaterthan(e);
    }, T.prototype.lessthanorequal = function(e) {
      return this.number().lessthanorequal(e);
    }, T.prototype.greaterthanorequal = function(e) {
      return this.number().greaterthanorequal(e);
    }, b.prototype = new U(), b.prototype.constructor = b, b.superclass = U.prototype;
    function b(e) {
      arguments.length > 0 && this.init(e);
    }
    b.prototype.init = function(e) {
      this.num = typeof e == "string" ? this.parse(e) : Number(e);
    }, b.prototype.numberFormat = /^\s*-?[0-9]*\.?[0-9]+\s*$/, b.prototype.parse = function(e) {
      return this.numberFormat.test(e) ? parseFloat(e) : Number.NaN;
    };
    function Ut(e) {
      for (var r = e.split("e-"), o = r[0].replace(".", ""), a = Number(r[1]), i = 0; i < a - 1; i += 1)
        o = "0" + o;
      return "0." + o;
    }
    function Vt(e) {
      for (var r = e.split("e"), o = r[0].replace(".", ""), a = Number(r[1]), i = a + 1 - o.length, l = 0; l < i; l += 1)
        o += "0";
      return o;
    }
    b.prototype.toString = function() {
      var e = this.num.toString();
      return e.indexOf("e-") !== -1 ? Ut(e) : e.indexOf("e") !== -1 ? Vt(e) : e;
    }, b.prototype.evaluate = function(e) {
      return this;
    }, b.prototype.string = function() {
      return new T(this.toString());
    }, b.prototype.number = function() {
      return this;
    }, b.prototype.bool = function() {
      return new C(this.num);
    }, b.prototype.nodeset = function() {
      throw new Error("Cannot convert number to nodeset");
    }, b.prototype.stringValue = function() {
      return this.string().stringValue();
    }, b.prototype.numberValue = function() {
      return this.num;
    }, b.prototype.booleanValue = function() {
      return this.bool().booleanValue();
    }, b.prototype.negate = function() {
      return new b(-this.num);
    }, b.prototype.equals = function(e) {
      return v.instance_of(e, C) ? this.bool().equals(e) : v.instance_of(e, T) ? this.equals(e.number()) : v.instance_of(e, m) ? e.compareWithNumber(this, W.equals) : new C(this.num == e.num);
    }, b.prototype.notequal = function(e) {
      return v.instance_of(e, C) ? this.bool().notequal(e) : v.instance_of(e, T) ? this.notequal(e.number()) : v.instance_of(e, m) ? e.compareWithNumber(this, W.notequal) : new C(this.num != e.num);
    }, b.prototype.lessthan = function(e) {
      return v.instance_of(e, m) ? e.compareWithNumber(this, W.greaterthan) : v.instance_of(e, C) || v.instance_of(e, T) ? this.lessthan(e.number()) : new C(this.num < e.num);
    }, b.prototype.greaterthan = function(e) {
      return v.instance_of(e, m) ? e.compareWithNumber(this, W.lessthan) : v.instance_of(e, C) || v.instance_of(e, T) ? this.greaterthan(e.number()) : new C(this.num > e.num);
    }, b.prototype.lessthanorequal = function(e) {
      return v.instance_of(e, m) ? e.compareWithNumber(this, W.greaterthanorequal) : v.instance_of(e, C) || v.instance_of(e, T) ? this.lessthanorequal(e.number()) : new C(this.num <= e.num);
    }, b.prototype.greaterthanorequal = function(e) {
      return v.instance_of(e, m) ? e.compareWithNumber(this, W.lessthanorequal) : v.instance_of(e, C) || v.instance_of(e, T) ? this.greaterthanorequal(e.number()) : new C(this.num >= e.num);
    }, b.prototype.plus = function(e) {
      return new b(this.num + e.num);
    }, b.prototype.minus = function(e) {
      return new b(this.num - e.num);
    }, b.prototype.multiply = function(e) {
      return new b(this.num * e.num);
    }, b.prototype.div = function(e) {
      return new b(this.num / e.num);
    }, b.prototype.mod = function(e) {
      return new b(this.num % e.num);
    }, C.prototype = new U(), C.prototype.constructor = C, C.superclass = U.prototype;
    function C(e) {
      arguments.length > 0 && this.init(e);
    }
    C.prototype.init = function(e) {
      this.b = !!e;
    }, C.prototype.toString = function() {
      return this.b.toString();
    }, C.prototype.evaluate = function(e) {
      return this;
    }, C.prototype.string = function() {
      return new T(this.b);
    }, C.prototype.number = function() {
      return new b(this.b);
    }, C.prototype.bool = function() {
      return this;
    }, C.prototype.nodeset = function() {
      throw new Error("Cannot convert boolean to nodeset");
    }, C.prototype.stringValue = function() {
      return this.string().stringValue();
    }, C.prototype.numberValue = function() {
      return this.number().numberValue();
    }, C.prototype.booleanValue = function() {
      return this.b;
    }, C.prototype.not = function() {
      return new C(!this.b);
    }, C.prototype.equals = function(e) {
      return v.instance_of(e, T) || v.instance_of(e, b) ? this.equals(e.bool()) : v.instance_of(e, m) ? e.compareWithBoolean(this, W.equals) : new C(this.b == e.b);
    }, C.prototype.notequal = function(e) {
      return v.instance_of(e, T) || v.instance_of(e, b) ? this.notequal(e.bool()) : v.instance_of(e, m) ? e.compareWithBoolean(this, W.notequal) : new C(this.b != e.b);
    }, C.prototype.lessthan = function(e) {
      return this.number().lessthan(e);
    }, C.prototype.greaterthan = function(e) {
      return this.number().greaterthan(e);
    }, C.prototype.lessthanorequal = function(e) {
      return this.number().lessthanorequal(e);
    }, C.prototype.greaterthanorequal = function(e) {
      return this.number().greaterthanorequal(e);
    }, C.true_ = new C(!0), C.false_ = new C(!1), ne.prototype = new Object(), ne.prototype.constructor = ne, ne.superclass = Object.prototype;
    function ne(e) {
      this.init(e);
    }
    ne.prototype.init = function(e) {
      this.left = null, this.right = null, this.node = e, this.depth = 1;
    }, ne.prototype.balance = function() {
      var e = this.left == null ? 0 : this.left.depth, r = this.right == null ? 0 : this.right.depth;
      if (e > r + 1) {
        var o = this.left.left == null ? 0 : this.left.left.depth, a = this.left.right == null ? 0 : this.left.right.depth;
        o < a && this.left.rotateRR(), this.rotateLL();
      } else if (e + 1 < r) {
        var i = this.right.right == null ? 0 : this.right.right.depth, l = this.right.left == null ? 0 : this.right.left.depth;
        l > i && this.right.rotateLL(), this.rotateRR();
      }
    }, ne.prototype.rotateLL = function() {
      var e = this.node, r = this.right;
      this.node = this.left.node, this.right = this.left, this.left = this.left.left, this.right.left = this.right.right, this.right.right = r, this.right.node = e, this.right.updateInNewLocation(), this.updateInNewLocation();
    }, ne.prototype.rotateRR = function() {
      var e = this.node, r = this.left;
      this.node = this.right.node, this.left = this.right, this.right = this.right.right, this.left.right = this.left.left, this.left.left = r, this.left.node = e, this.left.updateInNewLocation(), this.updateInNewLocation();
    }, ne.prototype.updateInNewLocation = function() {
      this.getDepthFromChildren();
    }, ne.prototype.getDepthFromChildren = function() {
      this.depth = this.node == null ? 0 : 1, this.left != null && (this.depth = this.left.depth + 1), this.right != null && this.depth <= this.right.depth && (this.depth = this.right.depth + 1);
    };
    function kt(e, r) {
      if (e === r)
        return 0;
      if (e.compareDocumentPosition) {
        var o = e.compareDocumentPosition(r);
        return o & 1 || o & 10 ? 1 : o & 20 ? -1 : 0;
      }
      for (var a = 0, i = 0, l = e; l != null; l = l.parentNode || l.ownerElement)
        a++;
      for (var g = r; g != null; g = g.parentNode || g.ownerElement)
        i++;
      if (a > i) {
        for (; a > i; )
          e = e.parentNode || e.ownerElement, a--;
        if (e === r)
          return 1;
      } else if (i > a) {
        for (; i > a; )
          r = r.parentNode || r.ownerElement, i--;
        if (e === r)
          return -1;
      }
      for (var I = e.parentNode || e.ownerElement, L = r.parentNode || r.ownerElement; I !== L; )
        e = I, r = L, I = e.parentNode || e.ownerElement, L = r.parentNode || r.ownerElement;
      var D = kr(e), B = kr(r);
      if (D && !B)
        return -1;
      if (!D && B)
        return 1;
      if (e.isXPathNamespace) {
        if (e.nodeValue === Z.XML_NAMESPACE_URI || !r.isXPathNamespace)
          return -1;
        if (r.nodeValue === Z.XML_NAMESPACE_URI)
          return 1;
      } else if (r.isXPathNamespace)
        return 1;
      if (I)
        for (var Ie = D ? I.attributes : I.childNodes, je = Ie.length, ze = e.baseNode || e, Ye = r.baseNode || r, or = 0; or < je; or += 1) {
          var ir = Ie[or];
          if (ir === ze)
            return -1;
          if (ir === Ye)
            return 1;
        }
      throw new Error("Unexpected: could not determine node order");
    }
    ne.prototype.add = function(e) {
      if (e === this.node)
        return !1;
      var r = kt(e, this.node), o = !1;
      return r == -1 ? this.left == null ? (this.left = new ne(e), o = !0) : (o = this.left.add(e), o && this.balance()) : r == 1 && (this.right == null ? (this.right = new ne(e), o = !0) : (o = this.right.add(e), o && this.balance())), o && this.getDepthFromChildren(), o;
    }, m.prototype = new U(), m.prototype.constructor = m, m.superclass = U.prototype;
    function m() {
      this.init();
    }
    m.prototype.init = function() {
      this.tree = null, this.nodes = [], this.size = 0;
    }, m.prototype.toString = function() {
      var e = this.first();
      return e == null ? "" : this.stringForNode(e);
    }, m.prototype.evaluate = function(e) {
      return this;
    }, m.prototype.string = function() {
      return new T(this.toString());
    }, m.prototype.stringValue = function() {
      return this.toString();
    }, m.prototype.number = function() {
      return new b(this.string());
    }, m.prototype.numberValue = function() {
      return Number(this.string());
    }, m.prototype.bool = function() {
      return new C(this.booleanValue());
    }, m.prototype.booleanValue = function() {
      return !!this.size;
    }, m.prototype.nodeset = function() {
      return this;
    }, m.prototype.stringForNode = function(e) {
      return e.nodeType == x.DOCUMENT_NODE || e.nodeType == x.ELEMENT_NODE || e.nodeType === x.DOCUMENT_FRAGMENT_NODE ? this.stringForContainerNode(e) : e.nodeType === x.ATTRIBUTE_NODE ? e.value || e.nodeValue : e.isNamespaceNode ? e.namespace : e.nodeValue;
    }, m.prototype.stringForContainerNode = function(e) {
      for (var r = "", o = e.firstChild; o != null; o = o.nextSibling) {
        var a = o.nodeType;
        (a === 1 || a === 3 || a === 4 || a === 9 || a === 11) && (r += this.stringForNode(o));
      }
      return r;
    }, m.prototype.buildTree = function() {
      if (!this.tree && this.nodes.length) {
        this.tree = new ne(this.nodes[0]);
        for (var e = 1; e < this.nodes.length; e += 1)
          this.tree.add(this.nodes[e]);
      }
      return this.tree;
    }, m.prototype.first = function() {
      var e = this.buildTree();
      if (e == null)
        return null;
      for (; e.left != null; )
        e = e.left;
      return e.node;
    }, m.prototype.add = function(e) {
      for (var r = 0; r < this.nodes.length; r += 1)
        if (e === this.nodes[r])
          return;
      this.tree = null, this.nodes.push(e), this.size += 1;
    }, m.prototype.addArray = function(e) {
      var r = this;
      N(function(o) {
        r.add(o);
      }, e);
    }, m.prototype.toArray = function() {
      var e = [];
      return this.toArrayRec(this.buildTree(), e), e;
    }, m.prototype.toArrayRec = function(e, r) {
      e != null && (this.toArrayRec(e.left, r), r.push(e.node), this.toArrayRec(e.right, r));
    }, m.prototype.toUnsortedArray = function() {
      return this.nodes.slice();
    }, m.prototype.compareWithString = function(e, r) {
      for (var o = this.toUnsortedArray(), a = 0; a < o.length; a++) {
        var i = o[a], l = new T(this.stringForNode(i)), g = r(l, e);
        if (g.booleanValue())
          return g;
      }
      return new C(!1);
    }, m.prototype.compareWithNumber = function(e, r) {
      for (var o = this.toUnsortedArray(), a = 0; a < o.length; a++) {
        var i = o[a], l = new b(this.stringForNode(i)), g = r(l, e);
        if (g.booleanValue())
          return g;
      }
      return new C(!1);
    }, m.prototype.compareWithBoolean = function(e, r) {
      return r(this.bool(), e);
    }, m.prototype.compareWithNodeSet = function(e, r) {
      for (var o = this.toUnsortedArray(), a = function(I, L) {
        return r(L, I);
      }, i = 0; i < o.length; i++) {
        var l = new T(this.stringForNode(o[i])), g = e.compareWithString(l, a);
        if (g.booleanValue())
          return g;
      }
      return new C(!1);
    }, m.compareWith = y(function(e, r) {
      return v.instance_of(r, T) ? this.compareWithString(r, e) : v.instance_of(r, b) ? this.compareWithNumber(r, e) : v.instance_of(r, C) ? this.compareWithBoolean(r, e) : this.compareWithNodeSet(r, e);
    }), m.prototype.equals = m.compareWith(W.equals), m.prototype.notequal = m.compareWith(W.notequal), m.prototype.lessthan = m.compareWith(W.lessthan), m.prototype.greaterthan = m.compareWith(W.greaterthan), m.prototype.lessthanorequal = m.compareWith(W.lessthanorequal), m.prototype.greaterthanorequal = m.compareWith(W.greaterthanorequal), m.prototype.union = function(e) {
      var r = new m();
      return r.addArray(this.toUnsortedArray()), r.addArray(e.toUnsortedArray()), r;
    }, Xe.prototype = new Object(), Xe.prototype.constructor = Xe, Xe.superclass = Object.prototype;
    function Xe(e, r, o, a) {
      this.isXPathNamespace = !0, this.baseNode = r, this.ownerDocument = a.ownerDocument, this.nodeName = e, this.prefix = e, this.localName = e, this.namespaceURI = null, this.nodeValue = o, this.ownerElement = a, this.nodeType = x.NAMESPACE_NODE;
    }
    Xe.prototype.toString = function() {
      return '{ "' + this.prefix + '", "' + this.namespaceURI + '" }';
    }, Te.prototype = new Object(), Te.prototype.constructor = Te, Te.superclass = Object.prototype;
    function Te(e, r, o) {
      this.variableResolver = e ?? new Ue(), this.namespaceResolver = r ?? new Re(), this.functionResolver = o ?? new fe();
    }
    Te.prototype.extend = function(e) {
      return Se(new Te(), this, e);
    }, Ue.prototype = new Object(), Ue.prototype.constructor = Ue, Ue.superclass = Object.prototype;
    function Ue() {
    }
    Ue.prototype.getVariable = function(e, r) {
      return null;
    }, fe.prototype = new Object(), fe.prototype.constructor = fe, fe.superclass = Object.prototype;
    function fe(e) {
      this.thisArg = e ?? O, this.functions = new Object(), this.addStandardFunctions();
    }
    fe.prototype.addStandardFunctions = function() {
      this.functions["{}last"] = O.last, this.functions["{}position"] = O.position, this.functions["{}count"] = O.count, this.functions["{}id"] = O.id, this.functions["{}local-name"] = O.localName, this.functions["{}namespace-uri"] = O.namespaceURI, this.functions["{}name"] = O.name, this.functions["{}string"] = O.string, this.functions["{}concat"] = O.concat, this.functions["{}starts-with"] = O.startsWith, this.functions["{}contains"] = O.contains, this.functions["{}substring-before"] = O.substringBefore, this.functions["{}substring-after"] = O.substringAfter, this.functions["{}substring"] = O.substring, this.functions["{}string-length"] = O.stringLength, this.functions["{}normalize-space"] = O.normalizeSpace, this.functions["{}translate"] = O.translate, this.functions["{}boolean"] = O.boolean_, this.functions["{}not"] = O.not, this.functions["{}true"] = O.true_, this.functions["{}false"] = O.false_, this.functions["{}lang"] = O.lang, this.functions["{}number"] = O.number, this.functions["{}sum"] = O.sum, this.functions["{}floor"] = O.floor, this.functions["{}ceiling"] = O.ceiling, this.functions["{}round"] = O.round;
    }, fe.prototype.addFunction = function(e, r, o) {
      this.functions["{" + e + "}" + r] = o;
    }, fe.getFunctionFromContext = function(e, r) {
      var o = v.resolveQName(e, r.namespaceResolver, r.contextNode, !1);
      if (o[0] === null)
        throw new Error("Cannot resolve QName " + name);
      return r.functionResolver.getFunction(o[1], o[0]);
    }, fe.prototype.getFunction = function(e, r) {
      return this.functions["{" + r + "}" + e];
    }, Re.prototype = new Object(), Re.prototype.constructor = Re, Re.superclass = Object.prototype;
    function Re() {
    }
    Re.prototype.getNamespace = function(e, r) {
      if (e == "xml")
        return Z.XML_NAMESPACE_URI;
      if (e == "xmlns")
        return Z.XMLNS_NAMESPACE_URI;
      for (r.nodeType == x.DOCUMENT_NODE ? r = r.documentElement : r.nodeType == x.ATTRIBUTE_NODE ? r = _.getOwnerElement(r) : r.nodeType != x.ELEMENT_NODE && (r = r.parentNode); r != null && r.nodeType == x.ELEMENT_NODE; ) {
        for (var o = r.attributes, a = 0; a < o.length; a++) {
          var i = o.item(a), l = i.name || i.nodeName;
          if (l === "xmlns" && e === "" || l === "xmlns:" + e)
            return String(i.value || i.nodeValue);
        }
        r = r.parentNode;
      }
      return null;
    };
    var O = new Object();
    O.last = function(e) {
      if (arguments.length != 1)
        throw new Error("Function last expects ()");
      return new b(e.contextSize);
    }, O.position = function(e) {
      if (arguments.length != 1)
        throw new Error("Function position expects ()");
      return new b(e.contextPosition);
    }, O.count = function() {
      var e = arguments[0], r;
      if (arguments.length != 2 || !v.instance_of(r = arguments[1].evaluate(e), m))
        throw new Error("Function count expects (node-set)");
      return new b(r.size);
    }, O.id = function() {
      var e = arguments[0], r;
      if (arguments.length != 2)
        throw new Error("Function id expects (object)");
      r = arguments[1].evaluate(e), v.instance_of(r, m) ? r = r.toArray().join(" ") : r = r.stringValue();
      for (var o = r.split(/[\x0d\x0a\x09\x20]+/), a = new m(), i = e.contextNode.nodeType == x.DOCUMENT_NODE ? e.contextNode : e.contextNode.ownerDocument, l = 0; l < o.length; l++) {
        var g;
        i.getElementById ? g = i.getElementById(o[l]) : g = v.getElementById(i, o[l]), g != null && a.add(g);
      }
      return a;
    }, O.localName = function(e, r) {
      var o;
      if (arguments.length == 1)
        o = e.contextNode;
      else if (arguments.length == 2)
        o = r.evaluate(e).first();
      else
        throw new Error("Function local-name expects (node-set?)");
      return o == null ? new T("") : new T(
        o.localName || //  standard elements and attributes
        o.baseName || //  IE
        o.target || //  processing instructions
        o.nodeName || //  DOM1 elements
        ""
        //  fallback
      );
    }, O.namespaceURI = function() {
      var e = arguments[0], r;
      if (arguments.length == 1)
        r = e.contextNode;
      else if (arguments.length == 2)
        r = arguments[1].evaluate(e).first();
      else
        throw new Error("Function namespace-uri expects (node-set?)");
      return r == null ? new T("") : new T(r.namespaceURI || "");
    }, O.name = function() {
      var e = arguments[0], r;
      if (arguments.length == 1)
        r = e.contextNode;
      else if (arguments.length == 2)
        r = arguments[1].evaluate(e).first();
      else
        throw new Error("Function name expects (node-set?)");
      return r == null ? new T("") : r.nodeType == x.ELEMENT_NODE ? new T(r.nodeName) : r.nodeType == x.ATTRIBUTE_NODE ? new T(r.name || r.nodeName) : r.nodeType === x.PROCESSING_INSTRUCTION_NODE ? new T(r.target || r.nodeName) : r.localName == null ? new T("") : new T(r.localName);
    }, O.string = function() {
      var e = arguments[0];
      if (arguments.length == 1)
        return new T(m.prototype.stringForNode(e.contextNode));
      if (arguments.length == 2)
        return arguments[1].evaluate(e).string();
      throw new Error("Function string expects (object?)");
    }, O.concat = function(e) {
      if (arguments.length < 3)
        throw new Error("Function concat expects (string, string[, string]*)");
      for (var r = "", o = 1; o < arguments.length; o++)
        r += arguments[o].evaluate(e).stringValue();
      return new T(r);
    }, O.startsWith = function() {
      var e = arguments[0];
      if (arguments.length != 3)
        throw new Error("Function startsWith expects (string, string)");
      var r = arguments[1].evaluate(e).stringValue(), o = arguments[2].evaluate(e).stringValue();
      return new C(r.substring(0, o.length) == o);
    }, O.contains = function() {
      var e = arguments[0];
      if (arguments.length != 3)
        throw new Error("Function contains expects (string, string)");
      var r = arguments[1].evaluate(e).stringValue(), o = arguments[2].evaluate(e).stringValue();
      return new C(r.indexOf(o) !== -1);
    }, O.substringBefore = function() {
      var e = arguments[0];
      if (arguments.length != 3)
        throw new Error("Function substring-before expects (string, string)");
      var r = arguments[1].evaluate(e).stringValue(), o = arguments[2].evaluate(e).stringValue();
      return new T(r.substring(0, r.indexOf(o)));
    }, O.substringAfter = function() {
      var e = arguments[0];
      if (arguments.length != 3)
        throw new Error("Function substring-after expects (string, string)");
      var r = arguments[1].evaluate(e).stringValue(), o = arguments[2].evaluate(e).stringValue();
      if (o.length == 0)
        return new T(r);
      var a = r.indexOf(o);
      return a == -1 ? new T("") : new T(r.substring(a + o.length));
    }, O.substring = function() {
      var e = arguments[0];
      if (!(arguments.length == 3 || arguments.length == 4))
        throw new Error("Function substring expects (string, number, number?)");
      var r = arguments[1].evaluate(e).stringValue(), o = Math.round(arguments[2].evaluate(e).numberValue()) - 1, a = arguments.length == 4 ? o + Math.round(arguments[3].evaluate(e).numberValue()) : void 0;
      return new T(r.substring(o, a));
    }, O.stringLength = function() {
      var e = arguments[0], r;
      if (arguments.length == 1)
        r = m.prototype.stringForNode(e.contextNode);
      else if (arguments.length == 2)
        r = arguments[1].evaluate(e).stringValue();
      else
        throw new Error("Function string-length expects (string?)");
      return new b(r.length);
    }, O.normalizeSpace = function() {
      var e = arguments[0], r;
      if (arguments.length == 1)
        r = m.prototype.stringForNode(e.contextNode);
      else if (arguments.length == 2)
        r = arguments[1].evaluate(e).stringValue();
      else
        throw new Error("Function normalize-space expects (string?)");
      for (var o = 0, a = r.length - 1; v.isSpace(r.charCodeAt(a)); )
        a--;
      for (var i = ""; o <= a && v.isSpace(r.charCodeAt(o)); )
        o++;
      for (; o <= a; )
        if (v.isSpace(r.charCodeAt(o)))
          for (i += " "; o <= a && v.isSpace(r.charCodeAt(o)); )
            o++;
        else
          i += r.charAt(o), o++;
      return new T(i);
    }, O.translate = function(e, r, o, a) {
      if (arguments.length != 4)
        throw new Error("Function translate expects (string, string, string)");
      var i = r.evaluate(e).stringValue(), l = o.evaluate(e).stringValue(), g = a.evaluate(e).stringValue(), I = w(function(D, B, Ie) {
        return B in D || (D[B] = Ie > g.length ? "" : g[Ie]), D;
      }, {}, l), L = H(
        "",
        S(function(D) {
          return D in I ? I[D] : D;
        }, i)
      );
      return new T(L);
    }, O.boolean_ = function() {
      var e = arguments[0];
      if (arguments.length != 2)
        throw new Error("Function boolean expects (object)");
      return arguments[1].evaluate(e).bool();
    }, O.not = function(e, r) {
      if (arguments.length != 2)
        throw new Error("Function not expects (object)");
      return r.evaluate(e).bool().not();
    }, O.true_ = function() {
      if (arguments.length != 1)
        throw new Error("Function true expects ()");
      return C.true_;
    }, O.false_ = function() {
      if (arguments.length != 1)
        throw new Error("Function false expects ()");
      return C.false_;
    }, O.lang = function() {
      var e = arguments[0];
      if (arguments.length != 2)
        throw new Error("Function lang expects (string)");
      for (var r, o = e.contextNode; o != null && o.nodeType != x.DOCUMENT_NODE; o = o.parentNode) {
        var a = o.getAttributeNS(Z.XML_NAMESPACE_URI, "lang");
        if (a != null) {
          r = String(a);
          break;
        }
      }
      if (r == null)
        return C.false_;
      var i = arguments[1].evaluate(e).stringValue();
      return new C(r.substring(0, i.length) == i && (r.length == i.length || r.charAt(i.length) == "-"));
    }, O.number = function() {
      var e = arguments[0];
      if (!(arguments.length == 1 || arguments.length == 2))
        throw new Error("Function number expects (object?)");
      return arguments.length == 1 ? new b(m.prototype.stringForNode(e.contextNode)) : arguments[1].evaluate(e).number();
    }, O.sum = function() {
      var e = arguments[0], r;
      if (arguments.length != 2 || !v.instance_of(r = arguments[1].evaluate(e), m))
        throw new Error("Function sum expects (node-set)");
      r = r.toUnsortedArray();
      for (var o = 0, a = 0; a < r.length; a++)
        o += new b(m.prototype.stringForNode(r[a])).numberValue();
      return new b(o);
    }, O.floor = function() {
      var e = arguments[0];
      if (arguments.length != 2)
        throw new Error("Function floor expects (number)");
      return new b(Math.floor(arguments[1].evaluate(e).numberValue()));
    }, O.ceiling = function() {
      var e = arguments[0];
      if (arguments.length != 2)
        throw new Error("Function ceiling expects (number)");
      return new b(Math.ceil(arguments[1].evaluate(e).numberValue()));
    }, O.round = function() {
      var e = arguments[0];
      if (arguments.length != 2)
        throw new Error("Function round expects (number)");
      return new b(Math.round(arguments[1].evaluate(e).numberValue()));
    };
    var v = new Object(), kr = function(e) {
      return e && (e.nodeType === x.ATTRIBUTE_NODE || e.ownerElement || e.isXPathNamespace);
    };
    v.splitQName = function(e) {
      var r = e.indexOf(":");
      return r == -1 ? [null, e] : [e.substring(0, r), e.substring(r + 1)];
    }, v.resolveQName = function(e, r, o, a) {
      var i = v.splitQName(e);
      return i[0] != null ? i[0] = r.getNamespace(i[0], o) : a ? (i[0] = r.getNamespace("", o), i[0] == null && (i[0] = "")) : i[0] = "", i;
    }, v.isSpace = function(e) {
      return e == 9 || e == 13 || e == 10 || e == 32;
    }, v.isLetter = function(e) {
      return e >= 65 && e <= 90 || e >= 97 && e <= 122 || e >= 192 && e <= 214 || e >= 216 && e <= 246 || e >= 248 && e <= 255 || e >= 256 && e <= 305 || e >= 308 && e <= 318 || e >= 321 && e <= 328 || e >= 330 && e <= 382 || e >= 384 && e <= 451 || e >= 461 && e <= 496 || e >= 500 && e <= 501 || e >= 506 && e <= 535 || e >= 592 && e <= 680 || e >= 699 && e <= 705 || e == 902 || e >= 904 && e <= 906 || e == 908 || e >= 910 && e <= 929 || e >= 931 && e <= 974 || e >= 976 && e <= 982 || e == 986 || e == 988 || e == 990 || e == 992 || e >= 994 && e <= 1011 || e >= 1025 && e <= 1036 || e >= 1038 && e <= 1103 || e >= 1105 && e <= 1116 || e >= 1118 && e <= 1153 || e >= 1168 && e <= 1220 || e >= 1223 && e <= 1224 || e >= 1227 && e <= 1228 || e >= 1232 && e <= 1259 || e >= 1262 && e <= 1269 || e >= 1272 && e <= 1273 || e >= 1329 && e <= 1366 || e == 1369 || e >= 1377 && e <= 1414 || e >= 1488 && e <= 1514 || e >= 1520 && e <= 1522 || e >= 1569 && e <= 1594 || e >= 1601 && e <= 1610 || e >= 1649 && e <= 1719 || e >= 1722 && e <= 1726 || e >= 1728 && e <= 1742 || e >= 1744 && e <= 1747 || e == 1749 || e >= 1765 && e <= 1766 || e >= 2309 && e <= 2361 || e == 2365 || e >= 2392 && e <= 2401 || e >= 2437 && e <= 2444 || e >= 2447 && e <= 2448 || e >= 2451 && e <= 2472 || e >= 2474 && e <= 2480 || e == 2482 || e >= 2486 && e <= 2489 || e >= 2524 && e <= 2525 || e >= 2527 && e <= 2529 || e >= 2544 && e <= 2545 || e >= 2565 && e <= 2570 || e >= 2575 && e <= 2576 || e >= 2579 && e <= 2600 || e >= 2602 && e <= 2608 || e >= 2610 && e <= 2611 || e >= 2613 && e <= 2614 || e >= 2616 && e <= 2617 || e >= 2649 && e <= 2652 || e == 2654 || e >= 2674 && e <= 2676 || e >= 2693 && e <= 2699 || e == 2701 || e >= 2703 && e <= 2705 || e >= 2707 && e <= 2728 || e >= 2730 && e <= 2736 || e >= 2738 && e <= 2739 || e >= 2741 && e <= 2745 || e == 2749 || e == 2784 || e >= 2821 && e <= 2828 || e >= 2831 && e <= 2832 || e >= 2835 && e <= 2856 || e >= 2858 && e <= 2864 || e >= 2866 && e <= 2867 || e >= 2870 && e <= 2873 || e == 2877 || e >= 2908 && e <= 2909 || e >= 2911 && e <= 2913 || e >= 2949 && e <= 2954 || e >= 2958 && e <= 2960 || e >= 2962 && e <= 2965 || e >= 2969 && e <= 2970 || e == 2972 || e >= 2974 && e <= 2975 || e >= 2979 && e <= 2980 || e >= 2984 && e <= 2986 || e >= 2990 && e <= 2997 || e >= 2999 && e <= 3001 || e >= 3077 && e <= 3084 || e >= 3086 && e <= 3088 || e >= 3090 && e <= 3112 || e >= 3114 && e <= 3123 || e >= 3125 && e <= 3129 || e >= 3168 && e <= 3169 || e >= 3205 && e <= 3212 || e >= 3214 && e <= 3216 || e >= 3218 && e <= 3240 || e >= 3242 && e <= 3251 || e >= 3253 && e <= 3257 || e == 3294 || e >= 3296 && e <= 3297 || e >= 3333 && e <= 3340 || e >= 3342 && e <= 3344 || e >= 3346 && e <= 3368 || e >= 3370 && e <= 3385 || e >= 3424 && e <= 3425 || e >= 3585 && e <= 3630 || e == 3632 || e >= 3634 && e <= 3635 || e >= 3648 && e <= 3653 || e >= 3713 && e <= 3714 || e == 3716 || e >= 3719 && e <= 3720 || e == 3722 || e == 3725 || e >= 3732 && e <= 3735 || e >= 3737 && e <= 3743 || e >= 3745 && e <= 3747 || e == 3749 || e == 3751 || e >= 3754 && e <= 3755 || e >= 3757 && e <= 3758 || e == 3760 || e >= 3762 && e <= 3763 || e == 3773 || e >= 3776 && e <= 3780 || e >= 3904 && e <= 3911 || e >= 3913 && e <= 3945 || e >= 4256 && e <= 4293 || e >= 4304 && e <= 4342 || e == 4352 || e >= 4354 && e <= 4355 || e >= 4357 && e <= 4359 || e == 4361 || e >= 4363 && e <= 4364 || e >= 4366 && e <= 4370 || e == 4412 || e == 4414 || e == 4416 || e == 4428 || e == 4430 || e == 4432 || e >= 4436 && e <= 4437 || e == 4441 || e >= 4447 && e <= 4449 || e == 4451 || e == 4453 || e == 4455 || e == 4457 || e >= 4461 && e <= 4462 || e >= 4466 && e <= 4467 || e == 4469 || e == 4510 || e == 4520 || e == 4523 || e >= 4526 && e <= 4527 || e >= 4535 && e <= 4536 || e == 4538 || e >= 4540 && e <= 4546 || e == 4587 || e == 4592 || e == 4601 || e >= 7680 && e <= 7835 || e >= 7840 && e <= 7929 || e >= 7936 && e <= 7957 || e >= 7960 && e <= 7965 || e >= 7968 && e <= 8005 || e >= 8008 && e <= 8013 || e >= 8016 && e <= 8023 || e == 8025 || e == 8027 || e == 8029 || e >= 8031 && e <= 8061 || e >= 8064 && e <= 8116 || e >= 8118 && e <= 8124 || e == 8126 || e >= 8130 && e <= 8132 || e >= 8134 && e <= 8140 || e >= 8144 && e <= 8147 || e >= 8150 && e <= 8155 || e >= 8160 && e <= 8172 || e >= 8178 && e <= 8180 || e >= 8182 && e <= 8188 || e == 8486 || e >= 8490 && e <= 8491 || e == 8494 || e >= 8576 && e <= 8578 || e >= 12353 && e <= 12436 || e >= 12449 && e <= 12538 || e >= 12549 && e <= 12588 || e >= 44032 && e <= 55203 || e >= 19968 && e <= 40869 || e == 12295 || e >= 12321 && e <= 12329;
    }, v.isNCNameChar = function(e) {
      return e >= 48 && e <= 57 || e >= 1632 && e <= 1641 || e >= 1776 && e <= 1785 || e >= 2406 && e <= 2415 || e >= 2534 && e <= 2543 || e >= 2662 && e <= 2671 || e >= 2790 && e <= 2799 || e >= 2918 && e <= 2927 || e >= 3047 && e <= 3055 || e >= 3174 && e <= 3183 || e >= 3302 && e <= 3311 || e >= 3430 && e <= 3439 || e >= 3664 && e <= 3673 || e >= 3792 && e <= 3801 || e >= 3872 && e <= 3881 || e == 46 || e == 45 || e == 95 || v.isLetter(e) || e >= 768 && e <= 837 || e >= 864 && e <= 865 || e >= 1155 && e <= 1158 || e >= 1425 && e <= 1441 || e >= 1443 && e <= 1465 || e >= 1467 && e <= 1469 || e == 1471 || e >= 1473 && e <= 1474 || e == 1476 || e >= 1611 && e <= 1618 || e == 1648 || e >= 1750 && e <= 1756 || e >= 1757 && e <= 1759 || e >= 1760 && e <= 1764 || e >= 1767 && e <= 1768 || e >= 1770 && e <= 1773 || e >= 2305 && e <= 2307 || e == 2364 || e >= 2366 && e <= 2380 || e == 2381 || e >= 2385 && e <= 2388 || e >= 2402 && e <= 2403 || e >= 2433 && e <= 2435 || e == 2492 || e == 2494 || e == 2495 || e >= 2496 && e <= 2500 || e >= 2503 && e <= 2504 || e >= 2507 && e <= 2509 || e == 2519 || e >= 2530 && e <= 2531 || e == 2562 || e == 2620 || e == 2622 || e == 2623 || e >= 2624 && e <= 2626 || e >= 2631 && e <= 2632 || e >= 2635 && e <= 2637 || e >= 2672 && e <= 2673 || e >= 2689 && e <= 2691 || e == 2748 || e >= 2750 && e <= 2757 || e >= 2759 && e <= 2761 || e >= 2763 && e <= 2765 || e >= 2817 && e <= 2819 || e == 2876 || e >= 2878 && e <= 2883 || e >= 2887 && e <= 2888 || e >= 2891 && e <= 2893 || e >= 2902 && e <= 2903 || e >= 2946 && e <= 2947 || e >= 3006 && e <= 3010 || e >= 3014 && e <= 3016 || e >= 3018 && e <= 3021 || e == 3031 || e >= 3073 && e <= 3075 || e >= 3134 && e <= 3140 || e >= 3142 && e <= 3144 || e >= 3146 && e <= 3149 || e >= 3157 && e <= 3158 || e >= 3202 && e <= 3203 || e >= 3262 && e <= 3268 || e >= 3270 && e <= 3272 || e >= 3274 && e <= 3277 || e >= 3285 && e <= 3286 || e >= 3330 && e <= 3331 || e >= 3390 && e <= 3395 || e >= 3398 && e <= 3400 || e >= 3402 && e <= 3405 || e == 3415 || e == 3633 || e >= 3636 && e <= 3642 || e >= 3655 && e <= 3662 || e == 3761 || e >= 3764 && e <= 3769 || e >= 3771 && e <= 3772 || e >= 3784 && e <= 3789 || e >= 3864 && e <= 3865 || e == 3893 || e == 3895 || e == 3897 || e == 3902 || e == 3903 || e >= 3953 && e <= 3972 || e >= 3974 && e <= 3979 || e >= 3984 && e <= 3989 || e == 3991 || e >= 3993 && e <= 4013 || e >= 4017 && e <= 4023 || e == 4025 || e >= 8400 && e <= 8412 || e == 8417 || e >= 12330 && e <= 12335 || e == 12441 || e == 12442 || e == 183 || e == 720 || e == 721 || e == 903 || e == 1600 || e == 3654 || e == 3782 || e == 12293 || e >= 12337 && e <= 12341 || e >= 12445 && e <= 12446 || e >= 12540 && e <= 12542;
    }, v.coalesceText = function(e) {
      for (var r = e.firstChild; r != null; r = r.nextSibling)
        if (r.nodeType == x.TEXT_NODE || r.nodeType == x.CDATA_SECTION_NODE) {
          var o = r.nodeValue, a = r;
          for (r = r.nextSibling; r != null && (r.nodeType == x.TEXT_NODE || r.nodeType == x.CDATA_SECTION_NODE); ) {
            o += r.nodeValue;
            var i = r;
            r = r.nextSibling, i.parentNode.removeChild(i);
          }
          if (a.nodeType == x.CDATA_SECTION_NODE) {
            var l = a.parentNode;
            if (a.nextSibling == null)
              l.removeChild(a), l.appendChild(l.ownerDocument.createTextNode(o));
            else {
              var g = a.nextSibling;
              l.removeChild(a), l.insertBefore(l.ownerDocument.createTextNode(o), g);
            }
          } else
            a.nodeValue = o;
          if (r == null)
            break;
        } else
          r.nodeType == x.ELEMENT_NODE && v.coalesceText(r);
    }, v.instance_of = function(e, r) {
      for (; e != null; ) {
        if (e.constructor === r)
          return !0;
        if (e === Object)
          return !1;
        e = e.constructor.superclass;
      }
      return !1;
    }, v.getElementById = function(e, r) {
      if (e.nodeType == x.ELEMENT_NODE && (e.getAttribute("id") == r || e.getAttributeNS(null, "id") == r))
        return e;
      for (var o = e.firstChild; o != null; o = o.nextSibling) {
        var a = v.getElementById(o, r);
        if (a != null)
          return a;
      }
      return null;
    };
    var be = function() {
      function e(o, a) {
        var i = a ? ": " + a.toString() : "";
        switch (o) {
          case r.INVALID_EXPRESSION_ERR:
            return "Invalid expression" + i;
          case r.TYPE_ERR:
            return "Type error" + i;
        }
        return null;
      }
      function r(o, a, i) {
        var l = Error.call(this, e(o, a) || i);
        return l.code = o, l.exception = a, l;
      }
      return r.prototype = Object.create(Error.prototype), r.prototype.constructor = r, r.superclass = Error, r.prototype.toString = function() {
        return this.message;
      }, r.fromMessage = function(o, a) {
        return new r(null, a, o);
      }, r.INVALID_EXPRESSION_ERR = 51, r.TYPE_ERR = 52, r;
    }();
    he.prototype = {}, he.prototype.constructor = he, he.superclass = Object.prototype;
    function he(e, r, o) {
      this.xpath = o.parse(e), this.context = new Te(), this.context.namespaceResolver = new $e(r);
    }
    he.getOwnerDocument = function(e) {
      return e.nodeType === x.DOCUMENT_NODE ? e : e.ownerDocument;
    }, he.detectHtmlDom = function(e) {
      if (!e)
        return !1;
      var r = he.getOwnerDocument(e);
      try {
        return r.implementation.hasFeature("HTML", "2.0");
      } catch {
        return !0;
      }
    }, he.prototype.evaluate = function(e, r, o) {
      this.context.expressionContextNode = e, this.context.caseInsensitive = he.detectHtmlDom(e);
      var a = this.xpath.evaluate(this.context);
      return new F(a, r);
    }, $e.prototype = {}, $e.prototype.constructor = $e, $e.superclass = Object.prototype;
    function $e(e) {
      this.xpathNSResolver = e;
    }
    $e.prototype.getNamespace = function(e, r) {
      return this.xpathNSResolver == null ? null : this.xpathNSResolver.lookupNamespaceURI(e);
    }, Qe.prototype = {}, Qe.prototype.constructor = Qe, Qe.superclass = Object.prototype;
    function Qe(e) {
      this.node = e, this.namespaceResolver = new Re();
    }
    Qe.prototype.lookupNamespaceURI = function(e) {
      return this.namespaceResolver.getNamespace(e, this.node);
    }, F.prototype = {}, F.prototype.constructor = F, F.superclass = Object.prototype;
    function F(e, r) {
      switch (r == F.ANY_TYPE && (e.constructor === T ? r = F.STRING_TYPE : e.constructor === b ? r = F.NUMBER_TYPE : e.constructor === C ? r = F.BOOLEAN_TYPE : e.constructor === m && (r = F.UNORDERED_NODE_ITERATOR_TYPE)), this.resultType = r, r) {
        case F.NUMBER_TYPE:
          this.numberValue = e.numberValue();
          return;
        case F.STRING_TYPE:
          this.stringValue = e.stringValue();
          return;
        case F.BOOLEAN_TYPE:
          this.booleanValue = e.booleanValue();
          return;
        case F.ANY_UNORDERED_NODE_TYPE:
        case F.FIRST_ORDERED_NODE_TYPE:
          if (e.constructor === m) {
            this.singleNodeValue = e.first();
            return;
          }
          break;
        case F.UNORDERED_NODE_ITERATOR_TYPE:
        case F.ORDERED_NODE_ITERATOR_TYPE:
          if (e.constructor === m) {
            this.invalidIteratorState = !1, this.nodes = e.toArray(), this.iteratorIndex = 0;
            return;
          }
          break;
        case F.UNORDERED_NODE_SNAPSHOT_TYPE:
        case F.ORDERED_NODE_SNAPSHOT_TYPE:
          if (e.constructor === m) {
            this.nodes = e.toArray(), this.snapshotLength = this.nodes.length;
            return;
          }
          break;
      }
      throw new be(be.TYPE_ERR);
    }
    F.prototype.iterateNext = function() {
      if (this.resultType != F.UNORDERED_NODE_ITERATOR_TYPE && this.resultType != F.ORDERED_NODE_ITERATOR_TYPE)
        throw new be(be.TYPE_ERR);
      return this.nodes[this.iteratorIndex++];
    }, F.prototype.snapshotItem = function(e) {
      if (this.resultType != F.UNORDERED_NODE_SNAPSHOT_TYPE && this.resultType != F.ORDERED_NODE_SNAPSHOT_TYPE)
        throw new be(be.TYPE_ERR);
      return this.nodes[e];
    }, F.ANY_TYPE = 0, F.NUMBER_TYPE = 1, F.STRING_TYPE = 2, F.BOOLEAN_TYPE = 3, F.UNORDERED_NODE_ITERATOR_TYPE = 4, F.ORDERED_NODE_ITERATOR_TYPE = 5, F.UNORDERED_NODE_SNAPSHOT_TYPE = 6, F.ORDERED_NODE_SNAPSHOT_TYPE = 7, F.ANY_UNORDERED_NODE_TYPE = 8, F.FIRST_ORDERED_NODE_TYPE = 9;
    function Gr(e, r) {
      e.createExpression = function(o, a) {
        try {
          return new he(o, a, r);
        } catch (i) {
          throw new be(be.INVALID_EXPRESSION_ERR, i);
        }
      }, e.createNSResolver = function(o) {
        return new Qe(o);
      }, e.evaluate = function(o, a, i, l, g) {
        if (l < 0 || l > 9)
          throw { code: 0, toString: function() {
            return "Request type not supported";
          } };
        return e.createExpression(o, i, r).evaluate(a, l, g);
      };
    }
    try {
      var Hr = !0;
      try {
        document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XPath", null) && (Hr = !1);
      } catch {
      }
      Hr && Gr(document, new p());
    } catch {
    }
    Gr(n, new p()), function() {
      var e = new p(), r = new Re(), o = new fe(), a = new Ue();
      function i(h) {
        return {
          getNamespace: function(P, oe) {
            var Ve = h(P, oe);
            return Ve || r.getNamespace(P, oe);
          }
        };
      }
      function l(h) {
        return i(h.getNamespace.bind(h));
      }
      function g(h) {
        return i(function(P) {
          return h[P];
        });
      }
      function I(h) {
        return h && typeof h.getNamespace == "function" ? l(h) : typeof h == "function" ? i(h) : typeof h == "object" ? g(h) : r;
      }
      function L(h) {
        if (h === null || typeof h > "u" || h instanceof T || h instanceof C || h instanceof b || h instanceof m)
          return h;
        switch (typeof h) {
          case "string":
            return new T(h);
          case "boolean":
            return new C(h);
          case "number":
            return new b(h);
        }
        var P = new m();
        return P.addArray([].concat(h)), P;
      }
      function D(h) {
        return function(P) {
          var oe = Array.prototype.slice.call(arguments, 1).map(function(Wt) {
            return Wt.evaluate(P);
          }), Ve = h.apply(this, [].concat(P, oe));
          return L(Ve);
        };
      }
      function B(h) {
        return {
          getFunction: function(P, oe) {
            var Ve = h(P, oe);
            return Ve ? D(Ve) : o.getFunction(P, oe);
          }
        };
      }
      function Ie(h) {
        return B(h.getFunction.bind(h));
      }
      function je(h) {
        return B(function(P) {
          return h[P];
        });
      }
      function ze(h) {
        return h && typeof h.getFunction == "function" ? Ie(h) : typeof h == "function" ? B(h) : typeof h == "object" ? je(h) : o;
      }
      function Ye(h) {
        return {
          getVariable: function(P, oe) {
            var Ve = h(P, oe);
            return L(Ve);
          }
        };
      }
      function or(h) {
        if (h) {
          if (typeof h.getVariable == "function")
            return Ye(h.getVariable.bind(h));
          if (typeof h == "function")
            return Ye(h);
          if (typeof h == "object")
            return Ye(function(P) {
              return h[P];
            });
        }
        return a;
      }
      function ir(h, P, oe) {
        h in oe && (P[h] = oe[h]);
      }
      function Ht(h) {
        var P = new Te();
        return h ? (P.namespaceResolver = I(h.namespaces), P.functionResolver = ze(h.functions), P.variableResolver = or(h.variables), P.expressionContextNode = h.node, ir("allowAnyNamespaceForNoPrefix", P, h), ir("isHtml", P, h)) : P.namespaceResolver = r, P;
      }
      function Xt(h, P) {
        var oe = Ht(P);
        return h.evaluate(oe);
      }
      var jt = {
        evaluate: function(h) {
          return Xt(this.expression, h);
        },
        evaluateNumber: function(h) {
          return this.evaluate(h).numberValue();
        },
        evaluateString: function(h) {
          return this.evaluate(h).stringValue();
        },
        evaluateBoolean: function(h) {
          return this.evaluate(h).booleanValue();
        },
        evaluateNodeSet: function(h) {
          return this.evaluate(h).nodeset();
        },
        select: function(h) {
          return this.evaluateNodeSet(h).toArray();
        },
        select1: function(h) {
          return this.select(h)[0];
        }
      };
      function Yt(h) {
        var P = e.parse(h);
        return Object.create(jt, {
          expression: {
            value: P
          }
        });
      }
      n.parse = Yt;
    }(), Se(
      n,
      {
        XPath: Z,
        XPathParser: p,
        XPathResult: F,
        Step: E,
        PathExpr: _,
        NodeTest: d,
        LocationPath: Oe,
        OrOperation: ue,
        AndOperation: pe,
        BarOperation: Ce,
        EqualsOperation: M,
        NotEqualOperation: j,
        LessThanOperation: ce,
        GreaterThanOperation: Ae,
        LessThanOrEqualOperation: De,
        GreaterThanOrEqualOperation: ge,
        PlusOperation: de,
        MinusOperation: me,
        MultiplyOperation: Ne,
        DivOperation: ve,
        ModOperation: xe,
        UnaryMinusOperation: le,
        FunctionCall: ye,
        VariableReference: Fe,
        XPathContext: Te,
        XNodeSet: m,
        XBoolean: C,
        XString: T,
        XNumber: b,
        NamespaceResolver: Re,
        FunctionResolver: fe,
        VariableResolver: Ue,
        Utilities: v
      }
    ), n.select = function(e, r, o) {
      return n.selectWithResolver(e, r, null, o);
    }, n.useNamespaces = function(e) {
      var r = {
        mappings: e || {},
        lookupNamespaceURI: function(o) {
          return this.mappings[o];
        }
      };
      return function(o, a, i) {
        return n.selectWithResolver(o, a, r, i);
      };
    }, n.selectWithResolver = function(e, r, o, a) {
      var i = new he(e, o, new p()), l = F.ANY_TYPE, g = i.evaluate(r, l, null);
      return g.resultType == F.STRING_TYPE ? g = g.stringValue : g.resultType == F.NUMBER_TYPE ? g = g.numberValue : g.resultType == F.BOOLEAN_TYPE ? g = g.booleanValue : (g = g.nodes, a && (g = g[0])), g;
    }, n.select1 = function(e, r) {
      return n.select(e, r, !0);
    };
    var Gt = function(e) {
      return Array.isArray(e) && e.every(A);
    }, _e = function(e) {
      return function(r) {
        return A(r) && r.nodeType === e;
      };
    };
    Se(
      n,
      {
        isNodeLike: A,
        isArrayOfNodes: Gt,
        isElement: _e(x.ELEMENT_NODE),
        isAttribute: _e(x.ATTRIBUTE_NODE),
        isTextNode: _e(x.TEXT_NODE),
        isCDATASection: _e(x.CDATA_SECTION_NODE),
        isProcessingInstruction: _e(x.PROCESSING_INSTRUCTION_NODE),
        isComment: _e(x.COMMENT_NODE),
        isDocumentNode: _e(x.DOCUMENT_NODE),
        isDocumentTypeNode: _e(x.DOCUMENT_TYPE_NODE),
        isDocumentFragment: _e(x.DOCUMENT_FRAGMENT_NODE)
      }
    );
  })(u);
})(nt);
const Qt = /* @__PURE__ */ $t(nt);
var Ge = {}, Me = {};
function zt(t, u, n) {
  if (n === void 0 && (n = Array.prototype), t && typeof n.find == "function")
    return n.find.call(t, u);
  for (var s = 0; s < t.length; s++)
    if (Object.prototype.hasOwnProperty.call(t, s)) {
      var c = t[s];
      if (u.call(void 0, c, s, t))
        return c;
    }
}
function Or(t, u) {
  return u === void 0 && (u = Object), u && typeof u.freeze == "function" ? u.freeze(t) : t;
}
function Jt(t, u) {
  if (t === null || typeof t != "object")
    throw new TypeError("target is not an object");
  for (var n in u)
    Object.prototype.hasOwnProperty.call(u, n) && (t[n] = u[n]);
  return t;
}
var ot = Or({
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
  isHTML: function(t) {
    return t === ot.HTML;
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
}), it = Or({
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
  isHTML: function(t) {
    return t === it.HTML;
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
Me.assign = Jt;
Me.find = zt;
Me.freeze = Or;
Me.MIME_TYPE = ot;
Me.NAMESPACE = it;
var st = Me, we = st.find, pr = st.NAMESPACE;
function Zt(t) {
  return t !== "";
}
function Kt(t) {
  return t ? t.split(/[\t\n\f\r ]+/).filter(Zt) : [];
}
function eu(t, u) {
  return t.hasOwnProperty(u) || (t[u] = !0), t;
}
function Xr(t) {
  if (!t)
    return [];
  var u = Kt(t);
  return Object.keys(u.reduce(eu, {}));
}
function ru(t) {
  return function(u) {
    return t && t.indexOf(u) !== -1;
  };
}
function hr(t, u) {
  for (var n in t)
    Object.prototype.hasOwnProperty.call(t, n) && (u[n] = t[n]);
}
function se(t, u) {
  var n = t.prototype;
  if (!(n instanceof u)) {
    let s = function() {
    };
    s.prototype = u.prototype, s = new s(), hr(n, s), t.prototype = n = s;
  }
  n.constructor != t && (typeof t != "function" && console.error("unknown Class:" + t), n.constructor = t);
}
var ae = {}, Ee = ae.ELEMENT_NODE = 1, tr = ae.ATTRIBUTE_NODE = 2, mr = ae.TEXT_NODE = 3, at = ae.CDATA_SECTION_NODE = 4, lt = ae.ENTITY_REFERENCE_NODE = 5, tu = ae.ENTITY_NODE = 6, pt = ae.PROCESSING_INSTRUCTION_NODE = 7, ct = ae.COMMENT_NODE = 8, ft = ae.DOCUMENT_NODE = 9, ht = ae.DOCUMENT_TYPE_NODE = 10, Pe = ae.DOCUMENT_FRAGMENT_NODE = 11, uu = ae.NOTATION_NODE = 12, re = {}, K = {};
re.INDEX_SIZE_ERR = (K[1] = "Index size error", 1);
re.DOMSTRING_SIZE_ERR = (K[2] = "DOMString size error", 2);
var ie = re.HIERARCHY_REQUEST_ERR = (K[3] = "Hierarchy request error", 3);
re.WRONG_DOCUMENT_ERR = (K[4] = "Wrong document", 4);
re.INVALID_CHARACTER_ERR = (K[5] = "Invalid character", 5);
re.NO_DATA_ALLOWED_ERR = (K[6] = "No data allowed", 6);
re.NO_MODIFICATION_ALLOWED_ERR = (K[7] = "No modification allowed", 7);
var Et = re.NOT_FOUND_ERR = (K[8] = "Not found", 8);
re.NOT_SUPPORTED_ERR = (K[9] = "Not supported", 9);
var jr = re.INUSE_ATTRIBUTE_ERR = (K[10] = "Attribute in use", 10);
re.INVALID_STATE_ERR = (K[11] = "Invalid state", 11);
re.SYNTAX_ERR = (K[12] = "Syntax error", 12);
re.INVALID_MODIFICATION_ERR = (K[13] = "Invalid modification", 13);
re.NAMESPACE_ERR = (K[14] = "Invalid namespace", 14);
re.INVALID_ACCESS_ERR = (K[15] = "Invalid access", 15);
function z(t, u) {
  if (u instanceof Error)
    var n = u;
  else
    n = this, Error.call(this, K[t]), this.message = K[t], Error.captureStackTrace && Error.captureStackTrace(this, z);
  return n.code = t, u && (this.message = this.message + ": " + u), n;
}
z.prototype = Error.prototype;
hr(re, z);
function Le() {
}
Le.prototype = {
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
  item: function(t) {
    return t >= 0 && t < this.length ? this[t] : null;
  },
  toString: function(t, u) {
    for (var n = [], s = 0; s < this.length; s++)
      rr(this[s], n, t, u);
    return n.join("");
  },
  /**
   * @private
   * @param {function (Node):boolean} predicate
   * @returns {Node[]}
   */
  filter: function(t) {
    return Array.prototype.filter.call(this, t);
  },
  /**
   * @private
   * @param {Node} item
   * @returns {number}
   */
  indexOf: function(t) {
    return Array.prototype.indexOf.call(this, t);
  }
};
function ur(t, u) {
  this._node = t, this._refresh = u, Fr(this);
}
function Fr(t) {
  var u = t._node._inc || t._node.ownerDocument._inc;
  if (t._inc !== u) {
    var n = t._refresh(t._node);
    if (bt(t, "length", n.length), !t.$$length || n.length < t.$$length)
      for (var s = n.length; s in t; s++)
        Object.prototype.hasOwnProperty.call(t, s) && delete t[s];
    hr(n, t), t._inc = u;
  }
}
ur.prototype.item = function(t) {
  return Fr(this), this[t] || null;
};
se(ur, Le);
function Nr() {
}
function At(t, u) {
  for (var n = t.length; n--; )
    if (t[n] === u)
      return n;
}
function Yr(t, u, n, s) {
  if (s ? u[At(u, s)] = n : u[u.length++] = n, t) {
    n.ownerElement = t;
    var c = t.ownerDocument;
    c && (s && dt(c, t, s), nu(c, t, n));
  }
}
function Wr(t, u, n) {
  var s = At(u, n);
  if (s >= 0) {
    for (var c = u.length - 1; s < c; )
      u[s] = u[++s];
    if (u.length = c, t) {
      var f = t.ownerDocument;
      f && (dt(f, t, n), n.ownerElement = null);
    }
  } else
    throw new z(Et, new Error(t.tagName + "@" + n));
}
Nr.prototype = {
  length: 0,
  item: Le.prototype.item,
  getNamedItem: function(t) {
    for (var u = this.length; u--; ) {
      var n = this[u];
      if (n.nodeName == t)
        return n;
    }
  },
  setNamedItem: function(t) {
    var u = t.ownerElement;
    if (u && u != this._ownerElement)
      throw new z(jr);
    var n = this.getNamedItem(t.nodeName);
    return Yr(this._ownerElement, this, t, n), n;
  },
  /* returns Node */
  setNamedItemNS: function(t) {
    var u = t.ownerElement, n;
    if (u && u != this._ownerElement)
      throw new z(jr);
    return n = this.getNamedItemNS(t.namespaceURI, t.localName), Yr(this._ownerElement, this, t, n), n;
  },
  /* returns Node */
  removeNamedItem: function(t) {
    var u = this.getNamedItem(t);
    return Wr(this._ownerElement, this, u), u;
  },
  // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
  //for level2
  removeNamedItemNS: function(t, u) {
    var n = this.getNamedItemNS(t, u);
    return Wr(this._ownerElement, this, n), n;
  },
  getNamedItemNS: function(t, u) {
    for (var n = this.length; n--; ) {
      var s = this[n];
      if (s.localName == u && s.namespaceURI == t)
        return s;
    }
    return null;
  }
};
function Dt() {
}
Dt.prototype = {
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
  hasFeature: function(t, u) {
    return !0;
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
  createDocument: function(t, u, n) {
    var s = new Er();
    if (s.implementation = this, s.childNodes = new Le(), s.doctype = n || null, n && s.appendChild(n), u) {
      var c = s.createElementNS(t, u);
      s.appendChild(c);
    }
    return s;
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
  createDocumentType: function(t, u, n) {
    var s = new Cr();
    return s.name = t, s.nodeName = t, s.publicId = u || "", s.systemId = n || "", s;
  }
};
function V() {
}
V.prototype = {
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
  insertBefore: function(t, u) {
    return vr(this, t, u);
  },
  replaceChild: function(t, u) {
    vr(this, t, u, Nt), u && this.removeChild(u);
  },
  removeChild: function(t) {
    return mt(this, t);
  },
  appendChild: function(t) {
    return this.insertBefore(t, null);
  },
  hasChildNodes: function() {
    return this.firstChild != null;
  },
  cloneNode: function(t) {
    return wr(this.ownerDocument || this, this, t);
  },
  // Modified in DOM Level 2:
  normalize: function() {
    for (var t = this.firstChild; t; ) {
      var u = t.nextSibling;
      u && u.nodeType == mr && t.nodeType == mr ? (this.removeChild(u), t.appendData(u.data)) : (t.normalize(), t = u);
    }
  },
  // Introduced in DOM Level 2:
  isSupported: function(t, u) {
    return this.ownerDocument.implementation.hasFeature(t, u);
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
  lookupPrefix: function(t) {
    for (var u = this; u; ) {
      var n = u._nsMap;
      if (n) {
        for (var s in n)
          if (Object.prototype.hasOwnProperty.call(n, s) && n[s] === t)
            return s;
      }
      u = u.nodeType == tr ? u.ownerDocument : u.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  lookupNamespaceURI: function(t) {
    for (var u = this; u; ) {
      var n = u._nsMap;
      if (n && Object.prototype.hasOwnProperty.call(n, t))
        return n[t];
      u = u.nodeType == tr ? u.ownerDocument : u.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  isDefaultNamespace: function(t) {
    var u = this.lookupPrefix(t);
    return u == null;
  }
};
function gt(t) {
  return t == "<" && "&lt;" || t == ">" && "&gt;" || t == "&" && "&amp;" || t == '"' && "&quot;" || "&#" + t.charCodeAt() + ";";
}
hr(ae, V);
hr(ae, V.prototype);
function cr(t, u) {
  if (u(t))
    return !0;
  if (t = t.firstChild)
    do
      if (cr(t, u))
        return !0;
    while (t = t.nextSibling);
}
function Er() {
  this.ownerDocument = this;
}
function nu(t, u, n) {
  t && t._inc++;
  var s = n.namespaceURI;
  s === pr.XMLNS && (u._nsMap[n.prefix ? n.localName : ""] = n.value);
}
function dt(t, u, n, s) {
  t && t._inc++;
  var c = n.namespaceURI;
  c === pr.XMLNS && delete u._nsMap[n.prefix ? n.localName : ""];
}
function Rr(t, u, n) {
  if (t && t._inc) {
    t._inc++;
    var s = u.childNodes;
    if (n)
      s[s.length++] = n;
    else {
      for (var c = u.firstChild, f = 0; c; )
        s[f++] = c, c = c.nextSibling;
      s.length = f, delete s[s.length];
    }
  }
}
function mt(t, u) {
  var n = u.previousSibling, s = u.nextSibling;
  return n ? n.nextSibling = s : t.firstChild = s, s ? s.previousSibling = n : t.lastChild = n, u.parentNode = null, u.previousSibling = null, u.nextSibling = null, Rr(t.ownerDocument, t), u;
}
function ou(t) {
  return t && (t.nodeType === V.DOCUMENT_NODE || t.nodeType === V.DOCUMENT_FRAGMENT_NODE || t.nodeType === V.ELEMENT_NODE);
}
function iu(t) {
  return t && (Be(t) || _r(t) || qe(t) || t.nodeType === V.DOCUMENT_FRAGMENT_NODE || t.nodeType === V.COMMENT_NODE || t.nodeType === V.PROCESSING_INSTRUCTION_NODE);
}
function qe(t) {
  return t && t.nodeType === V.DOCUMENT_TYPE_NODE;
}
function Be(t) {
  return t && t.nodeType === V.ELEMENT_NODE;
}
function _r(t) {
  return t && t.nodeType === V.TEXT_NODE;
}
function $r(t, u) {
  var n = t.childNodes || [];
  if (we(n, Be) || qe(u))
    return !1;
  var s = we(n, qe);
  return !(u && s && n.indexOf(s) > n.indexOf(u));
}
function Qr(t, u) {
  var n = t.childNodes || [];
  function s(f) {
    return Be(f) && f !== u;
  }
  if (we(n, s))
    return !1;
  var c = we(n, qe);
  return !(u && c && n.indexOf(c) > n.indexOf(u));
}
function su(t, u, n) {
  if (!ou(t))
    throw new z(ie, "Unexpected parent node type " + t.nodeType);
  if (n && n.parentNode !== t)
    throw new z(Et, "child not in parent");
  if (
    // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
    !iu(u) || // 5. If either `node` is a Text node and `parent` is a document,
    // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
    // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
    // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
    qe(u) && t.nodeType !== V.DOCUMENT_NODE
  )
    throw new z(
      ie,
      "Unexpected node type " + u.nodeType + " for parent node type " + t.nodeType
    );
}
function au(t, u, n) {
  var s = t.childNodes || [], c = u.childNodes || [];
  if (u.nodeType === V.DOCUMENT_FRAGMENT_NODE) {
    var f = c.filter(Be);
    if (f.length > 1 || we(c, _r))
      throw new z(ie, "More than one element or text in fragment");
    if (f.length === 1 && !$r(t, n))
      throw new z(ie, "Element in fragment can not be inserted before doctype");
  }
  if (Be(u) && !$r(t, n))
    throw new z(ie, "Only one element can be added and only after doctype");
  if (qe(u)) {
    if (we(s, qe))
      throw new z(ie, "Only one doctype is allowed");
    var A = we(s, Be);
    if (n && s.indexOf(A) < s.indexOf(n))
      throw new z(ie, "Doctype can only be inserted before an element");
    if (!n && A)
      throw new z(ie, "Doctype can not be appended since element is present");
  }
}
function Nt(t, u, n) {
  var s = t.childNodes || [], c = u.childNodes || [];
  if (u.nodeType === V.DOCUMENT_FRAGMENT_NODE) {
    var f = c.filter(Be);
    if (f.length > 1 || we(c, _r))
      throw new z(ie, "More than one element or text in fragment");
    if (f.length === 1 && !Qr(t, n))
      throw new z(ie, "Element in fragment can not be inserted before doctype");
  }
  if (Be(u) && !Qr(t, n))
    throw new z(ie, "Only one element can be added and only after doctype");
  if (qe(u)) {
    if (we(s, function(N) {
      return qe(N) && N !== n;
    }))
      throw new z(ie, "Only one doctype is allowed");
    var A = we(s, Be);
    if (n && s.indexOf(A) < s.indexOf(n))
      throw new z(ie, "Doctype can only be inserted before an element");
  }
}
function vr(t, u, n, s) {
  su(t, u, n), t.nodeType === V.DOCUMENT_NODE && (s || au)(t, u, n);
  var c = u.parentNode;
  if (c && c.removeChild(u), u.nodeType === Pe) {
    var f = u.firstChild;
    if (f == null)
      return u;
    var A = u.lastChild;
  } else
    f = A = u;
  var y = n ? n.previousSibling : t.lastChild;
  f.previousSibling = y, A.nextSibling = n, y ? y.nextSibling = f : t.firstChild = f, n == null ? t.lastChild = A : n.previousSibling = A;
  do
    f.parentNode = t;
  while (f !== A && (f = f.nextSibling));
  return Rr(t.ownerDocument || t, t), u.nodeType == Pe && (u.firstChild = u.lastChild = null), u;
}
function lu(t, u) {
  return u.parentNode && u.parentNode.removeChild(u), u.parentNode = t, u.previousSibling = t.lastChild, u.nextSibling = null, u.previousSibling ? u.previousSibling.nextSibling = u : t.firstChild = u, t.lastChild = u, Rr(t.ownerDocument, t, u), u;
}
Er.prototype = {
  //implementation : null,
  nodeName: "#document",
  nodeType: ft,
  /**
   * The DocumentType node of the document.
   *
   * @readonly
   * @type DocumentType
   */
  doctype: null,
  documentElement: null,
  _inc: 1,
  insertBefore: function(t, u) {
    if (t.nodeType == Pe) {
      for (var n = t.firstChild; n; ) {
        var s = n.nextSibling;
        this.insertBefore(n, u), n = s;
      }
      return t;
    }
    return vr(this, t, u), t.ownerDocument = this, this.documentElement === null && t.nodeType === Ee && (this.documentElement = t), t;
  },
  removeChild: function(t) {
    return this.documentElement == t && (this.documentElement = null), mt(this, t);
  },
  replaceChild: function(t, u) {
    vr(this, t, u, Nt), t.ownerDocument = this, u && this.removeChild(u), Be(t) && (this.documentElement = t);
  },
  // Introduced in DOM Level 2:
  importNode: function(t, u) {
    return Tt(this, t, u);
  },
  // Introduced in DOM Level 2:
  getElementById: function(t) {
    var u = null;
    return cr(this.documentElement, function(n) {
      if (n.nodeType == Ee && n.getAttribute("id") == t)
        return u = n, !0;
    }), u;
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
  getElementsByClassName: function(t) {
    var u = Xr(t);
    return new ur(this, function(n) {
      var s = [];
      return u.length > 0 && cr(n.documentElement, function(c) {
        if (c !== n && c.nodeType === Ee) {
          var f = c.getAttribute("class");
          if (f) {
            var A = t === f;
            if (!A) {
              var y = Xr(f);
              A = u.every(ru(y));
            }
            A && s.push(c);
          }
        }
      }), s;
    });
  },
  //document factory method:
  createElement: function(t) {
    var u = new We();
    u.ownerDocument = this, u.nodeName = t, u.tagName = t, u.localName = t, u.childNodes = new Le();
    var n = u.attributes = new Nr();
    return n._ownerElement = u, u;
  },
  createDocumentFragment: function() {
    var t = new yr();
    return t.ownerDocument = this, t.childNodes = new Le(), t;
  },
  createTextNode: function(t) {
    var u = new Ir();
    return u.ownerDocument = this, u.appendData(t), u;
  },
  createComment: function(t) {
    var u = new Lr();
    return u.ownerDocument = this, u.appendData(t), u;
  },
  createCDATASection: function(t) {
    var u = new Pr();
    return u.ownerDocument = this, u.appendData(t), u;
  },
  createProcessingInstruction: function(t, u) {
    var n = new Mr();
    return n.ownerDocument = this, n.tagName = n.nodeName = n.target = t, n.nodeValue = n.data = u, n;
  },
  createAttribute: function(t) {
    var u = new xr();
    return u.ownerDocument = this, u.name = t, u.nodeName = t, u.localName = t, u.specified = !0, u;
  },
  createEntityReference: function(t) {
    var u = new qr();
    return u.ownerDocument = this, u.nodeName = t, u;
  },
  // Introduced in DOM Level 2:
  createElementNS: function(t, u) {
    var n = new We(), s = u.split(":"), c = n.attributes = new Nr();
    return n.childNodes = new Le(), n.ownerDocument = this, n.nodeName = u, n.tagName = u, n.namespaceURI = t, s.length == 2 ? (n.prefix = s[0], n.localName = s[1]) : n.localName = u, c._ownerElement = n, n;
  },
  // Introduced in DOM Level 2:
  createAttributeNS: function(t, u) {
    var n = new xr(), s = u.split(":");
    return n.ownerDocument = this, n.nodeName = u, n.name = u, n.namespaceURI = t, n.specified = !0, s.length == 2 ? (n.prefix = s[0], n.localName = s[1]) : n.localName = u, n;
  }
};
se(Er, V);
function We() {
  this._nsMap = {};
}
We.prototype = {
  nodeType: Ee,
  hasAttribute: function(t) {
    return this.getAttributeNode(t) != null;
  },
  getAttribute: function(t) {
    var u = this.getAttributeNode(t);
    return u && u.value || "";
  },
  getAttributeNode: function(t) {
    return this.attributes.getNamedItem(t);
  },
  setAttribute: function(t, u) {
    var n = this.ownerDocument.createAttribute(t);
    n.value = n.nodeValue = "" + u, this.setAttributeNode(n);
  },
  removeAttribute: function(t) {
    var u = this.getAttributeNode(t);
    u && this.removeAttributeNode(u);
  },
  //four real opeartion method
  appendChild: function(t) {
    return t.nodeType === Pe ? this.insertBefore(t, null) : lu(this, t);
  },
  setAttributeNode: function(t) {
    return this.attributes.setNamedItem(t);
  },
  setAttributeNodeNS: function(t) {
    return this.attributes.setNamedItemNS(t);
  },
  removeAttributeNode: function(t) {
    return this.attributes.removeNamedItem(t.nodeName);
  },
  //get real attribute name,and remove it by removeAttributeNode
  removeAttributeNS: function(t, u) {
    var n = this.getAttributeNodeNS(t, u);
    n && this.removeAttributeNode(n);
  },
  hasAttributeNS: function(t, u) {
    return this.getAttributeNodeNS(t, u) != null;
  },
  getAttributeNS: function(t, u) {
    var n = this.getAttributeNodeNS(t, u);
    return n && n.value || "";
  },
  setAttributeNS: function(t, u, n) {
    var s = this.ownerDocument.createAttributeNS(t, u);
    s.value = s.nodeValue = "" + n, this.setAttributeNode(s);
  },
  getAttributeNodeNS: function(t, u) {
    return this.attributes.getNamedItemNS(t, u);
  },
  getElementsByTagName: function(t) {
    return new ur(this, function(u) {
      var n = [];
      return cr(u, function(s) {
        s !== u && s.nodeType == Ee && (t === "*" || s.tagName == t) && n.push(s);
      }), n;
    });
  },
  getElementsByTagNameNS: function(t, u) {
    return new ur(this, function(n) {
      var s = [];
      return cr(n, function(c) {
        c !== n && c.nodeType === Ee && (t === "*" || c.namespaceURI === t) && (u === "*" || c.localName == u) && s.push(c);
      }), s;
    });
  }
};
Er.prototype.getElementsByTagName = We.prototype.getElementsByTagName;
Er.prototype.getElementsByTagNameNS = We.prototype.getElementsByTagNameNS;
se(We, V);
function xr() {
}
xr.prototype.nodeType = tr;
se(xr, V);
function Ar() {
}
Ar.prototype = {
  data: "",
  substringData: function(t, u) {
    return this.data.substring(t, t + u);
  },
  appendData: function(t) {
    t = this.data + t, this.nodeValue = this.data = t, this.length = t.length;
  },
  insertData: function(t, u) {
    this.replaceData(t, 0, u);
  },
  appendChild: function(t) {
    throw new Error(K[ie]);
  },
  deleteData: function(t, u) {
    this.replaceData(t, u, "");
  },
  replaceData: function(t, u, n) {
    var s = this.data.substring(0, t), c = this.data.substring(t + u);
    n = s + n + c, this.nodeValue = this.data = n, this.length = n.length;
  }
};
se(Ar, V);
function Ir() {
}
Ir.prototype = {
  nodeName: "#text",
  nodeType: mr,
  splitText: function(t) {
    var u = this.data, n = u.substring(t);
    u = u.substring(0, t), this.data = this.nodeValue = u, this.length = u.length;
    var s = this.ownerDocument.createTextNode(n);
    return this.parentNode && this.parentNode.insertBefore(s, this.nextSibling), s;
  }
};
se(Ir, Ar);
function Lr() {
}
Lr.prototype = {
  nodeName: "#comment",
  nodeType: ct
};
se(Lr, Ar);
function Pr() {
}
Pr.prototype = {
  nodeName: "#cdata-section",
  nodeType: at
};
se(Pr, Ar);
function Cr() {
}
Cr.prototype.nodeType = ht;
se(Cr, V);
function vt() {
}
vt.prototype.nodeType = uu;
se(vt, V);
function xt() {
}
xt.prototype.nodeType = tu;
se(xt, V);
function qr() {
}
qr.prototype.nodeType = lt;
se(qr, V);
function yr() {
}
yr.prototype.nodeName = "#document-fragment";
yr.prototype.nodeType = Pe;
se(yr, V);
function Mr() {
}
Mr.prototype.nodeType = pt;
se(Mr, V);
function Ct() {
}
Ct.prototype.serializeToString = function(t, u, n) {
  return yt.call(t, u, n);
};
V.prototype.toString = yt;
function yt(t, u) {
  var n = [], s = this.nodeType == 9 && this.documentElement || this, c = s.prefix, f = s.namespaceURI;
  if (f && c == null) {
    var c = s.lookupPrefix(f);
    if (c == null)
      var A = [
        { namespace: f, prefix: null }
        //{namespace:uri,prefix:''}
      ];
  }
  return rr(this, n, t, u, A), n.join("");
}
function zr(t, u, n) {
  var s = t.prefix || "", c = t.namespaceURI;
  if (!c || s === "xml" && c === pr.XML || c === pr.XMLNS)
    return !1;
  for (var f = n.length; f--; ) {
    var A = n[f];
    if (A.prefix === s)
      return A.namespace !== c;
  }
  return !0;
}
function br(t, u, n) {
  t.push(" ", u, '="', n.replace(/[<>&"\t\n\r]/g, gt), '"');
}
function rr(t, u, n, s, c) {
  if (c || (c = []), s)
    if (t = s(t), t) {
      if (typeof t == "string") {
        u.push(t);
        return;
      }
    } else
      return;
  switch (t.nodeType) {
    case Ee:
      var f = t.attributes, A = f.length, Q = t.firstChild, y = t.tagName;
      n = pr.isHTML(t.namespaceURI) || n;
      var N = y;
      if (!n && !t.prefix && t.namespaceURI) {
        for (var w, S = 0; S < f.length; S++)
          if (f.item(S).name === "xmlns") {
            w = f.item(S).value;
            break;
          }
        if (!w)
          for (var k = c.length - 1; k >= 0; k--) {
            var q = c[k];
            if (q.prefix === "" && q.namespace === t.namespaceURI) {
              w = q.namespace;
              break;
            }
          }
        if (w !== t.namespaceURI)
          for (var k = c.length - 1; k >= 0; k--) {
            var q = c[k];
            if (q.namespace === t.namespaceURI) {
              q.prefix && (N = q.prefix + ":" + y);
              break;
            }
          }
      }
      u.push("<", N);
      for (var $ = 0; $ < A; $++) {
        var J = f.item($);
        J.prefix == "xmlns" ? c.push({ prefix: J.localName, namespace: J.value }) : J.nodeName == "xmlns" && c.push({ prefix: "", namespace: J.value });
      }
      for (var $ = 0; $ < A; $++) {
        var J = f.item($);
        if (zr(J, n, c)) {
          var H = J.prefix || "", G = J.namespaceURI;
          br(u, H ? "xmlns:" + H : "xmlns", G), c.push({ prefix: H, namespace: G });
        }
        rr(J, u, n, s, c);
      }
      if (y === N && zr(t, n, c)) {
        var H = t.prefix || "", G = t.namespaceURI;
        br(u, H ? "xmlns:" + H : "xmlns", G), c.push({ prefix: H, namespace: G });
      }
      if (Q || n && !/^(?:meta|link|img|br|hr|input)$/i.test(y)) {
        if (u.push(">"), n && /^script$/i.test(y))
          for (; Q; )
            Q.data ? u.push(Q.data) : rr(Q, u, n, s, c.slice()), Q = Q.nextSibling;
        else
          for (; Q; )
            rr(Q, u, n, s, c.slice()), Q = Q.nextSibling;
        u.push("</", N, ">");
      } else
        u.push("/>");
      return;
    case ft:
    case Pe:
      for (var Q = t.firstChild; Q; )
        rr(Q, u, n, s, c.slice()), Q = Q.nextSibling;
      return;
    case tr:
      return br(u, t.name, t.value);
    case mr:
      return u.push(
        t.data.replace(/[<&>]/g, gt)
      );
    case at:
      return u.push("<![CDATA[", t.data, "]]>");
    case ct:
      return u.push("<!--", t.data, "-->");
    case ht:
      var He = t.publicId, Y = t.systemId;
      if (u.push("<!DOCTYPE ", t.name), He)
        u.push(" PUBLIC ", He), Y && Y != "." && u.push(" ", Y), u.push(">");
      else if (Y && Y != ".")
        u.push(" SYSTEM ", Y, ">");
      else {
        var te = t.internalSubset;
        te && u.push(" [", te, "]"), u.push(">");
      }
      return;
    case pt:
      return u.push("<?", t.target, " ", t.data, "?>");
    case lt:
      return u.push("&", t.nodeName, ";");
    default:
      u.push("??", t.nodeName);
  }
}
function Tt(t, u, n) {
  var s;
  switch (u.nodeType) {
    case Ee:
      s = u.cloneNode(!1), s.ownerDocument = t;
    case Pe:
      break;
    case tr:
      n = !0;
      break;
  }
  if (s || (s = u.cloneNode(!1)), s.ownerDocument = t, s.parentNode = null, n)
    for (var c = u.firstChild; c; )
      s.appendChild(Tt(t, c, n)), c = c.nextSibling;
  return s;
}
function wr(t, u, n) {
  var s = new u.constructor();
  for (var c in u)
    if (Object.prototype.hasOwnProperty.call(u, c)) {
      var f = u[c];
      typeof f != "object" && f != s[c] && (s[c] = f);
    }
  switch (u.childNodes && (s.childNodes = new Le()), s.ownerDocument = t, s.nodeType) {
    case Ee:
      var A = u.attributes, y = s.attributes = new Nr(), N = A.length;
      y._ownerElement = s;
      for (var w = 0; w < N; w++)
        s.setAttributeNode(wr(t, A.item(w), !0));
      break;
    case tr:
      n = !0;
  }
  if (n)
    for (var S = u.firstChild; S; )
      s.appendChild(wr(t, S, n)), S = S.nextSibling;
  return s;
}
function bt(t, u, n) {
  t[u] = n;
}
try {
  if (Object.defineProperty) {
    let t = function(u) {
      switch (u.nodeType) {
        case Ee:
        case Pe:
          var n = [];
          for (u = u.firstChild; u; )
            u.nodeType !== 7 && u.nodeType !== 8 && n.push(t(u)), u = u.nextSibling;
          return n.join("");
        default:
          return u.nodeValue;
      }
    };
    Object.defineProperty(ur.prototype, "length", {
      get: function() {
        return Fr(this), this.$$length;
      }
    }), Object.defineProperty(V.prototype, "textContent", {
      get: function() {
        return t(this);
      },
      set: function(u) {
        switch (this.nodeType) {
          case Ee:
          case Pe:
            for (; this.firstChild; )
              this.removeChild(this.firstChild);
            (u || String(u)) && this.appendChild(this.ownerDocument.createTextNode(u));
            break;
          default:
            this.data = u, this.value = u, this.nodeValue = u;
        }
      }
    }), bt = function(u, n, s) {
      u["$$" + n] = s;
    };
  }
} catch {
}
Ge.DocumentType = Cr;
Ge.DOMException = z;
Ge.DOMImplementation = Dt;
Ge.Element = We;
Ge.Node = V;
Ge.NodeList = Le;
Ge.XMLSerializer = Ct;
var Tr = {}, wt = {};
(function(t) {
  var u = Me.freeze;
  t.XML_ENTITIES = u({
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
  }), t.HTML_ENTITIES = u({
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
    NewLine: `
`,
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
  }), t.entityMap = t.HTML_ENTITIES;
})(wt);
var Ur = {}, fr = Me.NAMESPACE, Br = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, Jr = new RegExp("[\\-\\.0-9" + Br.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), Zr = new RegExp("^" + Br.source + Jr.source + "*(?::" + Br.source + Jr.source + "*)?$"), sr = 0, ke = 1, Je = 2, ar = 3, Ze = 4, Ke = 5, lr = 6, gr = 7;
function nr(t, u) {
  this.message = t, this.locator = u, Error.captureStackTrace && Error.captureStackTrace(this, nr);
}
nr.prototype = new Error();
nr.prototype.name = nr.name;
function Bt() {
}
Bt.prototype = {
  parse: function(t, u, n) {
    var s = this.domBuilder;
    s.startDocument(), St(u, u = {}), pu(
      t,
      u,
      n,
      s,
      this.errorHandler
    ), s.endDocument();
  }
};
function pu(t, u, n, s, c) {
  function f(M) {
    if (M > 65535) {
      M -= 65536;
      var j = 55296 + (M >> 10), ce = 56320 + (M & 1023);
      return String.fromCharCode(j, ce);
    } else
      return String.fromCharCode(M);
  }
  function A(M) {
    var j = M.slice(1, -1);
    return Object.hasOwnProperty.call(n, j) ? n[j] : j.charAt(0) === "#" ? f(parseInt(j.substr(1).replace("x", "0x"))) : (c.error("entity not found:" + M), M);
  }
  function y(M) {
    if (M > H) {
      var j = t.substring(H, M).replace(/&#?\w+;/g, A);
      q && N(H), s.characters(j, 0, M - H), H = M;
    }
  }
  function N(M, j) {
    for (; M >= S && (j = k.exec(t)); )
      w = j.index, S = w + j[0].length, q.lineNumber++;
    q.columnNumber = M - w + 1;
  }
  for (var w = 0, S = 0, k = /.*(?:\r\n?|\n)|.*$/g, q = s.locator, $ = [{ currentNSMap: u }], J = {}, H = 0; ; ) {
    try {
      var G = t.indexOf("<", H);
      if (G < 0) {
        if (!t.substr(H).match(/^\s*$/)) {
          var Q = s.doc, He = Q.createTextNode(t.substr(H));
          Q.appendChild(He), s.currentElement = He;
        }
        return;
      }
      switch (G > H && y(G), t.charAt(G + 1)) {
        case "/":
          var X = t.indexOf(">", G + 3), Y = t.substring(G + 2, X).replace(/[ \t\n\r]+$/g, ""), te = $.pop();
          X < 0 ? (Y = t.substring(G + 2).replace(/[\s<].*/, ""), c.error("end tag name: " + Y + " is not complete:" + te.tagName), X = G + 1 + Y.length) : Y.match(/\s</) && (Y = Y.replace(/[\s<].*/, ""), c.error("end tag name: " + Y + " maybe not complete"), X = G + 1 + Y.length);
          var Se = te.localNSMap, x = te.tagName == Y, p = x || te.tagName && te.tagName.toLowerCase() == Y.toLowerCase();
          if (p) {
            if (s.endElement(te.uri, te.localName, Y), Se)
              for (var Z in Se)
                Object.prototype.hasOwnProperty.call(Se, Z) && s.endPrefixMapping(Z);
            x || c.fatalError("end tag name: " + Y + " is not match the current start tagName:" + te.tagName);
          } else
            $.push(te);
          X++;
          break;
        case "?":
          q && N(G), X = Au(t, G, s);
          break;
        case "!":
          q && N(G), X = Eu(t, G, s, c);
          break;
        default:
          q && N(G);
          var ee = new Ot(), U = $[$.length - 1].currentNSMap, X = cu(t, G, ee, U, A, c), le = ee.length;
          if (!ee.closed && hu(t, X, ee.tagName, J) && (ee.closed = !0, n.nbsp || c.warning("unclosed xml attribute")), q && le) {
            for (var R = Kr(q, {}), ue = 0; ue < le; ue++) {
              var pe = ee[ue];
              N(pe.offset), pe.locator = Kr(q, {});
            }
            s.locator = R, et(ee, s, U) && $.push(ee), s.locator = q;
          } else
            et(ee, s, U) && $.push(ee);
          fr.isHTML(ee.uri) && !ee.closed ? X = fu(t, X, ee.tagName, A, s) : X++;
      }
    } catch (M) {
      if (M instanceof nr)
        throw M;
      c.error("element parse error: " + M), X = -1;
    }
    X > H ? H = X : y(Math.max(G, H) + 1);
  }
}
function Kr(t, u) {
  return u.lineNumber = t.lineNumber, u.columnNumber = t.columnNumber, u;
}
function cu(t, u, n, s, c, f) {
  function A(q, $, J) {
    n.attributeNames.hasOwnProperty(q) && f.fatalError("Attribute " + q + " redefined"), n.addValue(
      q,
      // @see https://www.w3.org/TR/xml/#AVNormalize
      // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
      // - recursive replacement of (DTD) entity references
      // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
      $.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, c),
      J
    );
  }
  for (var y, N, w = ++u, S = sr; ; ) {
    var k = t.charAt(w);
    switch (k) {
      case "=":
        if (S === ke)
          y = t.slice(u, w), S = ar;
        else if (S === Je)
          S = ar;
        else
          throw new Error("attribute equal must after attrName");
        break;
      case "'":
      case '"':
        if (S === ar || S === ke)
          if (S === ke && (f.warning('attribute value must after "="'), y = t.slice(u, w)), u = w + 1, w = t.indexOf(k, u), w > 0)
            N = t.slice(u, w), A(y, N, u - 1), S = Ke;
          else
            throw new Error("attribute value no end '" + k + "' match");
        else if (S == Ze)
          N = t.slice(u, w), A(y, N, u), f.warning('attribute "' + y + '" missed start quot(' + k + ")!!"), u = w + 1, S = Ke;
        else
          throw new Error('attribute value must after "="');
        break;
      case "/":
        switch (S) {
          case sr:
            n.setTagName(t.slice(u, w));
          case Ke:
          case lr:
          case gr:
            S = gr, n.closed = !0;
          case Ze:
          case ke:
            break;
          case Je:
            n.closed = !0;
            break;
          default:
            throw new Error("attribute invalid close char('/')");
        }
        break;
      case "":
        return f.error("unexpected end of input"), S == sr && n.setTagName(t.slice(u, w)), w;
      case ">":
        switch (S) {
          case sr:
            n.setTagName(t.slice(u, w));
          case Ke:
          case lr:
          case gr:
            break;
          case Ze:
          case ke:
            N = t.slice(u, w), N.slice(-1) === "/" && (n.closed = !0, N = N.slice(0, -1));
          case Je:
            S === Je && (N = y), S == Ze ? (f.warning('attribute "' + N + '" missed quot(")!'), A(y, N, u)) : ((!fr.isHTML(s[""]) || !N.match(/^(?:disabled|checked|selected)$/i)) && f.warning('attribute "' + N + '" missed value!! "' + N + '" instead!!'), A(N, N, u));
            break;
          case ar:
            throw new Error("attribute value missed!!");
        }
        return w;
      case "":
        k = " ";
      default:
        if (k <= " ")
          switch (S) {
            case sr:
              n.setTagName(t.slice(u, w)), S = lr;
              break;
            case ke:
              y = t.slice(u, w), S = Je;
              break;
            case Ze:
              var N = t.slice(u, w);
              f.warning('attribute "' + N + '" missed quot(")!!'), A(y, N, u);
            case Ke:
              S = lr;
              break;
          }
        else
          switch (S) {
            case Je:
              n.tagName, (!fr.isHTML(s[""]) || !y.match(/^(?:disabled|checked|selected)$/i)) && f.warning('attribute "' + y + '" missed value!! "' + y + '" instead2!!'), A(y, y, u), u = w, S = ke;
              break;
            case Ke:
              f.warning('attribute space is required"' + y + '"!!');
            case lr:
              S = ke, u = w;
              break;
            case ar:
              S = Ze, u = w;
              break;
            case gr:
              throw new Error("elements closed character '/' and '>' must be connected to");
          }
    }
    w++;
  }
}
function et(t, u, n) {
  for (var s = t.tagName, c = null, k = t.length; k--; ) {
    var f = t[k], A = f.qName, y = f.value, q = A.indexOf(":");
    if (q > 0)
      var N = f.prefix = A.slice(0, q), w = A.slice(q + 1), S = N === "xmlns" && w;
    else
      w = A, N = null, S = A === "xmlns" && "";
    f.localName = w, S !== !1 && (c == null && (c = {}, St(n, n = {})), n[S] = c[S] = y, f.uri = fr.XMLNS, u.startPrefixMapping(S, y));
  }
  for (var k = t.length; k--; ) {
    f = t[k];
    var N = f.prefix;
    N && (N === "xml" && (f.uri = fr.XML), N !== "xmlns" && (f.uri = n[N || ""]));
  }
  var q = s.indexOf(":");
  q > 0 ? (N = t.prefix = s.slice(0, q), w = t.localName = s.slice(q + 1)) : (N = null, w = t.localName = s);
  var $ = t.uri = n[N || ""];
  if (u.startElement($, w, s, t), t.closed) {
    if (u.endElement($, w, s), c)
      for (N in c)
        Object.prototype.hasOwnProperty.call(c, N) && u.endPrefixMapping(N);
  } else
    return t.currentNSMap = n, t.localNSMap = c, !0;
}
function fu(t, u, n, s, c) {
  if (/^(?:script|textarea)$/i.test(n)) {
    var f = t.indexOf("</" + n + ">", u), A = t.substring(u + 1, f);
    if (/[&<]/.test(A))
      return /^script$/i.test(n) ? (c.characters(A, 0, A.length), f) : (A = A.replace(/&#?\w+;/g, s), c.characters(A, 0, A.length), f);
  }
  return u + 1;
}
function hu(t, u, n, s) {
  var c = s[n];
  return c == null && (c = t.lastIndexOf("</" + n + ">"), c < u && (c = t.lastIndexOf("</" + n)), s[n] = c), c < u;
}
function St(t, u) {
  for (var n in t)
    Object.prototype.hasOwnProperty.call(t, n) && (u[n] = t[n]);
}
function Eu(t, u, n, s) {
  var c = t.charAt(u + 2);
  switch (c) {
    case "-":
      if (t.charAt(u + 3) === "-") {
        var f = t.indexOf("-->", u + 4);
        return f > u ? (n.comment(t, u + 4, f - u - 4), f + 3) : (s.error("Unclosed comment"), -1);
      } else
        return -1;
    default:
      if (t.substr(u + 3, 6) == "CDATA[") {
        var f = t.indexOf("]]>", u + 9);
        return n.startCDATA(), n.characters(t, u + 9, f - u - 9), n.endCDATA(), f + 3;
      }
      var A = Du(t, u), y = A.length;
      if (y > 1 && /!doctype/i.test(A[0][0])) {
        var N = A[1][0], w = !1, S = !1;
        y > 3 && (/^public$/i.test(A[2][0]) ? (w = A[3][0], S = y > 4 && A[4][0]) : /^system$/i.test(A[2][0]) && (S = A[3][0]));
        var k = A[y - 1];
        return n.startDTD(N, w, S), n.endDTD(), k.index + k[0].length;
      }
  }
  return -1;
}
function Au(t, u, n) {
  var s = t.indexOf("?>", u);
  if (s) {
    var c = t.substring(u, s).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
    return c ? (c[0].length, n.processingInstruction(c[1], c[2]), s + 2) : -1;
  }
  return -1;
}
function Ot() {
  this.attributeNames = {};
}
Ot.prototype = {
  setTagName: function(t) {
    if (!Zr.test(t))
      throw new Error("invalid tagName:" + t);
    this.tagName = t;
  },
  addValue: function(t, u, n) {
    if (!Zr.test(t))
      throw new Error("invalid attribute:" + t);
    this.attributeNames[t] = this.length, this[this.length++] = { qName: t, value: u, offset: n };
  },
  length: 0,
  getLocalName: function(t) {
    return this[t].localName;
  },
  getLocator: function(t) {
    return this[t].locator;
  },
  getQName: function(t) {
    return this[t].qName;
  },
  getURI: function(t) {
    return this[t].uri;
  },
  getValue: function(t) {
    return this[t].value;
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
function Du(t, u) {
  var n, s = [], c = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
  for (c.lastIndex = u, c.exec(t); n = c.exec(t); )
    if (s.push(n), n[1])
      return s;
}
Ur.XMLReader = Bt;
Ur.ParseError = nr;
var gu = Me, du = Ge, rt = wt, Ft = Ur, mu = du.DOMImplementation, tt = gu.NAMESPACE, Nu = Ft.ParseError, vu = Ft.XMLReader;
function Rt(t) {
  return t.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028]/g, `
`);
}
function _t(t) {
  this.options = t || { locator: {} };
}
_t.prototype.parseFromString = function(t, u) {
  var n = this.options, s = new vu(), c = n.domBuilder || new Dr(), f = n.errorHandler, A = n.locator, y = n.xmlns || {}, N = /\/x?html?$/.test(u), w = N ? rt.HTML_ENTITIES : rt.XML_ENTITIES;
  A && c.setDocumentLocator(A), s.errorHandler = xu(f, c, A), s.domBuilder = n.domBuilder || c, N && (y[""] = tt.HTML), y.xml = y.xml || tt.XML;
  var S = n.normalizeLineEndings || Rt;
  return t && typeof t == "string" ? s.parse(
    S(t),
    y,
    w
  ) : s.errorHandler.error("invalid doc source"), c.doc;
};
function xu(t, u, n) {
  if (!t) {
    if (u instanceof Dr)
      return u;
    t = u;
  }
  var s = {}, c = t instanceof Function;
  n = n || {};
  function f(A) {
    var y = t[A];
    !y && c && (y = t.length == 2 ? function(N) {
      t(A, N);
    } : t), s[A] = y && function(N) {
      y("[xmldom " + A + "]	" + N + Sr(n));
    } || function() {
    };
  }
  return f("warning"), f("error"), f("fatalError"), s;
}
function Dr() {
  this.cdata = !1;
}
function er(t, u) {
  u.lineNumber = t.lineNumber, u.columnNumber = t.columnNumber;
}
Dr.prototype = {
  startDocument: function() {
    this.doc = new mu().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
  },
  startElement: function(t, u, n, s) {
    var c = this.doc, f = c.createElementNS(t, n || u), A = s.length;
    dr(this, f), this.currentElement = f, this.locator && er(this.locator, f);
    for (var y = 0; y < A; y++) {
      var t = s.getURI(y), N = s.getValue(y), n = s.getQName(y), w = c.createAttributeNS(t, n);
      this.locator && er(s.getLocator(y), w), w.value = w.nodeValue = N, f.setAttributeNode(w);
    }
  },
  endElement: function(t, u, n) {
    var s = this.currentElement;
    s.tagName, this.currentElement = s.parentNode;
  },
  startPrefixMapping: function(t, u) {
  },
  endPrefixMapping: function(t) {
  },
  processingInstruction: function(t, u) {
    var n = this.doc.createProcessingInstruction(t, u);
    this.locator && er(this.locator, n), dr(this, n);
  },
  ignorableWhitespace: function(t, u, n) {
  },
  characters: function(t, u, n) {
    if (t = ut.apply(this, arguments), t) {
      if (this.cdata)
        var s = this.doc.createCDATASection(t);
      else
        var s = this.doc.createTextNode(t);
      this.currentElement ? this.currentElement.appendChild(s) : /^\s*$/.test(t) && this.doc.appendChild(s), this.locator && er(this.locator, s);
    }
  },
  skippedEntity: function(t) {
  },
  endDocument: function() {
    this.doc.normalize();
  },
  setDocumentLocator: function(t) {
    (this.locator = t) && (t.lineNumber = 0);
  },
  //LexicalHandler
  comment: function(t, u, n) {
    t = ut.apply(this, arguments);
    var s = this.doc.createComment(t);
    this.locator && er(this.locator, s), dr(this, s);
  },
  startCDATA: function() {
    this.cdata = !0;
  },
  endCDATA: function() {
    this.cdata = !1;
  },
  startDTD: function(t, u, n) {
    var s = this.doc.implementation;
    if (s && s.createDocumentType) {
      var c = s.createDocumentType(t, u, n);
      this.locator && er(this.locator, c), dr(this, c), this.doc.doctype = c;
    }
  },
  /**
   * @see org.xml.sax.ErrorHandler
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
   */
  warning: function(t) {
    console.warn("[xmldom warning]	" + t, Sr(this.locator));
  },
  error: function(t) {
    console.error("[xmldom error]	" + t, Sr(this.locator));
  },
  fatalError: function(t) {
    throw new Nu(t, this.locator);
  }
};
function Sr(t) {
  if (t)
    return `
@` + (t.systemId || "") + "#[line:" + t.lineNumber + ",col:" + t.columnNumber + "]";
}
function ut(t, u, n) {
  return typeof t == "string" ? t.substr(u, n) : t.length >= u + n || u ? new java.lang.String(t, u, n) + "" : t;
}
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(t) {
  Dr.prototype[t] = function() {
    return null;
  };
});
function dr(t, u) {
  t.currentElement ? t.currentElement.appendChild(u) : t.doc.appendChild(u);
}
Tr.__DOMHandler = Dr;
Tr.normalizeLineEndings = Rt;
Tr.DOMParser = _t;
var Cu = Tr.DOMParser;
function yu(t, u, n) {
  const s = new Cu().parseFromString(n, "text/xml");
  return { filtered: `${Qt.select(u, s)}` };
}
export {
  yu as pluginHookResponseFilter
};
//# sourceMappingURL=index.mjs.map
