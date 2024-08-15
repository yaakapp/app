use crate::{FnArg, Parser, Token, Tokens, Val};
use log::warn;
use std::collections::HashMap;

type TemplateCallback = fn(name: &str, args: HashMap<String, String>) -> Result<String, String>;

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
    tokens: Tokens,
    vars: &HashMap<String, String>,
    cb: Option<TemplateCallback>,
) -> String {
    let mut doc_str: Vec<String> = Vec::new();

    for t in tokens.tokens {
        match t {
            Token::Raw { text } => doc_str.push(text),
            Token::Tag { val } => doc_str.push(render_tag(val, &vars, cb)),
            Token::Eof => {}
        }
    }

    doc_str.join("")
}

fn render_tag(val: Val, vars: &HashMap<String, String>, cb: Option<TemplateCallback>) -> String {
    match val {
        Val::Str { text } => text.into(),
        Val::Var { name } => match vars.get(name.as_str()) {
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
                        value: Val::Str { text },
                    } => (name.to_string(), text.to_string()),
                    FnArg {
                        name,
                        value: Val::Var { name: var_name },
                    } => (
                        name.to_string(),
                        vars.get(var_name.as_str()).unwrap_or(&empty).to_string(),
                    ),
                    FnArg { name, value: val } => {
                        (name.to_string(), render_tag(val.clone(), vars, cb))
                    }
                })
                .collect::<HashMap<String, String>>();
            match cb {
                Some(cb) => match cb(name.as_str(), resolved_args.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        warn!(
                            "Failed to run template callback {}({:?}): {}",
                            name, resolved_args, e
                        );
                        "".to_string()
                    }
                },
                None => "".into(),
            }
        }
        Val::Null => "".into()
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

        fn cb(name: &str, args: HashMap<String, String>) -> Result<String, String> {
            Ok(format!(
                "{name}: {}, {:?} {:?}",
                args.len(),
                args.get("a"),
                args.get("b")
            ))
        }
        assert_eq!(parse_and_render(template, &vars, Some(cb)), result);
    }

    #[test]
    fn render_nested_fn() {
        let vars = HashMap::new();
        let template = r#"${[ upper(foo=secret()) ]}"#;
        let result = r#"ABC"#;
        fn cb(name: &str, args: HashMap<String, String>) -> Result<String, String> {
            Ok(match name {
                "secret" => "abc".to_string(),
                "upper" => args["foo"].to_string().to_uppercase(),
                _ => "".to_string(),
            })
        }

        assert_eq!(
            parse_and_render(template, &vars, Some(cb)),
            result.to_string()
        );
    }

    #[test]
    fn render_fn_err() {
        let vars = HashMap::new();
        let template = r#"${[ error() ]}"#;
        let result = r#""#;
        fn cb(_name: &str, _args: HashMap<String, String>) -> Result<String, String> {
            Err("Failed to do it!".to_string())
        }

        assert_eq!(
            parse_and_render(template, &vars, Some(cb)),
            result.to_string()
        );
    }
}
