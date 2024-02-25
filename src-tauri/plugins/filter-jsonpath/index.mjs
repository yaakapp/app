var Xe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Nt(le) {
  return le && le.__esModule && Object.prototype.hasOwnProperty.call(le, "default") ? le.default : le;
}
function Be(le) {
  throw new Error('Could not dynamically require "' + le + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Ve = { exports: {} };
/*! jsonpath 1.1.1 */
(function(le, Ne) {
  (function(T) {
    le.exports = T();
  })(function() {
    return function T(L, B, v) {
      function y(E, d) {
        if (!B[E]) {
          if (!L[E]) {
            var a = typeof Be == "function" && Be;
            if (!d && a)
              return a(E, !0);
            if (D)
              return D(E, !0);
            var o = new Error("Cannot find module '" + E + "'");
            throw o.code = "MODULE_NOT_FOUND", o;
          }
          var m = B[E] = { exports: {} };
          L[E][0].call(m.exports, function(s) {
            var c = L[E][1][s];
            return y(c || s);
          }, m, m.exports, T, L, B, v);
        }
        return B[E].exports;
      }
      for (var D = typeof Be == "function" && Be, S = 0; S < v.length; S++)
        y(v[S]);
      return y;
    }({ "./aesprim": [function(T, L, B) {
      (function(v, y) {
        y(typeof B < "u" ? B : v.esprima = {});
      })(this, function(v) {
        var y, D, S, E, d, a, o, m, s, c, r, g, b, h, n, i, p, f;
        y = {
          BooleanLiteral: 1,
          EOF: 2,
          Identifier: 3,
          Keyword: 4,
          NullLiteral: 5,
          NumericLiteral: 6,
          Punctuator: 7,
          StringLiteral: 8,
          RegularExpression: 9
        }, D = {}, D[y.BooleanLiteral] = "Boolean", D[y.EOF] = "<end>", D[y.Identifier] = "Identifier", D[y.Keyword] = "Keyword", D[y.NullLiteral] = "Null", D[y.NumericLiteral] = "Numeric", D[y.Punctuator] = "Punctuator", D[y.StringLiteral] = "String", D[y.RegularExpression] = "RegularExpression", S = [
          "(",
          "{",
          "[",
          "in",
          "typeof",
          "instanceof",
          "new",
          "return",
          "case",
          "delete",
          "throw",
          "void",
          // assignment operators
          "=",
          "+=",
          "-=",
          "*=",
          "/=",
          "%=",
          "<<=",
          ">>=",
          ">>>=",
          "&=",
          "|=",
          "^=",
          ",",
          // binary/unary operators
          "+",
          "-",
          "*",
          "/",
          "%",
          "++",
          "--",
          "<<",
          ">>",
          ">>>",
          "&",
          "|",
          "^",
          "!",
          "~",
          "&&",
          "||",
          "?",
          ":",
          "===",
          "==",
          ">=",
          "<=",
          "<",
          ">",
          "!=",
          "!=="
        ], E = {
          AssignmentExpression: "AssignmentExpression",
          ArrayExpression: "ArrayExpression",
          BlockStatement: "BlockStatement",
          BinaryExpression: "BinaryExpression",
          BreakStatement: "BreakStatement",
          CallExpression: "CallExpression",
          CatchClause: "CatchClause",
          ConditionalExpression: "ConditionalExpression",
          ContinueStatement: "ContinueStatement",
          DoWhileStatement: "DoWhileStatement",
          DebuggerStatement: "DebuggerStatement",
          EmptyStatement: "EmptyStatement",
          ExpressionStatement: "ExpressionStatement",
          ForStatement: "ForStatement",
          ForInStatement: "ForInStatement",
          FunctionDeclaration: "FunctionDeclaration",
          FunctionExpression: "FunctionExpression",
          Identifier: "Identifier",
          IfStatement: "IfStatement",
          Literal: "Literal",
          LabeledStatement: "LabeledStatement",
          LogicalExpression: "LogicalExpression",
          MemberExpression: "MemberExpression",
          NewExpression: "NewExpression",
          ObjectExpression: "ObjectExpression",
          Program: "Program",
          Property: "Property",
          ReturnStatement: "ReturnStatement",
          SequenceExpression: "SequenceExpression",
          SwitchStatement: "SwitchStatement",
          SwitchCase: "SwitchCase",
          ThisExpression: "ThisExpression",
          ThrowStatement: "ThrowStatement",
          TryStatement: "TryStatement",
          UnaryExpression: "UnaryExpression",
          UpdateExpression: "UpdateExpression",
          VariableDeclaration: "VariableDeclaration",
          VariableDeclarator: "VariableDeclarator",
          WhileStatement: "WhileStatement",
          WithStatement: "WithStatement"
        }, d = {
          Data: 1,
          Get: 2,
          Set: 4
        }, a = {
          UnexpectedToken: "Unexpected token %0",
          UnexpectedNumber: "Unexpected number",
          UnexpectedString: "Unexpected string",
          UnexpectedIdentifier: "Unexpected identifier",
          UnexpectedReserved: "Unexpected reserved word",
          UnexpectedEOS: "Unexpected end of input",
          NewlineAfterThrow: "Illegal newline after throw",
          InvalidRegExp: "Invalid regular expression",
          UnterminatedRegExp: "Invalid regular expression: missing /",
          InvalidLHSInAssignment: "Invalid left-hand side in assignment",
          InvalidLHSInForIn: "Invalid left-hand side in for-in",
          MultipleDefaultsInSwitch: "More than one default clause in switch statement",
          NoCatchOrFinally: "Missing catch or finally after try",
          UnknownLabel: "Undefined label '%0'",
          Redeclaration: "%0 '%1' has already been declared",
          IllegalContinue: "Illegal continue statement",
          IllegalBreak: "Illegal break statement",
          IllegalReturn: "Illegal return statement",
          StrictModeWith: "Strict mode code may not include a with statement",
          StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
          StrictVarName: "Variable name may not be eval or arguments in strict mode",
          StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
          StrictParamDupe: "Strict mode function may not have duplicate parameter names",
          StrictFunctionName: "Function name may not be eval or arguments in strict mode",
          StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
          StrictDelete: "Delete of an unqualified identifier in strict mode.",
          StrictDuplicateProperty: "Duplicate data property in object literal not allowed in strict mode",
          AccessorDataProperty: "Object literal may not have data and accessor property with the same name",
          AccessorGetSet: "Object literal may not have multiple get/set accessors with the same name",
          StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
          StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
          StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
          StrictReservedWord: "Use of future reserved word in strict mode"
        }, o = {
          NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
          NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
        };
        function I(e, t) {
          if (!e)
            throw new Error("ASSERT: " + t);
        }
        function R(e) {
          return e >= 48 && e <= 57;
        }
        function U(e) {
          return "0123456789abcdefABCDEF".indexOf(e) >= 0;
        }
        function w(e) {
          return "01234567".indexOf(e) >= 0;
        }
        function H(e) {
          return e === 32 || e === 9 || e === 11 || e === 12 || e === 160 || e >= 5760 && [5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279].indexOf(e) >= 0;
        }
        function M(e) {
          return e === 10 || e === 13 || e === 8232 || e === 8233;
        }
        function z(e) {
          return e == 64 || e === 36 || e === 95 || // $ (dollar) and _ (underscore)
          e >= 65 && e <= 90 || // A..Z
          e >= 97 && e <= 122 || // a..z
          e === 92 || // \ (backslash)
          e >= 128 && o.NonAsciiIdentifierStart.test(String.fromCharCode(e));
        }
        function V(e) {
          return e === 36 || e === 95 || // $ (dollar) and _ (underscore)
          e >= 65 && e <= 90 || // A..Z
          e >= 97 && e <= 122 || // a..z
          e >= 48 && e <= 57 || // 0..9
          e === 92 || // \ (backslash)
          e >= 128 && o.NonAsciiIdentifierPart.test(String.fromCharCode(e));
        }
        function ae(e) {
          switch (e) {
            case "class":
            case "enum":
            case "export":
            case "extends":
            case "import":
            case "super":
              return !0;
            default:
              return !1;
          }
        }
        function Y(e) {
          switch (e) {
            case "implements":
            case "interface":
            case "package":
            case "private":
            case "protected":
            case "public":
            case "static":
            case "yield":
            case "let":
              return !0;
            default:
              return !1;
          }
        }
        function J(e) {
          return e === "eval" || e === "arguments";
        }
        function se(e) {
          if (c && Y(e))
            return !0;
          switch (e.length) {
            case 2:
              return e === "if" || e === "in" || e === "do";
            case 3:
              return e === "var" || e === "for" || e === "new" || e === "try" || e === "let";
            case 4:
              return e === "this" || e === "else" || e === "case" || e === "void" || e === "with" || e === "enum";
            case 5:
              return e === "while" || e === "break" || e === "catch" || e === "throw" || e === "const" || e === "yield" || e === "class" || e === "super";
            case 6:
              return e === "return" || e === "typeof" || e === "delete" || e === "switch" || e === "export" || e === "import";
            case 7:
              return e === "default" || e === "finally" || e === "extends";
            case 8:
              return e === "function" || e === "continue" || e === "debugger";
            case 10:
              return e === "instanceof";
            default:
              return !1;
          }
        }
        function ie(e, t, u, l, C) {
          var x;
          I(typeof u == "number", "Comment must have valid position"), !(p.lastCommentStart >= u) && (p.lastCommentStart = u, x = {
            type: e,
            value: t
          }, f.range && (x.range = [u, l]), f.loc && (x.loc = C), f.comments.push(x), f.attachComment && (f.leadingComments.push(x), f.trailingComments.push(x)));
        }
        function oe(e) {
          var t, u, l, C;
          for (t = r - e, u = {
            start: {
              line: g,
              column: r - b - e
            }
          }; r < h; )
            if (l = s.charCodeAt(r), ++r, M(l)) {
              f.comments && (C = s.slice(t + e, r - 1), u.end = {
                line: g,
                column: r - b - 1
              }, ie("Line", C, t, r - 1, u)), l === 13 && s.charCodeAt(r) === 10 && ++r, ++g, b = r;
              return;
            }
          f.comments && (C = s.slice(t + e, r), u.end = {
            line: g,
            column: r - b
          }, ie("Line", C, t, r, u));
        }
        function ve() {
          var e, t, u, l;
          for (f.comments && (e = r - 2, t = {
            start: {
              line: g,
              column: r - b - 2
            }
          }); r < h; )
            if (u = s.charCodeAt(r), M(u))
              u === 13 && s.charCodeAt(r + 1) === 10 && ++r, ++g, ++r, b = r, r >= h && P({}, a.UnexpectedToken, "ILLEGAL");
            else if (u === 42) {
              if (s.charCodeAt(r + 1) === 47) {
                ++r, ++r, f.comments && (l = s.slice(e + 2, r - 2), t.end = {
                  line: g,
                  column: r - b
                }, ie("Block", l, e, r, t));
                return;
              }
              ++r;
            } else
              ++r;
          P({}, a.UnexpectedToken, "ILLEGAL");
        }
        function A() {
          var e, t;
          for (t = r === 0; r < h; )
            if (e = s.charCodeAt(r), H(e))
              ++r;
            else if (M(e))
              ++r, e === 13 && s.charCodeAt(r) === 10 && ++r, ++g, b = r, t = !0;
            else if (e === 47)
              if (e = s.charCodeAt(r + 1), e === 47)
                ++r, ++r, oe(2), t = !0;
              else if (e === 42)
                ++r, ++r, ve();
              else
                break;
            else if (t && e === 45)
              if (s.charCodeAt(r + 1) === 45 && s.charCodeAt(r + 2) === 62)
                r += 3, oe(3);
              else
                break;
            else if (e === 60)
              if (s.slice(r + 1, r + 4) === "!--")
                ++r, ++r, ++r, ++r, oe(4);
              else
                break;
            else
              break;
        }
        function F(e) {
          var t, u, l, C = 0;
          for (u = e === "u" ? 4 : 2, t = 0; t < u; ++t)
            if (r < h && U(s[r]))
              l = s[r++], C = C * 16 + "0123456789abcdef".indexOf(l.toLowerCase());
            else
              return "";
          return String.fromCharCode(C);
        }
        function k() {
          var e, t;
          for (e = s.charCodeAt(r++), t = String.fromCharCode(e), e === 92 && (s.charCodeAt(r) !== 117 && P({}, a.UnexpectedToken, "ILLEGAL"), ++r, e = F("u"), (!e || e === "\\" || !z(e.charCodeAt(0))) && P({}, a.UnexpectedToken, "ILLEGAL"), t = e); r < h && (e = s.charCodeAt(r), !!V(e)); )
            ++r, t += String.fromCharCode(e), e === 92 && (t = t.substr(0, t.length - 1), s.charCodeAt(r) !== 117 && P({}, a.UnexpectedToken, "ILLEGAL"), ++r, e = F("u"), (!e || e === "\\" || !V(e.charCodeAt(0))) && P({}, a.UnexpectedToken, "ILLEGAL"), t += e);
          return t;
        }
        function X() {
          var e, t;
          for (e = r++; r < h; ) {
            if (t = s.charCodeAt(r), t === 92)
              return r = e, k();
            if (V(t))
              ++r;
            else
              break;
          }
          return s.slice(e, r);
        }
        function ee() {
          var e, t, u;
          return e = r, t = s.charCodeAt(r) === 92 ? k() : X(), t.length === 1 ? u = y.Identifier : se(t) ? u = y.Keyword : t === "null" ? u = y.NullLiteral : t === "true" || t === "false" ? u = y.BooleanLiteral : u = y.Identifier, {
            type: u,
            value: t,
            lineNumber: g,
            lineStart: b,
            start: e,
            end: r
          };
        }
        function $() {
          var e = r, t = s.charCodeAt(r), u, l = s[r], C, x, j;
          switch (t) {
            case 46:
            case 40:
            case 41:
            case 59:
            case 44:
            case 123:
            case 125:
            case 91:
            case 93:
            case 58:
            case 63:
            case 126:
              return ++r, f.tokenize && (t === 40 ? f.openParenToken = f.tokens.length : t === 123 && (f.openCurlyToken = f.tokens.length)), {
                type: y.Punctuator,
                value: String.fromCharCode(t),
                lineNumber: g,
                lineStart: b,
                start: e,
                end: r
              };
            default:
              if (u = s.charCodeAt(r + 1), u === 61)
                switch (t) {
                  case 43:
                  case 45:
                  case 47:
                  case 60:
                  case 62:
                  case 94:
                  case 124:
                  case 37:
                  case 38:
                  case 42:
                    return r += 2, {
                      type: y.Punctuator,
                      value: String.fromCharCode(t) + String.fromCharCode(u),
                      lineNumber: g,
                      lineStart: b,
                      start: e,
                      end: r
                    };
                  case 33:
                  case 61:
                    return r += 2, s.charCodeAt(r) === 61 && ++r, {
                      type: y.Punctuator,
                      value: s.slice(e, r),
                      lineNumber: g,
                      lineStart: b,
                      start: e,
                      end: r
                    };
                }
          }
          if (j = s.substr(r, 4), j === ">>>=")
            return r += 4, {
              type: y.Punctuator,
              value: j,
              lineNumber: g,
              lineStart: b,
              start: e,
              end: r
            };
          if (x = j.substr(0, 3), x === ">>>" || x === "<<=" || x === ">>=")
            return r += 3, {
              type: y.Punctuator,
              value: x,
              lineNumber: g,
              lineStart: b,
              start: e,
              end: r
            };
          if (C = x.substr(0, 2), l === C[1] && "+-<>&|".indexOf(l) >= 0 || C === "=>")
            return r += 2, {
              type: y.Punctuator,
              value: C,
              lineNumber: g,
              lineStart: b,
              start: e,
              end: r
            };
          if ("<>=!+-*%&|^/".indexOf(l) >= 0)
            return ++r, {
              type: y.Punctuator,
              value: l,
              lineNumber: g,
              lineStart: b,
              start: e,
              end: r
            };
          P({}, a.UnexpectedToken, "ILLEGAL");
        }
        function q(e) {
          for (var t = ""; r < h && U(s[r]); )
            t += s[r++];
          return t.length === 0 && P({}, a.UnexpectedToken, "ILLEGAL"), z(s.charCodeAt(r)) && P({}, a.UnexpectedToken, "ILLEGAL"), {
            type: y.NumericLiteral,
            value: parseInt("0x" + t, 16),
            lineNumber: g,
            lineStart: b,
            start: e,
            end: r
          };
        }
        function K(e) {
          for (var t = "0" + s[r++]; r < h && w(s[r]); )
            t += s[r++];
          return (z(s.charCodeAt(r)) || R(s.charCodeAt(r))) && P({}, a.UnexpectedToken, "ILLEGAL"), {
            type: y.NumericLiteral,
            value: parseInt(t, 8),
            octal: !0,
            lineNumber: g,
            lineStart: b,
            start: e,
            end: r
          };
        }
        function Q() {
          var e, t, u;
          if (u = s[r], I(
            R(u.charCodeAt(0)) || u === ".",
            "Numeric literal must start with a decimal digit or a decimal point"
          ), t = r, e = "", u !== ".") {
            if (e = s[r++], u = s[r], e === "0") {
              if (u === "x" || u === "X")
                return ++r, q(t);
              if (w(u))
                return K(t);
              u && R(u.charCodeAt(0)) && P({}, a.UnexpectedToken, "ILLEGAL");
            }
            for (; R(s.charCodeAt(r)); )
              e += s[r++];
            u = s[r];
          }
          if (u === ".") {
            for (e += s[r++]; R(s.charCodeAt(r)); )
              e += s[r++];
            u = s[r];
          }
          if (u === "e" || u === "E")
            if (e += s[r++], u = s[r], (u === "+" || u === "-") && (e += s[r++]), R(s.charCodeAt(r)))
              for (; R(s.charCodeAt(r)); )
                e += s[r++];
            else
              P({}, a.UnexpectedToken, "ILLEGAL");
          return z(s.charCodeAt(r)) && P({}, a.UnexpectedToken, "ILLEGAL"), {
            type: y.NumericLiteral,
            value: parseFloat(e),
            lineNumber: g,
            lineStart: b,
            start: t,
            end: r
          };
        }
        function fe() {
          var e = "", t, u, l, C, x, j, W = !1, ue, re;
          for (ue = g, re = b, t = s[r], I(
            t === "'" || t === '"',
            "String literal must starts with a quote"
          ), u = r, ++r; r < h; )
            if (l = s[r++], l === t) {
              t = "";
              break;
            } else if (l === "\\")
              if (l = s[r++], !l || !M(l.charCodeAt(0)))
                switch (l) {
                  case "u":
                  case "x":
                    j = r, x = F(l), x ? e += x : (r = j, e += l);
                    break;
                  case "n":
                    e += `
`;
                    break;
                  case "r":
                    e += "\r";
                    break;
                  case "t":
                    e += "	";
                    break;
                  case "b":
                    e += "\b";
                    break;
                  case "f":
                    e += "\f";
                    break;
                  case "v":
                    e += "\v";
                    break;
                  default:
                    w(l) ? (C = "01234567".indexOf(l), C !== 0 && (W = !0), r < h && w(s[r]) && (W = !0, C = C * 8 + "01234567".indexOf(s[r++]), "0123".indexOf(l) >= 0 && r < h && w(s[r]) && (C = C * 8 + "01234567".indexOf(s[r++]))), e += String.fromCharCode(C)) : e += l;
                    break;
                }
              else
                ++g, l === "\r" && s[r] === `
` && ++r, b = r;
            else {
              if (M(l.charCodeAt(0)))
                break;
              e += l;
            }
          return t !== "" && P({}, a.UnexpectedToken, "ILLEGAL"), {
            type: y.StringLiteral,
            value: e,
            octal: W,
            startLineNumber: ue,
            startLineStart: re,
            lineNumber: g,
            lineStart: b,
            start: u,
            end: r
          };
        }
        function Ee(e, t) {
          var u;
          try {
            u = new RegExp(e, t);
          } catch {
            P({}, a.InvalidRegExp);
          }
          return u;
        }
        function ke() {
          var e, t, u, l, C;
          for (e = s[r], I(e === "/", "Regular expression literal must start with a slash"), t = s[r++], u = !1, l = !1; r < h; )
            if (e = s[r++], t += e, e === "\\")
              e = s[r++], M(e.charCodeAt(0)) && P({}, a.UnterminatedRegExp), t += e;
            else if (M(e.charCodeAt(0)))
              P({}, a.UnterminatedRegExp);
            else if (u)
              e === "]" && (u = !1);
            else if (e === "/") {
              l = !0;
              break;
            } else
              e === "[" && (u = !0);
          return l || P({}, a.UnterminatedRegExp), C = t.substr(1, t.length - 2), {
            value: C,
            literal: t
          };
        }
        function ge() {
          var e, t, u, l;
          for (t = "", u = ""; r < h && (e = s[r], !!V(e.charCodeAt(0))); )
            if (++r, e === "\\" && r < h)
              if (e = s[r], e === "u") {
                if (++r, l = r, e = F("u"), e)
                  for (u += e, t += "\\u"; l < r; ++l)
                    t += s[l];
                else
                  r = l, u += "u", t += "\\u";
                G({}, a.UnexpectedToken, "ILLEGAL");
              } else
                t += "\\", G({}, a.UnexpectedToken, "ILLEGAL");
            else
              u += e, t += e;
          return {
            value: u,
            literal: t
          };
        }
        function Fe() {
          var e, t, u, l;
          return i = null, A(), e = r, t = ke(), u = ge(), l = Ee(t.value, u.value), f.tokenize ? {
            type: y.RegularExpression,
            value: l,
            lineNumber: g,
            lineStart: b,
            start: e,
            end: r
          } : {
            literal: t.literal + u.literal,
            value: l,
            start: e,
            end: r
          };
        }
        function de() {
          var e, t, u, l;
          return A(), e = r, t = {
            start: {
              line: g,
              column: r - b
            }
          }, u = Fe(), t.end = {
            line: g,
            column: r - b
          }, f.tokenize || (f.tokens.length > 0 && (l = f.tokens[f.tokens.length - 1], l.range[0] === e && l.type === "Punctuator" && (l.value === "/" || l.value === "/=") && f.tokens.pop()), f.tokens.push({
            type: "RegularExpression",
            value: u.literal,
            range: [e, r],
            loc: t
          })), u;
        }
        function Ke(e) {
          return e.type === y.Identifier || e.type === y.Keyword || e.type === y.BooleanLiteral || e.type === y.NullLiteral;
        }
        function Je() {
          var e, t;
          if (e = f.tokens[f.tokens.length - 1], !e)
            return de();
          if (e.type === "Punctuator") {
            if (e.value === "]")
              return $();
            if (e.value === ")")
              return t = f.tokens[f.openParenToken - 1], t && t.type === "Keyword" && (t.value === "if" || t.value === "while" || t.value === "for" || t.value === "with") ? de() : $();
            if (e.value === "}") {
              if (f.tokens[f.openCurlyToken - 3] && f.tokens[f.openCurlyToken - 3].type === "Keyword") {
                if (t = f.tokens[f.openCurlyToken - 4], !t)
                  return $();
              } else if (f.tokens[f.openCurlyToken - 4] && f.tokens[f.openCurlyToken - 4].type === "Keyword") {
                if (t = f.tokens[f.openCurlyToken - 5], !t)
                  return de();
              } else
                return $();
              return S.indexOf(t.value) >= 0 ? $() : de();
            }
            return de();
          }
          return e.type === "Keyword" ? de() : $();
        }
        function Ie() {
          var e;
          return A(), r >= h ? {
            type: y.EOF,
            lineNumber: g,
            lineStart: b,
            start: r,
            end: r
          } : (e = s.charCodeAt(r), z(e) ? ee() : e === 40 || e === 41 || e === 59 ? $() : e === 39 || e === 34 ? fe() : e === 46 ? R(s.charCodeAt(r + 1)) ? Q() : $() : R(e) ? Q() : f.tokenize && e === 47 ? Je() : $());
        }
        function Pe() {
          var e, t, u;
          return A(), e = {
            start: {
              line: g,
              column: r - b
            }
          }, t = Ie(), e.end = {
            line: g,
            column: r - b
          }, t.type !== y.EOF && (u = s.slice(t.start, t.end), f.tokens.push({
            type: D[t.type],
            value: u,
            range: [t.start, t.end],
            loc: e
          })), t;
        }
        function N() {
          var e;
          return e = i, r = e.end, g = e.lineNumber, b = e.lineStart, i = typeof f.tokens < "u" ? Pe() : Ie(), r = e.end, g = e.lineNumber, b = e.lineStart, e;
        }
        function we() {
          var e, t, u;
          e = r, t = g, u = b, i = typeof f.tokens < "u" ? Pe() : Ie(), r = e, g = t, b = u;
        }
        function Le(e, t) {
          this.line = e, this.column = t;
        }
        function Qe(e, t, u, l) {
          this.start = new Le(e, t), this.end = new Le(u, l);
        }
        m = {
          name: "SyntaxTree",
          processComment: function(e) {
            var t, u;
            if (!(e.type === E.Program && e.body.length > 0)) {
              for (f.trailingComments.length > 0 ? f.trailingComments[0].range[0] >= e.range[1] ? (u = f.trailingComments, f.trailingComments = []) : f.trailingComments.length = 0 : f.bottomRightStack.length > 0 && f.bottomRightStack[f.bottomRightStack.length - 1].trailingComments && f.bottomRightStack[f.bottomRightStack.length - 1].trailingComments[0].range[0] >= e.range[1] && (u = f.bottomRightStack[f.bottomRightStack.length - 1].trailingComments, delete f.bottomRightStack[f.bottomRightStack.length - 1].trailingComments); f.bottomRightStack.length > 0 && f.bottomRightStack[f.bottomRightStack.length - 1].range[0] >= e.range[0]; )
                t = f.bottomRightStack.pop();
              t ? t.leadingComments && t.leadingComments[t.leadingComments.length - 1].range[1] <= e.range[0] && (e.leadingComments = t.leadingComments, delete t.leadingComments) : f.leadingComments.length > 0 && f.leadingComments[f.leadingComments.length - 1].range[1] <= e.range[0] && (e.leadingComments = f.leadingComments, f.leadingComments = []), u && (e.trailingComments = u), f.bottomRightStack.push(e);
            }
          },
          markEnd: function(e, t) {
            return f.range && (e.range = [t.start, r]), f.loc && (e.loc = new Qe(
              t.startLineNumber === void 0 ? t.lineNumber : t.startLineNumber,
              t.start - (t.startLineStart === void 0 ? t.lineStart : t.startLineStart),
              g,
              r - b
            ), this.postProcess(e)), f.attachComment && this.processComment(e), e;
          },
          postProcess: function(e) {
            return f.source && (e.loc.source = f.source), e;
          },
          createArrayExpression: function(e) {
            return {
              type: E.ArrayExpression,
              elements: e
            };
          },
          createAssignmentExpression: function(e, t, u) {
            return {
              type: E.AssignmentExpression,
              operator: e,
              left: t,
              right: u
            };
          },
          createBinaryExpression: function(e, t, u) {
            var l = e === "||" || e === "&&" ? E.LogicalExpression : E.BinaryExpression;
            return {
              type: l,
              operator: e,
              left: t,
              right: u
            };
          },
          createBlockStatement: function(e) {
            return {
              type: E.BlockStatement,
              body: e
            };
          },
          createBreakStatement: function(e) {
            return {
              type: E.BreakStatement,
              label: e
            };
          },
          createCallExpression: function(e, t) {
            return {
              type: E.CallExpression,
              callee: e,
              arguments: t
            };
          },
          createCatchClause: function(e, t) {
            return {
              type: E.CatchClause,
              param: e,
              body: t
            };
          },
          createConditionalExpression: function(e, t, u) {
            return {
              type: E.ConditionalExpression,
              test: e,
              consequent: t,
              alternate: u
            };
          },
          createContinueStatement: function(e) {
            return {
              type: E.ContinueStatement,
              label: e
            };
          },
          createDebuggerStatement: function() {
            return {
              type: E.DebuggerStatement
            };
          },
          createDoWhileStatement: function(e, t) {
            return {
              type: E.DoWhileStatement,
              body: e,
              test: t
            };
          },
          createEmptyStatement: function() {
            return {
              type: E.EmptyStatement
            };
          },
          createExpressionStatement: function(e) {
            return {
              type: E.ExpressionStatement,
              expression: e
            };
          },
          createForStatement: function(e, t, u, l) {
            return {
              type: E.ForStatement,
              init: e,
              test: t,
              update: u,
              body: l
            };
          },
          createForInStatement: function(e, t, u) {
            return {
              type: E.ForInStatement,
              left: e,
              right: t,
              body: u,
              each: !1
            };
          },
          createFunctionDeclaration: function(e, t, u, l) {
            return {
              type: E.FunctionDeclaration,
              id: e,
              params: t,
              defaults: u,
              body: l,
              rest: null,
              generator: !1,
              expression: !1
            };
          },
          createFunctionExpression: function(e, t, u, l) {
            return {
              type: E.FunctionExpression,
              id: e,
              params: t,
              defaults: u,
              body: l,
              rest: null,
              generator: !1,
              expression: !1
            };
          },
          createIdentifier: function(e) {
            return {
              type: E.Identifier,
              name: e
            };
          },
          createIfStatement: function(e, t, u) {
            return {
              type: E.IfStatement,
              test: e,
              consequent: t,
              alternate: u
            };
          },
          createLabeledStatement: function(e, t) {
            return {
              type: E.LabeledStatement,
              label: e,
              body: t
            };
          },
          createLiteral: function(e) {
            return {
              type: E.Literal,
              value: e.value,
              raw: s.slice(e.start, e.end)
            };
          },
          createMemberExpression: function(e, t, u) {
            return {
              type: E.MemberExpression,
              computed: e === "[",
              object: t,
              property: u
            };
          },
          createNewExpression: function(e, t) {
            return {
              type: E.NewExpression,
              callee: e,
              arguments: t
            };
          },
          createObjectExpression: function(e) {
            return {
              type: E.ObjectExpression,
              properties: e
            };
          },
          createPostfixExpression: function(e, t) {
            return {
              type: E.UpdateExpression,
              operator: e,
              argument: t,
              prefix: !1
            };
          },
          createProgram: function(e) {
            return {
              type: E.Program,
              body: e
            };
          },
          createProperty: function(e, t, u) {
            return {
              type: E.Property,
              key: t,
              value: u,
              kind: e
            };
          },
          createReturnStatement: function(e) {
            return {
              type: E.ReturnStatement,
              argument: e
            };
          },
          createSequenceExpression: function(e) {
            return {
              type: E.SequenceExpression,
              expressions: e
            };
          },
          createSwitchCase: function(e, t) {
            return {
              type: E.SwitchCase,
              test: e,
              consequent: t
            };
          },
          createSwitchStatement: function(e, t) {
            return {
              type: E.SwitchStatement,
              discriminant: e,
              cases: t
            };
          },
          createThisExpression: function() {
            return {
              type: E.ThisExpression
            };
          },
          createThrowStatement: function(e) {
            return {
              type: E.ThrowStatement,
              argument: e
            };
          },
          createTryStatement: function(e, t, u, l) {
            return {
              type: E.TryStatement,
              block: e,
              guardedHandlers: t,
              handlers: u,
              finalizer: l
            };
          },
          createUnaryExpression: function(e, t) {
            return e === "++" || e === "--" ? {
              type: E.UpdateExpression,
              operator: e,
              argument: t,
              prefix: !0
            } : {
              type: E.UnaryExpression,
              operator: e,
              argument: t,
              prefix: !0
            };
          },
          createVariableDeclaration: function(e, t) {
            return {
              type: E.VariableDeclaration,
              declarations: e,
              kind: t
            };
          },
          createVariableDeclarator: function(e, t) {
            return {
              type: E.VariableDeclarator,
              id: e,
              init: t
            };
          },
          createWhileStatement: function(e, t) {
            return {
              type: E.WhileStatement,
              test: e,
              body: t
            };
          },
          createWithStatement: function(e, t) {
            return {
              type: E.WithStatement,
              object: e,
              body: t
            };
          }
        };
        function Ce() {
          var e, t, u, l;
          return e = r, t = g, u = b, A(), l = g !== t, r = e, g = t, b = u, l;
        }
        function P(e, t) {
          var u, l = Array.prototype.slice.call(arguments, 2), C = t.replace(
            /%(\d)/g,
            function(x, j) {
              return I(j < l.length, "Message reference must be in range"), l[j];
            }
          );
          throw typeof e.lineNumber == "number" ? (u = new Error("Line " + e.lineNumber + ": " + C), u.index = e.start, u.lineNumber = e.lineNumber, u.column = e.start - b + 1) : (u = new Error("Line " + g + ": " + C), u.index = r, u.lineNumber = g, u.column = r - b + 1), u.description = C, u;
        }
        function G() {
          try {
            P.apply(null, arguments);
          } catch (e) {
            if (f.errors)
              f.errors.push(e);
            else
              throw e;
          }
        }
        function pe(e) {
          if (e.type === y.EOF && P(e, a.UnexpectedEOS), e.type === y.NumericLiteral && P(e, a.UnexpectedNumber), e.type === y.StringLiteral && P(e, a.UnexpectedString), e.type === y.Identifier && P(e, a.UnexpectedIdentifier), e.type === y.Keyword) {
            if (ae(e.value))
              P(e, a.UnexpectedReserved);
            else if (c && Y(e.value)) {
              G(e, a.StrictReservedWord);
              return;
            }
            P(e, a.UnexpectedToken, e.value);
          }
          P(e, a.UnexpectedToken, e.value);
        }
        function O(e) {
          var t = N();
          (t.type !== y.Punctuator || t.value !== e) && pe(t);
        }
        function Z(e) {
          var t = N();
          (t.type !== y.Keyword || t.value !== e) && pe(t);
        }
        function _(e) {
          return i.type === y.Punctuator && i.value === e;
        }
        function ne(e) {
          return i.type === y.Keyword && i.value === e;
        }
        function Ye() {
          var e;
          return i.type !== y.Punctuator ? !1 : (e = i.value, e === "=" || e === "*=" || e === "/=" || e === "%=" || e === "+=" || e === "-=" || e === "<<=" || e === ">>=" || e === ">>>=" || e === "&=" || e === "^=" || e === "|=");
        }
        function he() {
          var e;
          if (s.charCodeAt(r) === 59 || _(";")) {
            N();
            return;
          }
          e = g, A(), g === e && i.type !== y.EOF && !_("}") && pe(i);
        }
        function be(e) {
          return e.type === E.Identifier || e.type === E.MemberExpression;
        }
        function Ze() {
          var e = [], t;
          for (t = i, O("["); !_("]"); )
            _(",") ? (N(), e.push(null)) : (e.push(ce()), _("]") || O(","));
          return N(), n.markEnd(n.createArrayExpression(e), t);
        }
        function _e(e, t) {
          var u, l, C;
          return u = c, C = i, l = Oe(), t && c && J(e[0].name) && G(t, a.StrictParamName), c = u, n.markEnd(n.createFunctionExpression(null, e, [], l), C);
        }
        function De() {
          var e, t;
          return t = i, e = N(), e.type === y.StringLiteral || e.type === y.NumericLiteral ? (c && e.octal && G(e, a.StrictOctalLiteral), n.markEnd(n.createLiteral(e), t)) : n.markEnd(n.createIdentifier(e.value), t);
        }
        function et() {
          var e, t, u, l, C, x;
          if (e = i, x = i, e.type === y.Identifier)
            return u = De(), e.value === "get" && !_(":") ? (t = De(), O("("), O(")"), l = _e([]), n.markEnd(n.createProperty("get", t, l), x)) : e.value === "set" && !_(":") ? (t = De(), O("("), e = i, e.type !== y.Identifier ? (O(")"), G(e, a.UnexpectedToken, e.value), l = _e([])) : (C = [ye()], O(")"), l = _e(C, e)), n.markEnd(n.createProperty("set", t, l), x)) : (O(":"), l = ce(), n.markEnd(n.createProperty("init", u, l), x));
          if (e.type === y.EOF || e.type === y.Punctuator)
            pe(e);
          else
            return t = De(), O(":"), l = ce(), n.markEnd(n.createProperty("init", t, l), x);
        }
        function tt() {
          var e = [], t, u, l, C, x = {}, j = String, W;
          for (W = i, O("{"); !_("}"); )
            t = et(), t.key.type === E.Identifier ? u = t.key.name : u = j(t.key.value), C = t.kind === "init" ? d.Data : t.kind === "get" ? d.Get : d.Set, l = "$" + u, Object.prototype.hasOwnProperty.call(x, l) ? (x[l] === d.Data ? c && C === d.Data ? G({}, a.StrictDuplicateProperty) : C !== d.Data && G({}, a.AccessorDataProperty) : C === d.Data ? G({}, a.AccessorDataProperty) : x[l] & C && G({}, a.AccessorGetSet), x[l] |= C) : x[l] = C, e.push(t), _("}") || O(",");
          return O("}"), n.markEnd(n.createObjectExpression(e), W);
        }
        function rt() {
          var e;
          return O("("), e = te(), O(")"), e;
        }
        function Re() {
          var e, t, u, l;
          if (_("("))
            return rt();
          if (_("["))
            return Ze();
          if (_("{"))
            return tt();
          if (e = i.type, l = i, e === y.Identifier)
            u = n.createIdentifier(N().value);
          else if (e === y.StringLiteral || e === y.NumericLiteral)
            c && i.octal && G(i, a.StrictOctalLiteral), u = n.createLiteral(N());
          else if (e === y.Keyword) {
            if (ne("function"))
              return It();
            ne("this") ? (N(), u = n.createThisExpression()) : pe(N());
          } else
            e === y.BooleanLiteral ? (t = N(), t.value = t.value === "true", u = n.createLiteral(t)) : e === y.NullLiteral ? (t = N(), t.value = null, u = n.createLiteral(t)) : _("/") || _("/=") ? (typeof f.tokens < "u" ? u = n.createLiteral(de()) : u = n.createLiteral(Fe()), we()) : pe(N());
          return n.markEnd(u, l);
        }
        function je() {
          var e = [];
          if (O("("), !_(")"))
            for (; r < h && (e.push(ce()), !_(")")); )
              O(",");
          return O(")"), e;
        }
        function nt() {
          var e, t;
          return t = i, e = N(), Ke(e) || pe(e), n.markEnd(n.createIdentifier(e.value), t);
        }
        function Me() {
          return O("."), nt();
        }
        function Ue() {
          var e;
          return O("["), e = te(), O("]"), e;
        }
        function $e() {
          var e, t, u;
          return u = i, Z("new"), e = it(), t = _("(") ? je() : [], n.markEnd(n.createNewExpression(e, t), u);
        }
        function ut() {
          var e, t, u, l, C;
          for (C = i, e = p.allowIn, p.allowIn = !0, t = ne("new") ? $e() : Re(), p.allowIn = e; ; ) {
            if (_("."))
              l = Me(), t = n.createMemberExpression(".", t, l);
            else if (_("("))
              u = je(), t = n.createCallExpression(t, u);
            else if (_("["))
              l = Ue(), t = n.createMemberExpression("[", t, l);
            else
              break;
            n.markEnd(t, C);
          }
          return t;
        }
        function it() {
          var e, t, u, l;
          for (l = i, e = p.allowIn, t = ne("new") ? $e() : Re(), p.allowIn = e; _(".") || _("["); )
            _("[") ? (u = Ue(), t = n.createMemberExpression("[", t, u)) : (u = Me(), t = n.createMemberExpression(".", t, u)), n.markEnd(t, l);
          return t;
        }
        function ze() {
          var e, t, u = i;
          return e = ut(), i.type === y.Punctuator && (_("++") || _("--")) && !Ce() && (c && e.type === E.Identifier && J(e.name) && G({}, a.StrictLHSPostfix), be(e) || G({}, a.InvalidLHSInAssignment), t = N(), e = n.markEnd(n.createPostfixExpression(t.value, e), u)), e;
        }
        function Ae() {
          var e, t, u;
          return i.type !== y.Punctuator && i.type !== y.Keyword ? t = ze() : _("++") || _("--") ? (u = i, e = N(), t = Ae(), c && t.type === E.Identifier && J(t.name) && G({}, a.StrictLHSPrefix), be(t) || G({}, a.InvalidLHSInAssignment), t = n.createUnaryExpression(e.value, t), t = n.markEnd(t, u)) : _("+") || _("-") || _("~") || _("!") ? (u = i, e = N(), t = Ae(), t = n.createUnaryExpression(e.value, t), t = n.markEnd(t, u)) : ne("delete") || ne("void") || ne("typeof") ? (u = i, e = N(), t = Ae(), t = n.createUnaryExpression(e.value, t), t = n.markEnd(t, u), c && t.operator === "delete" && t.argument.type === E.Identifier && G({}, a.StrictDelete)) : t = ze(), t;
        }
        function He(e, t) {
          var u = 0;
          if (e.type !== y.Punctuator && e.type !== y.Keyword)
            return 0;
          switch (e.value) {
            case "||":
              u = 1;
              break;
            case "&&":
              u = 2;
              break;
            case "|":
              u = 3;
              break;
            case "^":
              u = 4;
              break;
            case "&":
              u = 5;
              break;
            case "==":
            case "!=":
            case "===":
            case "!==":
              u = 6;
              break;
            case "<":
            case ">":
            case "<=":
            case ">=":
            case "instanceof":
              u = 7;
              break;
            case "in":
              u = t ? 7 : 0;
              break;
            case "<<":
            case ">>":
            case ">>>":
              u = 8;
              break;
            case "+":
            case "-":
              u = 9;
              break;
            case "*":
            case "/":
            case "%":
              u = 11;
              break;
          }
          return u;
        }
        function at() {
          var e, t, u, l, C, x, j, W, ue, re;
          if (e = i, ue = Ae(), l = i, C = He(l, p.allowIn), C === 0)
            return ue;
          for (l.prec = C, N(), t = [e, i], j = Ae(), x = [ue, l, j]; (C = He(i, p.allowIn)) > 0; ) {
            for (; x.length > 2 && C <= x[x.length - 2].prec; )
              j = x.pop(), W = x.pop().value, ue = x.pop(), u = n.createBinaryExpression(W, ue, j), t.pop(), e = t[t.length - 1], n.markEnd(u, e), x.push(u);
            l = N(), l.prec = C, x.push(l), t.push(i), u = Ae(), x.push(u);
          }
          for (re = x.length - 1, u = x[re], t.pop(); re > 1; )
            u = n.createBinaryExpression(x[re - 1].value, x[re - 2], u), re -= 2, e = t.pop(), n.markEnd(u, e);
          return u;
        }
        function st() {
          var e, t, u, l, C;
          return C = i, e = at(), _("?") && (N(), t = p.allowIn, p.allowIn = !0, u = ce(), p.allowIn = t, O(":"), l = ce(), e = n.createConditionalExpression(e, u, l), n.markEnd(e, C)), e;
        }
        function ce() {
          var e, t, u, l, C;
          return e = i, C = i, l = t = st(), Ye() && (be(t) || G({}, a.InvalidLHSInAssignment), c && t.type === E.Identifier && J(t.name) && G(e, a.StrictLHSAssignment), e = N(), u = ce(), l = n.markEnd(n.createAssignmentExpression(e.value, t, u), C)), l;
        }
        function te() {
          var e, t = i;
          if (e = ce(), _(",")) {
            for (e = n.createSequenceExpression([e]); r < h && _(","); )
              N(), e.expressions.push(ce());
            n.markEnd(e, t);
          }
          return e;
        }
        function ot() {
          for (var e = [], t; r < h && !(_("}") || (t = Se(), typeof t > "u")); )
            e.push(t);
          return e;
        }
        function xe() {
          var e, t;
          return t = i, O("{"), e = ot(), O("}"), n.markEnd(n.createBlockStatement(e), t);
        }
        function ye() {
          var e, t;
          return t = i, e = N(), e.type !== y.Identifier && pe(e), n.markEnd(n.createIdentifier(e.value), t);
        }
        function lt(e) {
          var t = null, u, l;
          return l = i, u = ye(), c && J(u.name) && G({}, a.StrictVarName), e === "const" ? (O("="), t = ce()) : _("=") && (N(), t = ce()), n.markEnd(n.createVariableDeclarator(u, t), l);
        }
        function Te(e) {
          var t = [];
          do {
            if (t.push(lt(e)), !_(","))
              break;
            N();
          } while (r < h);
          return t;
        }
        function ct() {
          var e;
          return Z("var"), e = Te(), he(), n.createVariableDeclaration(e, "var");
        }
        function ft(e) {
          var t, u;
          return u = i, Z(e), t = Te(e), he(), n.markEnd(n.createVariableDeclaration(t, e), u);
        }
        function pt() {
          return O(";"), n.createEmptyStatement();
        }
        function ht() {
          var e = te();
          return he(), n.createExpressionStatement(e);
        }
        function mt() {
          var e, t, u;
          return Z("if"), O("("), e = te(), O(")"), t = me(), ne("else") ? (N(), u = me()) : u = null, n.createIfStatement(e, t, u);
        }
        function yt() {
          var e, t, u;
          return Z("do"), u = p.inIteration, p.inIteration = !0, e = me(), p.inIteration = u, Z("while"), O("("), t = te(), O(")"), _(";") && N(), n.createDoWhileStatement(e, t);
        }
        function dt() {
          var e, t, u;
          return Z("while"), O("("), e = te(), O(")"), u = p.inIteration, p.inIteration = !0, t = me(), p.inIteration = u, n.createWhileStatement(e, t);
        }
        function Et() {
          var e, t, u;
          return u = i, e = N(), t = Te(), n.markEnd(n.createVariableDeclaration(t, e.value), u);
        }
        function At() {
          var e, t, u, l, C, x, j;
          return e = t = u = null, Z("for"), O("("), _(";") ? N() : (ne("var") || ne("let") ? (p.allowIn = !1, e = Et(), p.allowIn = !0, e.declarations.length === 1 && ne("in") && (N(), l = e, C = te(), e = null)) : (p.allowIn = !1, e = te(), p.allowIn = !0, ne("in") && (be(e) || G({}, a.InvalidLHSInForIn), N(), l = e, C = te(), e = null)), typeof l > "u" && O(";")), typeof l > "u" && (_(";") || (t = te()), O(";"), _(")") || (u = te())), O(")"), j = p.inIteration, p.inIteration = !0, x = me(), p.inIteration = j, typeof l > "u" ? n.createForStatement(e, t, u, x) : n.createForInStatement(l, C, x);
        }
        function gt() {
          var e = null, t;
          return Z("continue"), s.charCodeAt(r) === 59 ? (N(), p.inIteration || P({}, a.IllegalContinue), n.createContinueStatement(null)) : Ce() ? (p.inIteration || P({}, a.IllegalContinue), n.createContinueStatement(null)) : (i.type === y.Identifier && (e = ye(), t = "$" + e.name, Object.prototype.hasOwnProperty.call(p.labelSet, t) || P({}, a.UnknownLabel, e.name)), he(), e === null && !p.inIteration && P({}, a.IllegalContinue), n.createContinueStatement(e));
        }
        function Ct() {
          var e = null, t;
          return Z("break"), s.charCodeAt(r) === 59 ? (N(), p.inIteration || p.inSwitch || P({}, a.IllegalBreak), n.createBreakStatement(null)) : Ce() ? (p.inIteration || p.inSwitch || P({}, a.IllegalBreak), n.createBreakStatement(null)) : (i.type === y.Identifier && (e = ye(), t = "$" + e.name, Object.prototype.hasOwnProperty.call(p.labelSet, t) || P({}, a.UnknownLabel, e.name)), he(), e === null && !(p.inIteration || p.inSwitch) && P({}, a.IllegalBreak), n.createBreakStatement(e));
        }
        function St() {
          var e = null;
          return Z("return"), p.inFunctionBody || G({}, a.IllegalReturn), s.charCodeAt(r) === 32 && z(s.charCodeAt(r + 1)) ? (e = te(), he(), n.createReturnStatement(e)) : Ce() ? n.createReturnStatement(null) : (_(";") || !_("}") && i.type !== y.EOF && (e = te()), he(), n.createReturnStatement(e));
        }
        function vt() {
          var e, t;
          return c && (A(), G({}, a.StrictModeWith)), Z("with"), O("("), e = te(), O(")"), t = me(), n.createWithStatement(e, t);
        }
        function Ft() {
          var e, t = [], u, l;
          for (l = i, ne("default") ? (N(), e = null) : (Z("case"), e = te()), O(":"); r < h && !(_("}") || ne("default") || ne("case")); )
            u = me(), t.push(u);
          return n.markEnd(n.createSwitchCase(e, t), l);
        }
        function bt() {
          var e, t, u, l, C;
          if (Z("switch"), O("("), e = te(), O(")"), O("{"), t = [], _("}"))
            return N(), n.createSwitchStatement(e, t);
          for (l = p.inSwitch, p.inSwitch = !0, C = !1; r < h && !_("}"); )
            u = Ft(), u.test === null && (C && P({}, a.MultipleDefaultsInSwitch), C = !0), t.push(u);
          return p.inSwitch = l, O("}"), n.createSwitchStatement(e, t);
        }
        function Dt() {
          var e;
          return Z("throw"), Ce() && P({}, a.NewlineAfterThrow), e = te(), he(), n.createThrowStatement(e);
        }
        function xt() {
          var e, t, u;
          return u = i, Z("catch"), O("("), _(")") && pe(i), e = ye(), c && J(e.name) && G({}, a.StrictCatchVariable), O(")"), t = xe(), n.markEnd(n.createCatchClause(e, t), u);
        }
        function Bt() {
          var e, t = [], u = null;
          return Z("try"), e = xe(), ne("catch") && t.push(xt()), ne("finally") && (N(), u = xe()), t.length === 0 && !u && P({}, a.NoCatchOrFinally), n.createTryStatement(e, [], t, u);
        }
        function kt() {
          return Z("debugger"), he(), n.createDebuggerStatement();
        }
        function me() {
          var e = i.type, t, u, l, C;
          if (e === y.EOF && pe(i), e === y.Punctuator && i.value === "{")
            return xe();
          if (C = i, e === y.Punctuator)
            switch (i.value) {
              case ";":
                return n.markEnd(pt(), C);
              case "(":
                return n.markEnd(ht(), C);
            }
          if (e === y.Keyword)
            switch (i.value) {
              case "break":
                return n.markEnd(Ct(), C);
              case "continue":
                return n.markEnd(gt(), C);
              case "debugger":
                return n.markEnd(kt(), C);
              case "do":
                return n.markEnd(yt(), C);
              case "for":
                return n.markEnd(At(), C);
              case "function":
                return n.markEnd(Ge(), C);
              case "if":
                return n.markEnd(mt(), C);
              case "return":
                return n.markEnd(St(), C);
              case "switch":
                return n.markEnd(bt(), C);
              case "throw":
                return n.markEnd(Dt(), C);
              case "try":
                return n.markEnd(Bt(), C);
              case "var":
                return n.markEnd(ct(), C);
              case "while":
                return n.markEnd(dt(), C);
              case "with":
                return n.markEnd(vt(), C);
            }
          return t = te(), t.type === E.Identifier && _(":") ? (N(), l = "$" + t.name, Object.prototype.hasOwnProperty.call(p.labelSet, l) && P({}, a.Redeclaration, "Label", t.name), p.labelSet[l] = !0, u = me(), delete p.labelSet[l], n.markEnd(n.createLabeledStatement(t, u), C)) : (he(), n.markEnd(n.createExpressionStatement(t), C));
        }
        function Oe() {
          var e, t = [], u, l, C, x, j, W, ue, re;
          for (re = i, O("{"); r < h && !(i.type !== y.StringLiteral || (u = i, e = Se(), t.push(e), e.expression.type !== E.Literal)); )
            l = s.slice(u.start + 1, u.end - 1), l === "use strict" ? (c = !0, C && G(C, a.StrictOctalLiteral)) : !C && u.octal && (C = u);
          for (x = p.labelSet, j = p.inIteration, W = p.inSwitch, ue = p.inFunctionBody, p.labelSet = {}, p.inIteration = !1, p.inSwitch = !1, p.inFunctionBody = !0; r < h && !(_("}") || (e = Se(), typeof e > "u")); )
            t.push(e);
          return O("}"), p.labelSet = x, p.inIteration = j, p.inSwitch = W, p.inFunctionBody = ue, n.markEnd(n.createBlockStatement(t), re);
        }
        function qe(e) {
          var t, u = [], l, C, x, j, W;
          if (O("("), !_(")"))
            for (x = {}; r < h && (l = i, t = ye(), j = "$" + l.value, c ? (J(l.value) && (C = l, W = a.StrictParamName), Object.prototype.hasOwnProperty.call(x, j) && (C = l, W = a.StrictParamDupe)) : e || (J(l.value) ? (e = l, W = a.StrictParamName) : Y(l.value) ? (e = l, W = a.StrictReservedWord) : Object.prototype.hasOwnProperty.call(x, j) && (e = l, W = a.StrictParamDupe)), u.push(t), x[j] = !0, !_(")")); )
              O(",");
          return O(")"), {
            params: u,
            stricted: C,
            firstRestricted: e,
            message: W
          };
        }
        function Ge() {
          var e, t = [], u, l, C, x, j, W, ue, re;
          return re = i, Z("function"), l = i, e = ye(), c ? J(l.value) && G(l, a.StrictFunctionName) : J(l.value) ? (j = l, W = a.StrictFunctionName) : Y(l.value) && (j = l, W = a.StrictReservedWord), x = qe(j), t = x.params, C = x.stricted, j = x.firstRestricted, x.message && (W = x.message), ue = c, u = Oe(), c && j && P(j, W), c && C && G(C, W), c = ue, n.markEnd(n.createFunctionDeclaration(e, t, [], u), re);
        }
        function It() {
          var e, t = null, u, l, C, x, j = [], W, ue, re;
          return re = i, Z("function"), _("(") || (e = i, t = ye(), c ? J(e.value) && G(e, a.StrictFunctionName) : J(e.value) ? (l = e, C = a.StrictFunctionName) : Y(e.value) && (l = e, C = a.StrictReservedWord)), x = qe(l), j = x.params, u = x.stricted, l = x.firstRestricted, x.message && (C = x.message), ue = c, W = Oe(), c && l && P(l, C), c && u && G(u, C), c = ue, n.markEnd(n.createFunctionExpression(t, j, [], W), re);
        }
        function Se() {
          if (i.type === y.Keyword)
            switch (i.value) {
              case "const":
              case "let":
                return ft(i.value);
              case "function":
                return Ge();
              default:
                return me();
            }
          if (i.type !== y.EOF)
            return me();
        }
        function wt() {
          for (var e, t = [], u, l, C; r < h && (u = i, !(u.type !== y.StringLiteral || (e = Se(), t.push(e), e.expression.type !== E.Literal))); )
            l = s.slice(u.start + 1, u.end - 1), l === "use strict" ? (c = !0, C && G(C, a.StrictOctalLiteral)) : !C && u.octal && (C = u);
          for (; r < h && (e = Se(), !(typeof e > "u")); )
            t.push(e);
          return t;
        }
        function _t() {
          var e, t;
          return A(), we(), t = i, c = !1, e = wt(), n.markEnd(n.createProgram(e), t);
        }
        function We() {
          var e, t, u, l = [];
          for (e = 0; e < f.tokens.length; ++e)
            t = f.tokens[e], u = {
              type: t.type,
              value: t.value
            }, f.range && (u.range = t.range), f.loc && (u.loc = t.loc), l.push(u);
          f.tokens = l;
        }
        function Tt(e, t) {
          var u, l, C;
          u = String, typeof e != "string" && !(e instanceof String) && (e = u(e)), n = m, s = e, r = 0, g = s.length > 0 ? 1 : 0, b = 0, h = s.length, i = null, p = {
            allowIn: !0,
            labelSet: {},
            inFunctionBody: !1,
            inIteration: !1,
            inSwitch: !1,
            lastCommentStart: -1
          }, f = {}, t = t || {}, t.tokens = !0, f.tokens = [], f.tokenize = !0, f.openParenToken = -1, f.openCurlyToken = -1, f.range = typeof t.range == "boolean" && t.range, f.loc = typeof t.loc == "boolean" && t.loc, typeof t.comment == "boolean" && t.comment && (f.comments = []), typeof t.tolerant == "boolean" && t.tolerant && (f.errors = []);
          try {
            if (we(), i.type === y.EOF)
              return f.tokens;
            for (l = N(); i.type !== y.EOF; )
              try {
                l = N();
              } catch (x) {
                if (l = i, f.errors) {
                  f.errors.push(x);
                  break;
                } else
                  throw x;
              }
            We(), C = f.tokens, typeof f.comments < "u" && (C.comments = f.comments), typeof f.errors < "u" && (C.errors = f.errors);
          } catch (x) {
            throw x;
          } finally {
            f = {};
          }
          return C;
        }
        function Ot(e, t) {
          var u, l;
          l = String, typeof e != "string" && !(e instanceof String) && (e = l(e)), n = m, s = e, r = 0, g = s.length > 0 ? 1 : 0, b = 0, h = s.length, i = null, p = {
            allowIn: !0,
            labelSet: {},
            inFunctionBody: !1,
            inIteration: !1,
            inSwitch: !1,
            lastCommentStart: -1
          }, f = {}, typeof t < "u" && (f.range = typeof t.range == "boolean" && t.range, f.loc = typeof t.loc == "boolean" && t.loc, f.attachComment = typeof t.attachComment == "boolean" && t.attachComment, f.loc && t.source !== null && t.source !== void 0 && (f.source = l(t.source)), typeof t.tokens == "boolean" && t.tokens && (f.tokens = []), typeof t.comment == "boolean" && t.comment && (f.comments = []), typeof t.tolerant == "boolean" && t.tolerant && (f.errors = []), f.attachComment && (f.range = !0, f.comments = [], f.bottomRightStack = [], f.trailingComments = [], f.leadingComments = []));
          try {
            u = _t(), typeof f.comments < "u" && (u.comments = f.comments), typeof f.tokens < "u" && (We(), u.tokens = f.tokens), typeof f.errors < "u" && (u.errors = f.errors);
          } catch (C) {
            throw C;
          } finally {
            f = {};
          }
          return u;
        }
        v.version = "1.2.2", v.tokenize = Tt, v.parse = Ot, v.Syntax = function() {
          var e, t = {};
          typeof Object.create == "function" && (t = /* @__PURE__ */ Object.create(null));
          for (e in E)
            E.hasOwnProperty(e) && (t[e] = E[e]);
          return typeof Object.freeze == "function" && Object.freeze(t), t;
        }();
      });
    }, {}], 1: [function(T, L, B) {
      (function(v) {
        var y = function() {
          var D = {
            trace: function() {
            },
            yy: {},
            symbols_: { error: 2, JSON_PATH: 3, DOLLAR: 4, PATH_COMPONENTS: 5, LEADING_CHILD_MEMBER_EXPRESSION: 6, PATH_COMPONENT: 7, MEMBER_COMPONENT: 8, SUBSCRIPT_COMPONENT: 9, CHILD_MEMBER_COMPONENT: 10, DESCENDANT_MEMBER_COMPONENT: 11, DOT: 12, MEMBER_EXPRESSION: 13, DOT_DOT: 14, STAR: 15, IDENTIFIER: 16, SCRIPT_EXPRESSION: 17, INTEGER: 18, END: 19, CHILD_SUBSCRIPT_COMPONENT: 20, DESCENDANT_SUBSCRIPT_COMPONENT: 21, "[": 22, SUBSCRIPT: 23, "]": 24, SUBSCRIPT_EXPRESSION: 25, SUBSCRIPT_EXPRESSION_LIST: 26, SUBSCRIPT_EXPRESSION_LISTABLE: 27, ",": 28, STRING_LITERAL: 29, ARRAY_SLICE: 30, FILTER_EXPRESSION: 31, QQ_STRING: 32, Q_STRING: 33, $accept: 0, $end: 1 },
            terminals_: { 2: "error", 4: "DOLLAR", 12: "DOT", 14: "DOT_DOT", 15: "STAR", 16: "IDENTIFIER", 17: "SCRIPT_EXPRESSION", 18: "INTEGER", 19: "END", 22: "[", 24: "]", 28: ",", 30: "ARRAY_SLICE", 31: "FILTER_EXPRESSION", 32: "QQ_STRING", 33: "Q_STRING" },
            productions_: [0, [3, 1], [3, 2], [3, 1], [3, 2], [5, 1], [5, 2], [7, 1], [7, 1], [8, 1], [8, 1], [10, 2], [6, 1], [11, 2], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [9, 1], [9, 1], [20, 3], [21, 4], [23, 1], [23, 1], [26, 1], [26, 3], [27, 1], [27, 1], [27, 1], [25, 1], [25, 1], [25, 1], [29, 1], [29, 1]],
            performAction: function(o, m, s, c, r, g, b) {
              c.ast || (c.ast = S, S.initialize());
              var h = g.length - 1;
              switch (r) {
                case 1:
                  return c.ast.set({ expression: { type: "root", value: g[h] } }), c.ast.unshift(), c.ast.yield();
                case 2:
                  return c.ast.set({ expression: { type: "root", value: g[h - 1] } }), c.ast.unshift(), c.ast.yield();
                case 3:
                  return c.ast.unshift(), c.ast.yield();
                case 4:
                  return c.ast.set({ operation: "member", scope: "child", expression: { type: "identifier", value: g[h - 1] } }), c.ast.unshift(), c.ast.yield();
                case 5:
                  break;
                case 6:
                  break;
                case 7:
                  c.ast.set({ operation: "member" }), c.ast.push();
                  break;
                case 8:
                  c.ast.set({ operation: "subscript" }), c.ast.push();
                  break;
                case 9:
                  c.ast.set({ scope: "child" });
                  break;
                case 10:
                  c.ast.set({ scope: "descendant" });
                  break;
                case 11:
                  break;
                case 12:
                  c.ast.set({ scope: "child", operation: "member" });
                  break;
                case 13:
                  break;
                case 14:
                  c.ast.set({ expression: { type: "wildcard", value: g[h] } });
                  break;
                case 15:
                  c.ast.set({ expression: { type: "identifier", value: g[h] } });
                  break;
                case 16:
                  c.ast.set({ expression: { type: "script_expression", value: g[h] } });
                  break;
                case 17:
                  c.ast.set({ expression: { type: "numeric_literal", value: parseInt(g[h]) } });
                  break;
                case 18:
                  break;
                case 19:
                  c.ast.set({ scope: "child" });
                  break;
                case 20:
                  c.ast.set({ scope: "descendant" });
                  break;
                case 21:
                  break;
                case 22:
                  break;
                case 23:
                  break;
                case 24:
                  g[h].length > 1 ? c.ast.set({ expression: { type: "union", value: g[h] } }) : this.$ = g[h];
                  break;
                case 25:
                  this.$ = [g[h]];
                  break;
                case 26:
                  this.$ = g[h - 2].concat(g[h]);
                  break;
                case 27:
                  this.$ = { expression: { type: "numeric_literal", value: parseInt(g[h]) } }, c.ast.set(this.$);
                  break;
                case 28:
                  this.$ = { expression: { type: "string_literal", value: g[h] } }, c.ast.set(this.$);
                  break;
                case 29:
                  this.$ = { expression: { type: "slice", value: g[h] } }, c.ast.set(this.$);
                  break;
                case 30:
                  this.$ = { expression: { type: "wildcard", value: g[h] } }, c.ast.set(this.$);
                  break;
                case 31:
                  this.$ = { expression: { type: "script_expression", value: g[h] } }, c.ast.set(this.$);
                  break;
                case 32:
                  this.$ = { expression: { type: "filter_expression", value: g[h] } }, c.ast.set(this.$);
                  break;
                case 33:
                  this.$ = g[h];
                  break;
                case 34:
                  this.$ = g[h];
                  break;
              }
            },
            table: [{ 3: 1, 4: [1, 2], 6: 3, 13: 4, 15: [1, 5], 16: [1, 6], 17: [1, 7], 18: [1, 8], 19: [1, 9] }, { 1: [3] }, { 1: [2, 1], 5: 10, 7: 11, 8: 12, 9: 13, 10: 14, 11: 15, 12: [1, 18], 14: [1, 19], 20: 16, 21: 17, 22: [1, 20] }, { 1: [2, 3], 5: 21, 7: 11, 8: 12, 9: 13, 10: 14, 11: 15, 12: [1, 18], 14: [1, 19], 20: 16, 21: 17, 22: [1, 20] }, { 1: [2, 12], 12: [2, 12], 14: [2, 12], 22: [2, 12] }, { 1: [2, 14], 12: [2, 14], 14: [2, 14], 22: [2, 14] }, { 1: [2, 15], 12: [2, 15], 14: [2, 15], 22: [2, 15] }, { 1: [2, 16], 12: [2, 16], 14: [2, 16], 22: [2, 16] }, { 1: [2, 17], 12: [2, 17], 14: [2, 17], 22: [2, 17] }, { 1: [2, 18], 12: [2, 18], 14: [2, 18], 22: [2, 18] }, { 1: [2, 2], 7: 22, 8: 12, 9: 13, 10: 14, 11: 15, 12: [1, 18], 14: [1, 19], 20: 16, 21: 17, 22: [1, 20] }, { 1: [2, 5], 12: [2, 5], 14: [2, 5], 22: [2, 5] }, { 1: [2, 7], 12: [2, 7], 14: [2, 7], 22: [2, 7] }, { 1: [2, 8], 12: [2, 8], 14: [2, 8], 22: [2, 8] }, { 1: [2, 9], 12: [2, 9], 14: [2, 9], 22: [2, 9] }, { 1: [2, 10], 12: [2, 10], 14: [2, 10], 22: [2, 10] }, { 1: [2, 19], 12: [2, 19], 14: [2, 19], 22: [2, 19] }, { 1: [2, 20], 12: [2, 20], 14: [2, 20], 22: [2, 20] }, { 13: 23, 15: [1, 5], 16: [1, 6], 17: [1, 7], 18: [1, 8], 19: [1, 9] }, { 13: 24, 15: [1, 5], 16: [1, 6], 17: [1, 7], 18: [1, 8], 19: [1, 9], 22: [1, 25] }, { 15: [1, 29], 17: [1, 30], 18: [1, 33], 23: 26, 25: 27, 26: 28, 27: 32, 29: 34, 30: [1, 35], 31: [1, 31], 32: [1, 36], 33: [1, 37] }, { 1: [2, 4], 7: 22, 8: 12, 9: 13, 10: 14, 11: 15, 12: [1, 18], 14: [1, 19], 20: 16, 21: 17, 22: [1, 20] }, { 1: [2, 6], 12: [2, 6], 14: [2, 6], 22: [2, 6] }, { 1: [2, 11], 12: [2, 11], 14: [2, 11], 22: [2, 11] }, { 1: [2, 13], 12: [2, 13], 14: [2, 13], 22: [2, 13] }, { 15: [1, 29], 17: [1, 30], 18: [1, 33], 23: 38, 25: 27, 26: 28, 27: 32, 29: 34, 30: [1, 35], 31: [1, 31], 32: [1, 36], 33: [1, 37] }, { 24: [1, 39] }, { 24: [2, 23] }, { 24: [2, 24], 28: [1, 40] }, { 24: [2, 30] }, { 24: [2, 31] }, { 24: [2, 32] }, { 24: [2, 25], 28: [2, 25] }, { 24: [2, 27], 28: [2, 27] }, { 24: [2, 28], 28: [2, 28] }, { 24: [2, 29], 28: [2, 29] }, { 24: [2, 33], 28: [2, 33] }, { 24: [2, 34], 28: [2, 34] }, { 24: [1, 41] }, { 1: [2, 21], 12: [2, 21], 14: [2, 21], 22: [2, 21] }, { 18: [1, 33], 27: 42, 29: 34, 30: [1, 35], 32: [1, 36], 33: [1, 37] }, { 1: [2, 22], 12: [2, 22], 14: [2, 22], 22: [2, 22] }, { 24: [2, 26], 28: [2, 26] }],
            defaultActions: { 27: [2, 23], 29: [2, 30], 30: [2, 31], 31: [2, 32] },
            parseError: function(o, m) {
              if (m.recoverable)
                this.trace(o);
              else
                throw new Error(o);
            },
            parse: function(o) {
              var m = this, s = [0], c = [null], r = [], g = this.table, b = "", h = 0, n = 0, i = 2, p = 1, f = r.slice.call(arguments, 1);
              this.lexer.setInput(o), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, this.yy.parser = this, typeof this.lexer.yylloc > "u" && (this.lexer.yylloc = {});
              var I = this.lexer.yylloc;
              r.push(I);
              var R = this.lexer.options && this.lexer.options.ranges;
              typeof this.yy.parseError == "function" ? this.parseError = this.yy.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
              function U() {
                var oe;
                return oe = m.lexer.lex() || p, typeof oe != "number" && (oe = m.symbols_[oe] || oe), oe;
              }
              for (var w, H, M, z, V = {}, ae, Y, J, se; ; ) {
                if (H = s[s.length - 1], this.defaultActions[H] ? M = this.defaultActions[H] : ((w === null || typeof w > "u") && (w = U()), M = g[H] && g[H][w]), typeof M > "u" || !M.length || !M[0]) {
                  var ie = "";
                  se = [];
                  for (ae in g[H])
                    this.terminals_[ae] && ae > i && se.push("'" + this.terminals_[ae] + "'");
                  this.lexer.showPosition ? ie = "Parse error on line " + (h + 1) + `:
` + this.lexer.showPosition() + `
Expecting ` + se.join(", ") + ", got '" + (this.terminals_[w] || w) + "'" : ie = "Parse error on line " + (h + 1) + ": Unexpected " + (w == p ? "end of input" : "'" + (this.terminals_[w] || w) + "'"), this.parseError(ie, {
                    text: this.lexer.match,
                    token: this.terminals_[w] || w,
                    line: this.lexer.yylineno,
                    loc: I,
                    expected: se
                  });
                }
                if (M[0] instanceof Array && M.length > 1)
                  throw new Error("Parse Error: multiple actions possible at state: " + H + ", token: " + w);
                switch (M[0]) {
                  case 1:
                    s.push(w), c.push(this.lexer.yytext), r.push(this.lexer.yylloc), s.push(M[1]), w = null, n = this.lexer.yyleng, b = this.lexer.yytext, h = this.lexer.yylineno, I = this.lexer.yylloc;
                    break;
                  case 2:
                    if (Y = this.productions_[M[1]][1], V.$ = c[c.length - Y], V._$ = {
                      first_line: r[r.length - (Y || 1)].first_line,
                      last_line: r[r.length - 1].last_line,
                      first_column: r[r.length - (Y || 1)].first_column,
                      last_column: r[r.length - 1].last_column
                    }, R && (V._$.range = [
                      r[r.length - (Y || 1)].range[0],
                      r[r.length - 1].range[1]
                    ]), z = this.performAction.apply(V, [
                      b,
                      n,
                      h,
                      this.yy,
                      M[1],
                      c,
                      r
                    ].concat(f)), typeof z < "u")
                      return z;
                    Y && (s = s.slice(0, -1 * Y * 2), c = c.slice(0, -1 * Y), r = r.slice(0, -1 * Y)), s.push(this.productions_[M[1]][0]), c.push(V.$), r.push(V._$), J = g[s[s.length - 2]][s[s.length - 1]], s.push(J);
                    break;
                  case 3:
                    return !0;
                }
              }
              return !0;
            }
          }, S = {
            initialize: function() {
              this._nodes = [], this._node = {}, this._stash = [];
            },
            set: function(a) {
              for (var o in a)
                this._node[o] = a[o];
              return this._node;
            },
            node: function(a) {
              return arguments.length && (this._node = a), this._node;
            },
            push: function() {
              this._nodes.push(this._node), this._node = {};
            },
            unshift: function() {
              this._nodes.unshift(this._node), this._node = {};
            },
            yield: function() {
              var a = this._nodes;
              return this.initialize(), a;
            }
          }, E = /* @__PURE__ */ function() {
            var a = {
              EOF: 1,
              parseError: function(m, s) {
                if (this.yy.parser)
                  this.yy.parser.parseError(m, s);
                else
                  throw new Error(m);
              },
              // resets the lexer, sets new input
              setInput: function(o) {
                return this._input = o, this._more = this._backtrack = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
                  first_line: 1,
                  first_column: 0,
                  last_line: 1,
                  last_column: 0
                }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this;
              },
              // consumes and returns one char from the input
              input: function() {
                var o = this._input[0];
                this.yytext += o, this.yyleng++, this.offset++, this.match += o, this.matched += o;
                var m = o.match(/(?:\r\n?|\n).*/g);
                return m ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), o;
              },
              // unshifts one char (or a string) into the input
              unput: function(o) {
                var m = o.length, s = o.split(/(?:\r\n?|\n)/g);
                this._input = o + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - m - 1), this.offset -= m;
                var c = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), s.length - 1 && (this.yylineno -= s.length - 1);
                var r = this.yylloc.range;
                return this.yylloc = {
                  first_line: this.yylloc.first_line,
                  last_line: this.yylineno + 1,
                  first_column: this.yylloc.first_column,
                  last_column: s ? (s.length === c.length ? this.yylloc.first_column : 0) + c[c.length - s.length].length - s[0].length : this.yylloc.first_column - m
                }, this.options.ranges && (this.yylloc.range = [r[0], r[0] + this.yyleng - m]), this.yyleng = this.yytext.length, this;
              },
              // When called from action, caches matched text and appends it on next action
              more: function() {
                return this._more = !0, this;
              },
              // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
              reject: function() {
                if (this.options.backtrack_lexer)
                  this._backtrack = !0;
                else
                  return this.parseError("Lexical error on line " + (this.yylineno + 1) + `. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
` + this.showPosition(), {
                    text: "",
                    token: null,
                    line: this.yylineno
                  });
                return this;
              },
              // retain first n characters of the match
              less: function(o) {
                this.unput(this.match.slice(o));
              },
              // displays already matched input, i.e. for error messages
              pastInput: function() {
                var o = this.matched.substr(0, this.matched.length - this.match.length);
                return (o.length > 20 ? "..." : "") + o.substr(-20).replace(/\n/g, "");
              },
              // displays upcoming input, i.e. for error messages
              upcomingInput: function() {
                var o = this.match;
                return o.length < 20 && (o += this._input.substr(0, 20 - o.length)), (o.substr(0, 20) + (o.length > 20 ? "..." : "")).replace(/\n/g, "");
              },
              // displays the character position where the lexing error occurred, i.e. for error messages
              showPosition: function() {
                var o = this.pastInput(), m = new Array(o.length + 1).join("-");
                return o + this.upcomingInput() + `
` + m + "^";
              },
              // test the lexed token: return FALSE when not a match, otherwise return token
              test_match: function(o, m) {
                var s, c, r;
                if (this.options.backtrack_lexer && (r = {
                  yylineno: this.yylineno,
                  yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                  },
                  yytext: this.yytext,
                  match: this.match,
                  matches: this.matches,
                  matched: this.matched,
                  yyleng: this.yyleng,
                  offset: this.offset,
                  _more: this._more,
                  _input: this._input,
                  yy: this.yy,
                  conditionStack: this.conditionStack.slice(0),
                  done: this.done
                }, this.options.ranges && (r.yylloc.range = this.yylloc.range.slice(0))), c = o[0].match(/(?:\r\n?|\n).*/g), c && (this.yylineno += c.length), this.yylloc = {
                  first_line: this.yylloc.last_line,
                  last_line: this.yylineno + 1,
                  first_column: this.yylloc.last_column,
                  last_column: c ? c[c.length - 1].length - c[c.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + o[0].length
                }, this.yytext += o[0], this.match += o[0], this.matches = o, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._backtrack = !1, this._input = this._input.slice(o[0].length), this.matched += o[0], s = this.performAction.call(this, this.yy, this, m, this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), s)
                  return s;
                if (this._backtrack) {
                  for (var g in r)
                    this[g] = r[g];
                  return !1;
                }
                return !1;
              },
              // return next match in input
              next: function() {
                if (this.done)
                  return this.EOF;
                this._input || (this.done = !0);
                var o, m, s, c;
                this._more || (this.yytext = "", this.match = "");
                for (var r = this._currentRules(), g = 0; g < r.length; g++)
                  if (s = this._input.match(this.rules[r[g]]), s && (!m || s[0].length > m[0].length)) {
                    if (m = s, c = g, this.options.backtrack_lexer) {
                      if (o = this.test_match(s, r[g]), o !== !1)
                        return o;
                      if (this._backtrack) {
                        m = !1;
                        continue;
                      } else
                        return !1;
                    } else if (!this.options.flex)
                      break;
                  }
                return m ? (o = this.test_match(m, r[c]), o !== !1 ? o : !1) : this._input === "" ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), {
                  text: "",
                  token: null,
                  line: this.yylineno
                });
              },
              // return next match that has a token
              lex: function() {
                var m = this.next();
                return m || this.lex();
              },
              // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
              begin: function(m) {
                this.conditionStack.push(m);
              },
              // pop the previously active lexer condition state off the condition stack
              popState: function() {
                var m = this.conditionStack.length - 1;
                return m > 0 ? this.conditionStack.pop() : this.conditionStack[0];
              },
              // produce the lexer rule set which is active for the currently active lexer condition state
              _currentRules: function() {
                return this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1] ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules : this.conditions.INITIAL.rules;
              },
              // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
              topState: function(m) {
                return m = this.conditionStack.length - 1 - Math.abs(m || 0), m >= 0 ? this.conditionStack[m] : "INITIAL";
              },
              // alias for begin(condition)
              pushState: function(m) {
                this.begin(m);
              },
              // return the number of states currently on the stack
              stateStackSize: function() {
                return this.conditionStack.length;
              },
              options: {},
              performAction: function(m, s, c, r) {
                switch (c) {
                  case 0:
                    return 4;
                  case 1:
                    return 14;
                  case 2:
                    return 12;
                  case 3:
                    return 15;
                  case 4:
                    return 16;
                  case 5:
                    return 22;
                  case 6:
                    return 24;
                  case 7:
                    return 28;
                  case 8:
                    return 30;
                  case 9:
                    return 18;
                  case 10:
                    return s.yytext = s.yytext.substr(1, s.yyleng - 2), 32;
                  case 11:
                    return s.yytext = s.yytext.substr(1, s.yyleng - 2), 33;
                  case 12:
                    return 17;
                  case 13:
                    return 31;
                }
              },
              rules: [/^(?:\$)/, /^(?:\.\.)/, /^(?:\.)/, /^(?:\*)/, /^(?:[a-zA-Z_]+[a-zA-Z0-9_]*)/, /^(?:\[)/, /^(?:\])/, /^(?:,)/, /^(?:((-?(?:0|[1-9][0-9]*)))?\:((-?(?:0|[1-9][0-9]*)))?(\:((-?(?:0|[1-9][0-9]*)))?)?)/, /^(?:(-?(?:0|[1-9][0-9]*)))/, /^(?:"(?:\\["bfnrt/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*")/, /^(?:'(?:\\['bfnrt/\\]|\\u[a-fA-F0-9]{4}|[^'\\])*')/, /^(?:\(.+?\)(?=\]))/, /^(?:\?\(.+?\)(?=\]))/],
              conditions: { INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], inclusive: !0 } }
            };
            return a;
          }();
          D.lexer = E;
          function d() {
            this.yy = {};
          }
          return d.prototype = D, D.Parser = d, new d();
        }();
        typeof T < "u" && typeof B < "u" && (B.parser = y, B.Parser = y.Parser, B.parse = function() {
          return y.parse.apply(y, arguments);
        }, B.main = function(S) {
          S[1] || (console.log("Usage: " + S[0] + " FILE"), v.exit(1));
          var E = T("fs").readFileSync(T("path").normalize(S[1]), "utf8");
          return B.parser.parse(E);
        }, typeof L < "u" && T.main === L && B.main(v.argv.slice(1)));
      }).call(this, T("_process"));
    }, { _process: 14, fs: 12, path: 13 }], 2: [function(T, L, B) {
      L.exports = {
        identifier: "[a-zA-Z_]+[a-zA-Z0-9_]*",
        integer: "-?(?:0|[1-9][0-9]*)",
        qq_string: '"(?:\\\\["bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^"\\\\])*"',
        q_string: "'(?:\\\\['bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^'\\\\])*'"
      };
    }, {}], 3: [function(T, L, B) {
      var v = T("./dict"), y = T("fs"), D = {
        lex: {
          macros: {
            esc: "\\\\",
            int: v.integer
          },
          rules: [
            ["\\$", "return 'DOLLAR'"],
            ["\\.\\.", "return 'DOT_DOT'"],
            ["\\.", "return 'DOT'"],
            ["\\*", "return 'STAR'"],
            [v.identifier, "return 'IDENTIFIER'"],
            ["\\[", "return '['"],
            ["\\]", "return ']'"],
            [",", "return ','"],
            ["({int})?\\:({int})?(\\:({int})?)?", "return 'ARRAY_SLICE'"],
            ["{int}", "return 'INTEGER'"],
            [v.qq_string, "yytext = yytext.substr(1,yyleng-2); return 'QQ_STRING';"],
            [v.q_string, "yytext = yytext.substr(1,yyleng-2); return 'Q_STRING';"],
            ["\\(.+?\\)(?=\\])", "return 'SCRIPT_EXPRESSION'"],
            ["\\?\\(.+?\\)(?=\\])", "return 'FILTER_EXPRESSION'"]
          ]
        },
        start: "JSON_PATH",
        bnf: {
          JSON_PATH: [
            ["DOLLAR", 'yy.ast.set({ expression: { type: "root", value: $1 } }); yy.ast.unshift(); return yy.ast.yield()'],
            ["DOLLAR PATH_COMPONENTS", 'yy.ast.set({ expression: { type: "root", value: $1 } }); yy.ast.unshift(); return yy.ast.yield()'],
            ["LEADING_CHILD_MEMBER_EXPRESSION", "yy.ast.unshift(); return yy.ast.yield()"],
            ["LEADING_CHILD_MEMBER_EXPRESSION PATH_COMPONENTS", 'yy.ast.set({ operation: "member", scope: "child", expression: { type: "identifier", value: $1 }}); yy.ast.unshift(); return yy.ast.yield()']
          ],
          PATH_COMPONENTS: [
            ["PATH_COMPONENT", ""],
            ["PATH_COMPONENTS PATH_COMPONENT", ""]
          ],
          PATH_COMPONENT: [
            ["MEMBER_COMPONENT", 'yy.ast.set({ operation: "member" }); yy.ast.push()'],
            ["SUBSCRIPT_COMPONENT", 'yy.ast.set({ operation: "subscript" }); yy.ast.push() ']
          ],
          MEMBER_COMPONENT: [
            ["CHILD_MEMBER_COMPONENT", 'yy.ast.set({ scope: "child" })'],
            ["DESCENDANT_MEMBER_COMPONENT", 'yy.ast.set({ scope: "descendant" })']
          ],
          CHILD_MEMBER_COMPONENT: [
            ["DOT MEMBER_EXPRESSION", ""]
          ],
          LEADING_CHILD_MEMBER_EXPRESSION: [
            ["MEMBER_EXPRESSION", 'yy.ast.set({ scope: "child", operation: "member" })']
          ],
          DESCENDANT_MEMBER_COMPONENT: [
            ["DOT_DOT MEMBER_EXPRESSION", ""]
          ],
          MEMBER_EXPRESSION: [
            ["STAR", 'yy.ast.set({ expression: { type: "wildcard", value: $1 } })'],
            ["IDENTIFIER", 'yy.ast.set({ expression: { type: "identifier", value: $1 } })'],
            ["SCRIPT_EXPRESSION", 'yy.ast.set({ expression: { type: "script_expression", value: $1 } })'],
            ["INTEGER", 'yy.ast.set({ expression: { type: "numeric_literal", value: parseInt($1) } })'],
            ["END", ""]
          ],
          SUBSCRIPT_COMPONENT: [
            ["CHILD_SUBSCRIPT_COMPONENT", 'yy.ast.set({ scope: "child" })'],
            ["DESCENDANT_SUBSCRIPT_COMPONENT", 'yy.ast.set({ scope: "descendant" })']
          ],
          CHILD_SUBSCRIPT_COMPONENT: [
            ["[ SUBSCRIPT ]", ""]
          ],
          DESCENDANT_SUBSCRIPT_COMPONENT: [
            ["DOT_DOT [ SUBSCRIPT ]", ""]
          ],
          SUBSCRIPT: [
            ["SUBSCRIPT_EXPRESSION", ""],
            ["SUBSCRIPT_EXPRESSION_LIST", '$1.length > 1? yy.ast.set({ expression: { type: "union", value: $1 } }) : $$ = $1']
          ],
          SUBSCRIPT_EXPRESSION_LIST: [
            ["SUBSCRIPT_EXPRESSION_LISTABLE", "$$ = [$1]"],
            ["SUBSCRIPT_EXPRESSION_LIST , SUBSCRIPT_EXPRESSION_LISTABLE", "$$ = $1.concat($3)"]
          ],
          SUBSCRIPT_EXPRESSION_LISTABLE: [
            ["INTEGER", '$$ = { expression: { type: "numeric_literal", value: parseInt($1) } }; yy.ast.set($$)'],
            ["STRING_LITERAL", '$$ = { expression: { type: "string_literal", value: $1 } }; yy.ast.set($$)'],
            ["ARRAY_SLICE", '$$ = { expression: { type: "slice", value: $1 } }; yy.ast.set($$)']
          ],
          SUBSCRIPT_EXPRESSION: [
            ["STAR", '$$ = { expression: { type: "wildcard", value: $1 } }; yy.ast.set($$)'],
            ["SCRIPT_EXPRESSION", '$$ = { expression: { type: "script_expression", value: $1 } }; yy.ast.set($$)'],
            ["FILTER_EXPRESSION", '$$ = { expression: { type: "filter_expression", value: $1 } }; yy.ast.set($$)']
          ],
          STRING_LITERAL: [
            ["QQ_STRING", "$$ = $1"],
            ["Q_STRING", "$$ = $1"]
          ]
        }
      };
      y.readFileSync && (D.moduleInclude = y.readFileSync(T.resolve("../include/module.js")), D.actionInclude = y.readFileSync(T.resolve("../include/action.js"))), L.exports = D;
    }, { "./dict": 2, fs: 12 }], 4: [function(T, L, B) {
      var v = T("./aesprim"), y = T("./slice"), D = T("static-eval"), S = T("underscore").uniq, E = function() {
        return this.initialize.apply(this, arguments);
      };
      E.prototype.initialize = function() {
        this.traverse = m(!0), this.descend = m();
      }, E.prototype.keys = Object.keys, E.prototype.resolve = function(h) {
        var n = [h.operation, h.scope, h.expression.type].join("-"), i = this._fns[n];
        if (!i)
          throw new Error("couldn't resolve key: " + n);
        return i.bind(this);
      }, E.prototype.register = function(h, n) {
        if (!n instanceof Function)
          throw new Error("handler must be a function");
        this._fns[h] = n;
      }, E.prototype._fns = {
        "member-child-identifier": function(h, n) {
          var i = h.expression.value, p = n.value;
          if (p instanceof Object && i in p)
            return [{ value: p[i], path: n.path.concat(i) }];
        },
        "member-descendant-identifier": c(function(h, n, i) {
          return h == i;
        }),
        "subscript-child-numeric_literal": s(function(h, n, i) {
          return h === i;
        }),
        "member-child-numeric_literal": s(function(h, n, i) {
          return String(h) === String(i);
        }),
        "subscript-descendant-numeric_literal": c(function(h, n, i) {
          return h === i;
        }),
        "member-child-wildcard": s(function() {
          return !0;
        }),
        "member-descendant-wildcard": c(function() {
          return !0;
        }),
        "subscript-descendant-wildcard": c(function() {
          return !0;
        }),
        "subscript-child-wildcard": s(function() {
          return !0;
        }),
        "subscript-child-slice": function(h, n) {
          if (a(n.value)) {
            var i = h.expression.value.split(":").map(b), p = n.value.map(function(f, I) {
              return { value: f, path: n.path.concat(I) };
            });
            return y.apply(null, [p].concat(i));
          }
        },
        "subscript-child-union": function(h, n) {
          var i = [];
          return h.expression.value.forEach(function(p) {
            var f = { operation: "subscript", scope: "child", expression: p.expression }, I = this.resolve(f), R = I(f, n);
            R && (i = i.concat(R));
          }, this), g(i);
        },
        "subscript-descendant-union": function(h, n, i) {
          var p = T(".."), f = this, I = [], R = p.nodes(n, "$..*").slice(1);
          return R.forEach(function(U) {
            I.length >= i || h.expression.value.forEach(function(w) {
              var H = { operation: "subscript", scope: "child", expression: w.expression }, M = f.resolve(H), z = M(H, U);
              I = I.concat(z);
            });
          }), g(I);
        },
        "subscript-child-filter_expression": function(h, n, i) {
          var p = h.expression.value.slice(2, -1), f = v.parse(p).body[0].expression, I = function(R, U) {
            return r(f, { "@": U });
          };
          return this.descend(n, null, I, i);
        },
        "subscript-descendant-filter_expression": function(h, n, i) {
          var p = h.expression.value.slice(2, -1), f = v.parse(p).body[0].expression, I = function(R, U) {
            return r(f, { "@": U });
          };
          return this.traverse(n, null, I, i);
        },
        "subscript-child-script_expression": function(h, n) {
          var i = h.expression.value.slice(1, -1);
          return d(n, i, "$[{{value}}]");
        },
        "member-child-script_expression": function(h, n) {
          var i = h.expression.value.slice(1, -1);
          return d(n, i, "$.{{value}}");
        },
        "member-descendant-script_expression": function(h, n) {
          var i = h.expression.value.slice(1, -1);
          return d(n, i, "$..value");
        }
      }, E.prototype._fns["subscript-child-string_literal"] = E.prototype._fns["member-child-identifier"], E.prototype._fns["member-descendant-numeric_literal"] = E.prototype._fns["subscript-descendant-string_literal"] = E.prototype._fns["member-descendant-identifier"];
      function d(h, n, i) {
        var p = T("./index"), f = v.parse(n).body[0].expression, I = r(f, { "@": h.value }), R = i.replace(/\{\{\s*value\s*\}\}/g, I), U = p.nodes(h.value, R);
        return U.forEach(function(w) {
          w.path = h.path.concat(w.path.slice(1));
        }), U;
      }
      function a(h) {
        return Array.isArray(h);
      }
      function o(h) {
        return h && !(h instanceof Array) && h instanceof Object;
      }
      function m(h) {
        return function(n, i, p, f) {
          var I = n.value, R = n.path, U = [], w = (function(H, M) {
            a(H) ? (H.forEach(function(z, V) {
              U.length >= f || p(V, z, i) && U.push({ path: M.concat(V), value: z });
            }), H.forEach(function(z, V) {
              U.length >= f || h && w(z, M.concat(V));
            })) : o(H) && (this.keys(H).forEach(function(z) {
              U.length >= f || p(z, H[z], i) && U.push({ path: M.concat(z), value: H[z] });
            }), this.keys(H).forEach(function(z) {
              U.length >= f || h && w(H[z], M.concat(z));
            }));
          }).bind(this);
          return w(I, R), U;
        };
      }
      function s(h) {
        return function(n, i, p) {
          return this.descend(i, n.expression.value, h, p);
        };
      }
      function c(h) {
        return function(n, i, p) {
          return this.traverse(i, n.expression.value, h, p);
        };
      }
      function r() {
        try {
          return D.apply(this, arguments);
        } catch {
        }
      }
      function g(h) {
        return h = h.filter(function(n) {
          return n;
        }), S(
          h,
          function(n) {
            return n.path.map(function(i) {
              return String(i).replace("-", "--");
            }).join("-");
          }
        );
      }
      function b(h) {
        var n = String(h);
        return n.match(/^-?[0-9]+$/) ? parseInt(n) : null;
      }
      L.exports = E;
    }, { "..": "jsonpath", "./aesprim": "./aesprim", "./index": 5, "./slice": 7, "static-eval": 15, underscore: 12 }], 5: [function(T, L, B) {
      var v = T("assert"), y = T("./dict"), D = T("./parser"), S = T("./handlers"), E = function() {
        this.initialize.apply(this, arguments);
      };
      E.prototype.initialize = function() {
        this.parser = new D(), this.handlers = new S();
      }, E.prototype.parse = function(o) {
        return v.ok(d(o), "we need a path"), this.parser.parse(o);
      }, E.prototype.parent = function(o, m) {
        v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path");
        var s = this.nodes(o, m)[0];
        return s.path.pop(), this.value(o, s.path);
      }, E.prototype.apply = function(o, m, s) {
        v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path"), v.equal(typeof s, "function", "fn needs to be function");
        var c = this.nodes(o, m).sort(function(r, g) {
          return g.path.length - r.path.length;
        });
        return c.forEach(function(r) {
          var g = r.path.pop(), b = this.value(o, this.stringify(r.path)), h = r.value = s.call(o, b[g]);
          b[g] = h;
        }, this), c;
      }, E.prototype.value = function(o, m, s) {
        if (v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path"), arguments.length >= 3) {
          var c = this.nodes(o, m).shift();
          if (!c)
            return this._vivify(o, m, s);
          var r = c.path.slice(-1).shift(), g = this.parent(o, this.stringify(c.path));
          g[r] = s;
        }
        return this.query(o, this.stringify(m), 1).shift();
      }, E.prototype._vivify = function(o, m, s) {
        var c = this;
        v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path");
        var r = this.parser.parse(m).map(function(b) {
          return b.expression.value;
        }), g = function(b, h) {
          var n = b.pop(), i = c.value(o, b);
          i || (g(b.concat(), typeof n == "string" ? {} : []), i = c.value(o, b)), i[n] = h;
        };
        return g(r, s), this.query(o, m)[0];
      }, E.prototype.query = function(o, m, s) {
        v.ok(o instanceof Object, "obj needs to be an object"), v.ok(d(m), "we need a path");
        var c = this.nodes(o, m, s).map(function(r) {
          return r.value;
        });
        return c;
      }, E.prototype.paths = function(o, m, s) {
        v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path");
        var c = this.nodes(o, m, s).map(function(r) {
          return r.path;
        });
        return c;
      }, E.prototype.nodes = function(o, m, s) {
        if (v.ok(o instanceof Object, "obj needs to be an object"), v.ok(m, "we need a path"), s === 0)
          return [];
        var c = this.parser.parse(m), r = this.handlers, g = [{ path: ["$"], value: o }], b = [];
        return c.length && c[0].expression.type == "root" && c.shift(), c.length ? (c.forEach(function(h, n) {
          if (!(b.length >= s)) {
            var i = r.resolve(h), p = [];
            g.forEach(function(f) {
              if (!(b.length >= s)) {
                var I = i(h, f, s);
                n == c.length - 1 ? b = b.concat(I || []) : p = p.concat(I || []);
              }
            }), g = p;
          }
        }), s ? b.slice(0, s) : b) : g;
      }, E.prototype.stringify = function(o) {
        v.ok(o, "we need a path");
        var m = "$", s = {
          "descendant-member": "..{{value}}",
          "child-member": ".{{value}}",
          "descendant-subscript": "..[{{value}}]",
          "child-subscript": "[{{value}}]"
        };
        return o = this._normalize(o), o.forEach(function(c) {
          if (c.expression.type != "root") {
            var r = [c.scope, c.operation].join("-"), g = s[r], b;
            if (c.expression.type == "string_literal" ? b = JSON.stringify(c.expression.value) : b = c.expression.value, !g)
              throw new Error("couldn't find template " + r);
            m += g.replace(/{{value}}/, b);
          }
        }), m;
      }, E.prototype._normalize = function(o) {
        if (v.ok(o, "we need a path"), typeof o == "string")
          return this.parser.parse(o);
        if (Array.isArray(o) && typeof o[0] == "string") {
          var m = [{ expression: { type: "root", value: "$" } }];
          return o.forEach(function(s, c) {
            if (!(s == "$" && c === 0))
              if (typeof s == "string" && s.match("^" + y.identifier + "$"))
                m.push({
                  operation: "member",
                  scope: "child",
                  expression: { value: s, type: "identifier" }
                });
              else {
                var r = typeof s == "number" ? "numeric_literal" : "string_literal";
                m.push({
                  operation: "subscript",
                  scope: "child",
                  expression: { value: s, type: r }
                });
              }
          }), m;
        } else if (Array.isArray(o) && typeof o[0] == "object")
          return o;
        throw new Error("couldn't understand path " + o);
      };
      function d(o) {
        return Object.prototype.toString.call(o) == "[object String]";
      }
      E.Handlers = S, E.Parser = D;
      var a = new E();
      a.JSONPath = E, L.exports = a;
    }, { "./dict": 2, "./handlers": 4, "./parser": 6, assert: 8 }], 6: [function(T, L, B) {
      var v = T("./grammar"), y = T("../generated/parser"), D = function() {
        var S = new y.Parser(), E = S.parseError;
        return S.yy.parseError = function() {
          S.yy.ast && S.yy.ast.initialize(), E.apply(S, arguments);
        }, S;
      };
      D.grammar = v, L.exports = D;
    }, { "../generated/parser": 1, "./grammar": 3 }], 7: [function(T, L, B) {
      L.exports = function(y, D, S, E) {
        if (typeof D == "string")
          throw new Error("start cannot be a string");
        if (typeof S == "string")
          throw new Error("end cannot be a string");
        if (typeof E == "string")
          throw new Error("step cannot be a string");
        var d = y.length;
        if (E === 0)
          throw new Error("step cannot be zero");
        if (E = E ? v(E) : 1, D = D < 0 ? d + D : D, S = S < 0 ? d + S : S, D = v(D === 0 ? 0 : D || (E > 0 ? 0 : d - 1)), S = v(S === 0 ? 0 : S || (E > 0 ? d : -1)), D = E > 0 ? Math.max(0, D) : Math.min(d, D), S = E > 0 ? Math.min(S, d) : Math.max(-1, S), E > 0 && S <= D)
          return [];
        if (E < 0 && D <= S)
          return [];
        for (var a = [], o = D; o != S && !(E < 0 && o <= S || E > 0 && o >= S); o += E)
          a.push(y[o]);
        return a;
      };
      function v(y) {
        return String(y).match(/^[0-9]+$/) ? parseInt(y) : Number.isFinite(y) ? parseInt(y, 10) : 0;
      }
    }, {}], 8: [function(T, L, B) {
      var v = T("util/"), y = Array.prototype.slice, D = Object.prototype.hasOwnProperty, S = L.exports = m;
      S.AssertionError = function(i) {
        this.name = "AssertionError", this.actual = i.actual, this.expected = i.expected, this.operator = i.operator, i.message ? (this.message = i.message, this.generatedMessage = !1) : (this.message = a(this), this.generatedMessage = !0);
        var p = i.stackStartFunction || o;
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, p);
        else {
          var f = new Error();
          if (f.stack) {
            var I = f.stack, R = p.name, U = I.indexOf(`
` + R);
            if (U >= 0) {
              var w = I.indexOf(`
`, U + 1);
              I = I.substring(w + 1);
            }
            this.stack = I;
          }
        }
      }, v.inherits(S.AssertionError, Error);
      function E(n, i) {
        return v.isUndefined(i) ? "" + i : v.isNumber(i) && !isFinite(i) || v.isFunction(i) || v.isRegExp(i) ? i.toString() : i;
      }
      function d(n, i) {
        return v.isString(n) ? n.length < i ? n : n.slice(0, i) : n;
      }
      function a(n) {
        return d(JSON.stringify(n.actual, E), 128) + " " + n.operator + " " + d(JSON.stringify(n.expected, E), 128);
      }
      function o(n, i, p, f, I) {
        throw new S.AssertionError({
          message: p,
          actual: n,
          expected: i,
          operator: f,
          stackStartFunction: I
        });
      }
      S.fail = o;
      function m(n, i) {
        n || o(n, !0, i, "==", S.ok);
      }
      S.ok = m, S.equal = function(i, p, f) {
        i != p && o(i, p, f, "==", S.equal);
      }, S.notEqual = function(i, p, f) {
        i == p && o(i, p, f, "!=", S.notEqual);
      }, S.deepEqual = function(i, p, f) {
        s(i, p) || o(i, p, f, "deepEqual", S.deepEqual);
      };
      function s(n, i) {
        if (n === i)
          return !0;
        if (v.isBuffer(n) && v.isBuffer(i)) {
          if (n.length != i.length)
            return !1;
          for (var p = 0; p < n.length; p++)
            if (n[p] !== i[p])
              return !1;
          return !0;
        } else
          return v.isDate(n) && v.isDate(i) ? n.getTime() === i.getTime() : v.isRegExp(n) && v.isRegExp(i) ? n.source === i.source && n.global === i.global && n.multiline === i.multiline && n.lastIndex === i.lastIndex && n.ignoreCase === i.ignoreCase : !v.isObject(n) && !v.isObject(i) ? n == i : r(n, i);
      }
      function c(n) {
        return Object.prototype.toString.call(n) == "[object Arguments]";
      }
      function r(n, i) {
        if (v.isNullOrUndefined(n) || v.isNullOrUndefined(i) || n.prototype !== i.prototype)
          return !1;
        if (v.isPrimitive(n) || v.isPrimitive(i))
          return n === i;
        var p = c(n), f = c(i);
        if (p && !f || !p && f)
          return !1;
        if (p)
          return n = y.call(n), i = y.call(i), s(n, i);
        var I = h(n), R = h(i), U, w;
        if (I.length != R.length)
          return !1;
        for (I.sort(), R.sort(), w = I.length - 1; w >= 0; w--)
          if (I[w] != R[w])
            return !1;
        for (w = I.length - 1; w >= 0; w--)
          if (U = I[w], !s(n[U], i[U]))
            return !1;
        return !0;
      }
      S.notDeepEqual = function(i, p, f) {
        s(i, p) && o(i, p, f, "notDeepEqual", S.notDeepEqual);
      }, S.strictEqual = function(i, p, f) {
        i !== p && o(i, p, f, "===", S.strictEqual);
      }, S.notStrictEqual = function(i, p, f) {
        i === p && o(i, p, f, "!==", S.notStrictEqual);
      };
      function g(n, i) {
        return !n || !i ? !1 : Object.prototype.toString.call(i) == "[object RegExp]" ? i.test(n) : n instanceof i ? !0 : i.call({}, n) === !0;
      }
      function b(n, i, p, f) {
        var I;
        v.isString(p) && (f = p, p = null);
        try {
          i();
        } catch (R) {
          I = R;
        }
        if (f = (p && p.name ? " (" + p.name + ")." : ".") + (f ? " " + f : "."), n && !I && o(I, p, "Missing expected exception" + f), !n && g(I, p) && o(I, p, "Got unwanted exception" + f), n && I && p && !g(I, p) || !n && I)
          throw I;
      }
      S.throws = function(n, i, p) {
        b.apply(this, [!0].concat(y.call(arguments)));
      }, S.doesNotThrow = function(n, i) {
        b.apply(this, [!1].concat(y.call(arguments)));
      }, S.ifError = function(n) {
        if (n)
          throw n;
      };
      var h = Object.keys || function(n) {
        var i = [];
        for (var p in n)
          D.call(n, p) && i.push(p);
        return i;
      };
    }, { "util/": 11 }], 9: [function(T, L, B) {
      typeof Object.create == "function" ? L.exports = function(y, D) {
        y.super_ = D, y.prototype = Object.create(D.prototype, {
          constructor: {
            value: y,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        });
      } : L.exports = function(y, D) {
        y.super_ = D;
        var S = function() {
        };
        S.prototype = D.prototype, y.prototype = new S(), y.prototype.constructor = y;
      };
    }, {}], 10: [function(T, L, B) {
      L.exports = function(y) {
        return y && typeof y == "object" && typeof y.copy == "function" && typeof y.fill == "function" && typeof y.readUInt8 == "function";
      };
    }, {}], 11: [function(T, L, B) {
      (function(v, y) {
        var D = /%[sdj%]/g;
        B.format = function(A) {
          if (!R(A)) {
            for (var F = [], k = 0; k < arguments.length; k++)
              F.push(d(arguments[k]));
            return F.join(" ");
          }
          for (var k = 1, X = arguments, ee = X.length, $ = String(A).replace(D, function(K) {
            if (K === "%%")
              return "%";
            if (k >= ee)
              return K;
            switch (K) {
              case "%s":
                return String(X[k++]);
              case "%d":
                return Number(X[k++]);
              case "%j":
                try {
                  return JSON.stringify(X[k++]);
                } catch {
                  return "[Circular]";
                }
              default:
                return K;
            }
          }), q = X[k]; k < ee; q = X[++k])
            p(q) || !M(q) ? $ += " " + q : $ += " " + d(q);
          return $;
        }, B.deprecate = function(A, F) {
          if (w(y.process))
            return function() {
              return B.deprecate(A, F).apply(this, arguments);
            };
          if (v.noDeprecation === !0)
            return A;
          var k = !1;
          function X() {
            if (!k) {
              if (v.throwDeprecation)
                throw new Error(F);
              v.traceDeprecation ? console.trace(F) : console.error(F), k = !0;
            }
            return A.apply(this, arguments);
          }
          return X;
        };
        var S = {}, E;
        B.debuglog = function(A) {
          if (w(E) && (E = v.env.NODE_DEBUG || ""), A = A.toUpperCase(), !S[A])
            if (new RegExp("\\b" + A + "\\b", "i").test(E)) {
              var F = v.pid;
              S[A] = function() {
                var k = B.format.apply(B, arguments);
                console.error("%s %d: %s", A, F, k);
              };
            } else
              S[A] = function() {
              };
          return S[A];
        };
        function d(A, F) {
          var k = {
            seen: [],
            stylize: o
          };
          return arguments.length >= 3 && (k.depth = arguments[2]), arguments.length >= 4 && (k.colors = arguments[3]), i(F) ? k.showHidden = F : F && B._extend(k, F), w(k.showHidden) && (k.showHidden = !1), w(k.depth) && (k.depth = 2), w(k.colors) && (k.colors = !1), w(k.customInspect) && (k.customInspect = !0), k.colors && (k.stylize = a), s(k, A, k.depth);
        }
        B.inspect = d, d.colors = {
          bold: [1, 22],
          italic: [3, 23],
          underline: [4, 24],
          inverse: [7, 27],
          white: [37, 39],
          grey: [90, 39],
          black: [30, 39],
          blue: [34, 39],
          cyan: [36, 39],
          green: [32, 39],
          magenta: [35, 39],
          red: [31, 39],
          yellow: [33, 39]
        }, d.styles = {
          special: "cyan",
          number: "yellow",
          boolean: "yellow",
          undefined: "grey",
          null: "bold",
          string: "green",
          date: "magenta",
          // "name": intentionally not styling
          regexp: "red"
        };
        function a(A, F) {
          var k = d.styles[F];
          return k ? "\x1B[" + d.colors[k][0] + "m" + A + "\x1B[" + d.colors[k][1] + "m" : A;
        }
        function o(A, F) {
          return A;
        }
        function m(A) {
          var F = {};
          return A.forEach(function(k, X) {
            F[k] = !0;
          }), F;
        }
        function s(A, F, k) {
          if (A.customInspect && F && ae(F.inspect) && // Filter out the util module, it's inspect function is special
          F.inspect !== B.inspect && // Also filter out any prototype objects using the circular check.
          !(F.constructor && F.constructor.prototype === F)) {
            var X = F.inspect(k, A);
            return R(X) || (X = s(A, X, k)), X;
          }
          var ee = c(A, F);
          if (ee)
            return ee;
          var $ = Object.keys(F), q = m($);
          if (A.showHidden && ($ = Object.getOwnPropertyNames(F)), V(F) && ($.indexOf("message") >= 0 || $.indexOf("description") >= 0))
            return r(F);
          if ($.length === 0) {
            if (ae(F)) {
              var K = F.name ? ": " + F.name : "";
              return A.stylize("[Function" + K + "]", "special");
            }
            if (H(F))
              return A.stylize(RegExp.prototype.toString.call(F), "regexp");
            if (z(F))
              return A.stylize(Date.prototype.toString.call(F), "date");
            if (V(F))
              return r(F);
          }
          var Q = "", fe = !1, Ee = ["{", "}"];
          if (n(F) && (fe = !0, Ee = ["[", "]"]), ae(F)) {
            var ke = F.name ? ": " + F.name : "";
            Q = " [Function" + ke + "]";
          }
          if (H(F) && (Q = " " + RegExp.prototype.toString.call(F)), z(F) && (Q = " " + Date.prototype.toUTCString.call(F)), V(F) && (Q = " " + r(F)), $.length === 0 && (!fe || F.length == 0))
            return Ee[0] + Q + Ee[1];
          if (k < 0)
            return H(F) ? A.stylize(RegExp.prototype.toString.call(F), "regexp") : A.stylize("[Object]", "special");
          A.seen.push(F);
          var ge;
          return fe ? ge = g(A, F, k, q, $) : ge = $.map(function(Fe) {
            return b(A, F, k, q, Fe, fe);
          }), A.seen.pop(), h(ge, Q, Ee);
        }
        function c(A, F) {
          if (w(F))
            return A.stylize("undefined", "undefined");
          if (R(F)) {
            var k = "'" + JSON.stringify(F).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
            return A.stylize(k, "string");
          }
          if (I(F))
            return A.stylize("" + F, "number");
          if (i(F))
            return A.stylize("" + F, "boolean");
          if (p(F))
            return A.stylize("null", "null");
        }
        function r(A) {
          return "[" + Error.prototype.toString.call(A) + "]";
        }
        function g(A, F, k, X, ee) {
          for (var $ = [], q = 0, K = F.length; q < K; ++q)
            ve(F, String(q)) ? $.push(b(
              A,
              F,
              k,
              X,
              String(q),
              !0
            )) : $.push("");
          return ee.forEach(function(Q) {
            Q.match(/^\d+$/) || $.push(b(
              A,
              F,
              k,
              X,
              Q,
              !0
            ));
          }), $;
        }
        function b(A, F, k, X, ee, $) {
          var q, K, Q;
          if (Q = Object.getOwnPropertyDescriptor(F, ee) || { value: F[ee] }, Q.get ? Q.set ? K = A.stylize("[Getter/Setter]", "special") : K = A.stylize("[Getter]", "special") : Q.set && (K = A.stylize("[Setter]", "special")), ve(X, ee) || (q = "[" + ee + "]"), K || (A.seen.indexOf(Q.value) < 0 ? (p(k) ? K = s(A, Q.value, null) : K = s(A, Q.value, k - 1), K.indexOf(`
`) > -1 && ($ ? K = K.split(`
`).map(function(fe) {
            return "  " + fe;
          }).join(`
`).substr(2) : K = `
` + K.split(`
`).map(function(fe) {
            return "   " + fe;
          }).join(`
`))) : K = A.stylize("[Circular]", "special")), w(q)) {
            if ($ && ee.match(/^\d+$/))
              return K;
            q = JSON.stringify("" + ee), q.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (q = q.substr(1, q.length - 2), q = A.stylize(q, "name")) : (q = q.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), q = A.stylize(q, "string"));
          }
          return q + ": " + K;
        }
        function h(A, F, k) {
          var X = A.reduce(function(ee, $) {
            return $.indexOf(`
`) >= 0, ee + $.replace(/\u001b\[\d\d?m/g, "").length + 1;
          }, 0);
          return X > 60 ? k[0] + (F === "" ? "" : F + `
 `) + " " + A.join(`,
  `) + " " + k[1] : k[0] + F + " " + A.join(", ") + " " + k[1];
        }
        function n(A) {
          return Array.isArray(A);
        }
        B.isArray = n;
        function i(A) {
          return typeof A == "boolean";
        }
        B.isBoolean = i;
        function p(A) {
          return A === null;
        }
        B.isNull = p;
        function f(A) {
          return A == null;
        }
        B.isNullOrUndefined = f;
        function I(A) {
          return typeof A == "number";
        }
        B.isNumber = I;
        function R(A) {
          return typeof A == "string";
        }
        B.isString = R;
        function U(A) {
          return typeof A == "symbol";
        }
        B.isSymbol = U;
        function w(A) {
          return A === void 0;
        }
        B.isUndefined = w;
        function H(A) {
          return M(A) && J(A) === "[object RegExp]";
        }
        B.isRegExp = H;
        function M(A) {
          return typeof A == "object" && A !== null;
        }
        B.isObject = M;
        function z(A) {
          return M(A) && J(A) === "[object Date]";
        }
        B.isDate = z;
        function V(A) {
          return M(A) && (J(A) === "[object Error]" || A instanceof Error);
        }
        B.isError = V;
        function ae(A) {
          return typeof A == "function";
        }
        B.isFunction = ae;
        function Y(A) {
          return A === null || typeof A == "boolean" || typeof A == "number" || typeof A == "string" || typeof A == "symbol" || // ES6 symbol
          typeof A > "u";
        }
        B.isPrimitive = Y, B.isBuffer = T("./support/isBuffer");
        function J(A) {
          return Object.prototype.toString.call(A);
        }
        function se(A) {
          return A < 10 ? "0" + A.toString(10) : A.toString(10);
        }
        var ie = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ];
        function oe() {
          var A = /* @__PURE__ */ new Date(), F = [
            se(A.getHours()),
            se(A.getMinutes()),
            se(A.getSeconds())
          ].join(":");
          return [A.getDate(), ie[A.getMonth()], F].join(" ");
        }
        B.log = function() {
          console.log("%s - %s", oe(), B.format.apply(B, arguments));
        }, B.inherits = T("inherits"), B._extend = function(A, F) {
          if (!F || !M(F))
            return A;
          for (var k = Object.keys(F), X = k.length; X--; )
            A[k[X]] = F[k[X]];
          return A;
        };
        function ve(A, F) {
          return Object.prototype.hasOwnProperty.call(A, F);
        }
      }).call(this, T("_process"), typeof Xe < "u" ? Xe : typeof self < "u" ? self : typeof window < "u" ? window : {});
    }, { "./support/isBuffer": 10, _process: 14, inherits: 9 }], 12: [function(T, L, B) {
    }, {}], 13: [function(T, L, B) {
      (function(v) {
        function y(d, a) {
          for (var o = 0, m = d.length - 1; m >= 0; m--) {
            var s = d[m];
            s === "." ? d.splice(m, 1) : s === ".." ? (d.splice(m, 1), o++) : o && (d.splice(m, 1), o--);
          }
          if (a)
            for (; o--; o)
              d.unshift("..");
          return d;
        }
        B.resolve = function() {
          for (var d = "", a = !1, o = arguments.length - 1; o >= -1 && !a; o--) {
            var m = o >= 0 ? arguments[o] : v.cwd();
            if (typeof m != "string")
              throw new TypeError("Arguments to path.resolve must be strings");
            if (!m)
              continue;
            d = m + "/" + d, a = m.charAt(0) === "/";
          }
          return d = y(S(d.split("/"), function(s) {
            return !!s;
          }), !a).join("/"), (a ? "/" : "") + d || ".";
        }, B.normalize = function(d) {
          var a = B.isAbsolute(d), o = E(d, -1) === "/";
          return d = y(S(d.split("/"), function(m) {
            return !!m;
          }), !a).join("/"), !d && !a && (d = "."), d && o && (d += "/"), (a ? "/" : "") + d;
        }, B.isAbsolute = function(d) {
          return d.charAt(0) === "/";
        }, B.join = function() {
          var d = Array.prototype.slice.call(arguments, 0);
          return B.normalize(S(d, function(a, o) {
            if (typeof a != "string")
              throw new TypeError("Arguments to path.join must be strings");
            return a;
          }).join("/"));
        }, B.relative = function(d, a) {
          d = B.resolve(d).substr(1), a = B.resolve(a).substr(1);
          function o(h) {
            for (var n = 0; n < h.length && h[n] === ""; n++)
              ;
            for (var i = h.length - 1; i >= 0 && h[i] === ""; i--)
              ;
            return n > i ? [] : h.slice(n, i - n + 1);
          }
          for (var m = o(d.split("/")), s = o(a.split("/")), c = Math.min(m.length, s.length), r = c, g = 0; g < c; g++)
            if (m[g] !== s[g]) {
              r = g;
              break;
            }
          for (var b = [], g = r; g < m.length; g++)
            b.push("..");
          return b = b.concat(s.slice(r)), b.join("/");
        }, B.sep = "/", B.delimiter = ":", B.dirname = function(d) {
          if (typeof d != "string" && (d = d + ""), d.length === 0)
            return ".";
          for (var a = d.charCodeAt(0), o = a === 47, m = -1, s = !0, c = d.length - 1; c >= 1; --c)
            if (a = d.charCodeAt(c), a === 47) {
              if (!s) {
                m = c;
                break;
              }
            } else
              s = !1;
          return m === -1 ? o ? "/" : "." : o && m === 1 ? "/" : d.slice(0, m);
        };
        function D(d) {
          typeof d != "string" && (d = d + "");
          var a = 0, o = -1, m = !0, s;
          for (s = d.length - 1; s >= 0; --s)
            if (d.charCodeAt(s) === 47) {
              if (!m) {
                a = s + 1;
                break;
              }
            } else
              o === -1 && (m = !1, o = s + 1);
          return o === -1 ? "" : d.slice(a, o);
        }
        B.basename = function(d, a) {
          var o = D(d);
          return a && o.substr(-1 * a.length) === a && (o = o.substr(0, o.length - a.length)), o;
        }, B.extname = function(d) {
          typeof d != "string" && (d = d + "");
          for (var a = -1, o = 0, m = -1, s = !0, c = 0, r = d.length - 1; r >= 0; --r) {
            var g = d.charCodeAt(r);
            if (g === 47) {
              if (!s) {
                o = r + 1;
                break;
              }
              continue;
            }
            m === -1 && (s = !1, m = r + 1), g === 46 ? a === -1 ? a = r : c !== 1 && (c = 1) : a !== -1 && (c = -1);
          }
          return a === -1 || m === -1 || // We saw a non-dot character immediately before the dot
          c === 0 || // The (right-most) trimmed path component is exactly '..'
          c === 1 && a === m - 1 && a === o + 1 ? "" : d.slice(a, m);
        };
        function S(d, a) {
          if (d.filter)
            return d.filter(a);
          for (var o = [], m = 0; m < d.length; m++)
            a(d[m], m, d) && o.push(d[m]);
          return o;
        }
        var E = "ab".substr(-1) === "b" ? function(d, a, o) {
          return d.substr(a, o);
        } : function(d, a, o) {
          return a < 0 && (a = d.length + a), d.substr(a, o);
        };
      }).call(this, T("_process"));
    }, { _process: 14 }], 14: [function(T, L, B) {
      var v = L.exports = {}, y, D;
      function S() {
        throw new Error("setTimeout has not been defined");
      }
      function E() {
        throw new Error("clearTimeout has not been defined");
      }
      (function() {
        try {
          typeof setTimeout == "function" ? y = setTimeout : y = S;
        } catch {
          y = S;
        }
        try {
          typeof clearTimeout == "function" ? D = clearTimeout : D = E;
        } catch {
          D = E;
        }
      })();
      function d(n) {
        if (y === setTimeout)
          return setTimeout(n, 0);
        if ((y === S || !y) && setTimeout)
          return y = setTimeout, setTimeout(n, 0);
        try {
          return y(n, 0);
        } catch {
          try {
            return y.call(null, n, 0);
          } catch {
            return y.call(this, n, 0);
          }
        }
      }
      function a(n) {
        if (D === clearTimeout)
          return clearTimeout(n);
        if ((D === E || !D) && clearTimeout)
          return D = clearTimeout, clearTimeout(n);
        try {
          return D(n);
        } catch {
          try {
            return D.call(null, n);
          } catch {
            return D.call(this, n);
          }
        }
      }
      var o = [], m = !1, s, c = -1;
      function r() {
        !m || !s || (m = !1, s.length ? o = s.concat(o) : c = -1, o.length && g());
      }
      function g() {
        if (!m) {
          var n = d(r);
          m = !0;
          for (var i = o.length; i; ) {
            for (s = o, o = []; ++c < i; )
              s && s[c].run();
            c = -1, i = o.length;
          }
          s = null, m = !1, a(n);
        }
      }
      v.nextTick = function(n) {
        var i = new Array(arguments.length - 1);
        if (arguments.length > 1)
          for (var p = 1; p < arguments.length; p++)
            i[p - 1] = arguments[p];
        o.push(new b(n, i)), o.length === 1 && !m && d(g);
      };
      function b(n, i) {
        this.fun = n, this.array = i;
      }
      b.prototype.run = function() {
        this.fun.apply(null, this.array);
      }, v.title = "browser", v.browser = !0, v.env = {}, v.argv = [], v.version = "", v.versions = {};
      function h() {
      }
      v.on = h, v.addListener = h, v.once = h, v.off = h, v.removeListener = h, v.removeAllListeners = h, v.emit = h, v.prependListener = h, v.prependOnceListener = h, v.listeners = function(n) {
        return [];
      }, v.binding = function(n) {
        throw new Error("process.binding is not supported");
      }, v.cwd = function() {
        return "/";
      }, v.chdir = function(n) {
        throw new Error("process.chdir is not supported");
      }, v.umask = function() {
        return 0;
      };
    }, {}], 15: [function(T, L, B) {
      var v = T("escodegen").generate;
      L.exports = function(y, D) {
        D || (D = {});
        var S = {}, E = function d(a, o) {
          if (a.type === "Literal")
            return a.value;
          if (a.type === "UnaryExpression") {
            var m = d(a.argument);
            return a.operator === "+" ? +m : a.operator === "-" ? -m : a.operator === "~" ? ~m : a.operator === "!" ? !m : S;
          } else if (a.type === "ArrayExpression") {
            for (var s = [], c = 0, r = a.elements.length; c < r; c++) {
              var g = d(a.elements[c]);
              if (g === S)
                return S;
              s.push(g);
            }
            return s;
          } else if (a.type === "ObjectExpression") {
            for (var b = {}, c = 0; c < a.properties.length; c++) {
              var h = a.properties[c], n = h.value === null ? h.value : d(h.value);
              if (n === S)
                return S;
              b[h.key.value || h.key.name] = n;
            }
            return b;
          } else if (a.type === "BinaryExpression" || a.type === "LogicalExpression") {
            var r = d(a.left);
            if (r === S)
              return S;
            var i = d(a.right);
            if (i === S)
              return S;
            var p = a.operator;
            return p === "==" ? r == i : p === "===" ? r === i : p === "!=" ? r != i : p === "!==" ? r !== i : p === "+" ? r + i : p === "-" ? r - i : p === "*" ? r * i : p === "/" ? r / i : p === "%" ? r % i : p === "<" ? r < i : p === "<=" ? r <= i : p === ">" ? r > i : p === ">=" ? r >= i : p === "|" ? r | i : p === "&" ? r & i : p === "^" ? r ^ i : p === "&&" ? r && i : p === "||" ? r || i : S;
          } else {
            if (a.type === "Identifier")
              return {}.hasOwnProperty.call(D, a.name) ? D[a.name] : S;
            if (a.type === "ThisExpression")
              return {}.hasOwnProperty.call(D, "this") ? D.this : S;
            if (a.type === "CallExpression") {
              var f = d(a.callee);
              if (f === S || typeof f != "function")
                return S;
              var I = a.callee.object ? d(a.callee.object) : S;
              I === S && (I = null);
              for (var R = [], c = 0, r = a.arguments.length; c < r; c++) {
                var g = d(a.arguments[c]);
                if (g === S)
                  return S;
                R.push(g);
              }
              return f.apply(I, R);
            } else if (a.type === "MemberExpression") {
              var b = d(a.object);
              if (b === S || typeof b == "function")
                return S;
              if (a.property.type === "Identifier")
                return b[a.property.name];
              var h = d(a.property);
              return h === S ? S : b[h];
            } else if (a.type === "ConditionalExpression") {
              var m = d(a.test);
              return m === S ? S : d(m ? a.consequent : a.alternate);
            } else if (a.type === "ExpressionStatement") {
              var m = d(a.expression);
              return m === S ? S : m;
            } else {
              if (a.type === "ReturnStatement")
                return d(a.argument);
              if (a.type === "FunctionExpression") {
                var U = a.body.body, w = {};
                Object.keys(D).forEach(function(ie) {
                  w[ie] = D[ie];
                });
                for (var c = 0; c < a.params.length; c++) {
                  var H = a.params[c];
                  if (H.type == "Identifier")
                    D[H.name] = null;
                  else
                    return S;
                }
                for (var c in U)
                  if (d(U[c]) === S)
                    return S;
                D = w;
                var M = Object.keys(D), z = M.map(function(ie) {
                  return D[ie];
                });
                return Function(M.join(", "), "return " + v(a)).apply(null, z);
              } else if (a.type === "TemplateLiteral") {
                for (var V = "", c = 0; c < a.expressions.length; c++)
                  V += d(a.quasis[c]), V += d(a.expressions[c]);
                return V += d(a.quasis[c]), V;
              } else if (a.type === "TaggedTemplateExpression") {
                var ae = d(a.tag), Y = a.quasi, J = Y.quasis.map(d), se = Y.expressions.map(d);
                return ae.apply(null, [J].concat(se));
              } else
                return a.type === "TemplateElement" ? a.value.cooked : S;
            }
          }
        }(y);
        return E === S ? void 0 : E;
      };
    }, { escodegen: 12 }], jsonpath: [function(T, L, B) {
      L.exports = T("./lib/index");
    }, { "./lib/index": 5 }] }, {}, ["jsonpath"])("jsonpath");
  });
})(Ve);
var Pt = Ve.exports;
const Lt = /* @__PURE__ */ Nt(Pt);
function Rt(le, Ne) {
  let T;
  try {
    T = JSON.parse(Ne);
  } catch {
    return;
  }
  const L = Lt.query(T, le);
  return { filtered: JSON.stringify(L, null, 2) };
}
export {
  Rt as pluginHookResponseFilter
};
