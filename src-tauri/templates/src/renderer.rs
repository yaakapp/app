use std::collections::HashMap;

use crate::{FnArg, Parser, Token, Val};

type TemplateCallback = fn(name: &str, args: HashMap<String, String>) -> String;

pub fn parse_and_render(
    template: &str,
    vars: &HashMap<String, String>,
    cb: Option<TemplateCallback>,
) -> String {
    let mut p = Parser::new(template);
    let tokens = p.parse();
    render(tokens, vars, cb)
}

pub fn render(
    tokens: Vec<Token>,
    vars: &HashMap<String, String>,
    cb: Option<TemplateCallback>,
) -> String {
    let mut doc_str: Vec<String> = Vec::new();

    for t in tokens {
        match t {
            Token::Raw(s) => doc_str.push(s),
            Token::Tag(val) => doc_str.push(render_tag(val, &vars, cb)),
            Token::Eof => {}
        }
    }

    return doc_str.join("");
}

fn render_tag(val: Val, vars: &HashMap<String, String>, cb: Option<TemplateCallback>) -> String {
    match val {
        Val::Str(s) => s.into(),
        Val::Var(name) => match vars.get(name.as_str()) {
            Some(v) => v.to_string(),
            None => "".into(),
        },
        Val::Fn { name, args } => {
            let empty = "".to_string();
            let resolved_args = args
                .iter()
                .map(|a| match a {
                    FnArg {
                        name,
                        value: Val::Str(s),
                    } => (name.to_string(), s.to_string()),
                    FnArg {
                        name,
                        value: Val::Var(i),
                    } => (
                        name.to_string(),
                        vars.get(i.as_str()).unwrap_or(&empty).to_string(),
                    ),
                    FnArg { name, value: val } => {
                        (name.to_string(), render_tag(val.clone(), vars, cb))
                    }
                })
                .collect::<HashMap<String, String>>();
            match cb {
                Some(cb) => cb(name.as_str(), resolved_args),
                None => "".into(),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::*;

    #[test]
    fn render_empty() {
        let template = "";
        let vars = HashMap::new();
        let result = "";
        assert_eq!(parse_and_render(template, &vars, None), result.to_string());
    }

    #[test]
    fn render_text_only() {
        let template = "Hello World!";
        let vars = HashMap::new();
        let result = "Hello World!";
        assert_eq!(parse_and_render(template, &vars, None), result.to_string());
    }

    #[test]
    fn render_simple() {
        let template = "${[ foo ]}";
        let vars = HashMap::from([("foo".to_string(), "bar".to_string())]);
        let result = "bar";
        assert_eq!(parse_and_render(template, &vars, None), result.to_string());
    }

    #[test]
    fn render_surrounded() {
        let template = "hello ${[ word ]} world!";
        let vars = HashMap::from([("word".to_string(), "cruel".to_string())]);
        let result = "hello cruel world!";
        assert_eq!(parse_and_render(template, &vars, None), result.to_string());
    }

    #[test]
    fn render_valid_fn() {
        let vars = HashMap::new();
        let template = r#"${[ say_hello(a="John", b="Kate") ]}"#;
        let result = r#"say_hello: 2, Some("John") Some("Kate")"#;

        fn cb(name: &str, args: HashMap<String, String>) -> String {
            format!("{name}: {}, {:?} {:?}", args.len(), args.get("a"), args.get("b"))
        }
        assert_eq!(parse_and_render(template, &vars, Some(cb)), result);
    }

    #[test]
    fn render_nested_fn() {
        let vars = HashMap::new();
        let template = r#"${[ upper(foo=secret()) ]}"#;
        let result = r#"ABC"#;
        fn cb(name: &str, args: HashMap<String, String>) -> String {
            match name {
                "secret" => "abc".to_string(),
                "upper" => args["foo"].to_string().to_uppercase(),
                _ => "".to_string(),
            }
        }

        assert_eq!(
            parse_and_render(template, &vars, Some(cb)),
            result.to_string()
        );
    }
}
