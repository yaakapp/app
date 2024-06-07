use crate::{Parser, Token};
use std::collections::HashMap;

pub fn parse_and_render(template: &str, vars: HashMap<&str, &str>) -> String {
    let mut p = Parser::new(template);
    let tokens = p.parse();
    render(tokens, vars)
}

pub fn render(tokens: Vec<Token>, vars: HashMap<&str, &str>) -> String {
    let mut doc_str: Vec<String> = Vec::new();

    for t in tokens {
        match t {
            Token::Raw(s) => doc_str.push(s),
            Token::Var { name } => {
                if let Some(v) = vars.get(name.as_str()) {
                    doc_str.push(v.to_string());
                }
            },
            Token::Fn { .. } => {}
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
        assert_eq!(parse_and_render(template, vars), result.to_string());
    }

    #[test]
    fn render_text_only() {
        let template = "Hello World!";
        let vars = HashMap::new();
        let result = "Hello World!";
        assert_eq!(parse_and_render(template, vars), result.to_string());
    }

    #[test]
    fn render_simple() {
        let template = "${[ foo ]}";
        let vars = HashMap::from([("foo", "bar")]);
        let result = "bar";
        assert_eq!(parse_and_render(template, vars), result.to_string());
    }

    #[test]
    fn render_surrounded() {
        let template = "hello ${[ word ]} world!";
        let vars = HashMap::from([("word", "cruel")]);
        let result = "hello cruel world!";
        assert_eq!(parse_and_render(template, vars), result.to_string());
    }
}
