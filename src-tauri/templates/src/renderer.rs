use crate::{Parser, Token, Val};
use std::collections::HashMap;

type TemplateCallback = fn(name: &str, args: Vec<&str>) -> String;

pub fn parse_and_render(
    template: &str,
    vars: HashMap<&str, &str>,
    cb: Option<TemplateCallback>,
) -> String {
    let mut p = Parser::new(template);
    let tokens = p.parse();
    render(tokens, vars, cb)
}

pub fn render(
    tokens: Vec<Token>,
    vars: HashMap<&str, &str>,
    cb: Option<TemplateCallback>,
) -> String {
    let mut doc_str: Vec<String> = Vec::new();

    for t in tokens {
        match t {
            Token::Raw(s) => doc_str.push(s),
            Token::Var { name } => {
                if let Some(v) = vars.get(name.as_str()) {
                    doc_str.push(v.to_string());
                }
            }
            Token::Fn { name, args } => {
                let empty = &"";
                let resolved_args = args
                    .iter()
                    .map(|a| match a {
                        Val::Str(s) => s.as_str(),
                        Val::Ident(i) => vars.get(i.as_str()).unwrap_or(empty),
                    })
                    .collect();
                let val = match cb {
                    Some(cb) => cb(name.as_str(), resolved_args),
                    None => "".into(),
                };
                doc_str.push(val);
            }
            Token::Eof => {}
        }
    }

    return doc_str.join("");
}

#[cfg(test)]
mod tests {
    use crate::*;
    use std::collections::HashMap;

    #[test]
    fn render_empty() {
        let template = "";
        let vars = HashMap::new();
        let result = "";
        assert_eq!(parse_and_render(template, vars, None), result.to_string());
    }

    #[test]
    fn render_text_only() {
        let template = "Hello World!";
        let vars = HashMap::new();
        let result = "Hello World!";
        assert_eq!(parse_and_render(template, vars, None), result.to_string());
    }

    #[test]
    fn render_simple() {
        let template = "${[ foo ]}";
        let vars = HashMap::from([("foo", "bar")]);
        let result = "bar";
        assert_eq!(parse_and_render(template, vars, None), result.to_string());
    }

    #[test]
    fn render_surrounded() {
        let template = "hello ${[ word ]} world!";
        let vars = HashMap::from([("word", "cruel")]);
        let result = "hello cruel world!";
        assert_eq!(parse_and_render(template, vars, None), result.to_string());
    }

    #[test]
    fn render_valid_fn() {
        let vars = HashMap::new();
        let template = r#"${[ say_hello("John", "Kate") ]}"#;
        let result = r#"say_hello: ["John", "Kate"]"#;
        let cb: fn(&str, Vec<&str>) -> String =
            |name: &str, args: Vec<&str>| format!("{name}: {:?}", args);
        assert_eq!(
            parse_and_render(template, vars, Some(cb)),
            result.to_string()
        );
    }
}
