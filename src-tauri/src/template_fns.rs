use chrono::{DateTime, Utc};
use std::collections::HashMap;

pub fn timestamp(args: HashMap<String, String>) -> Result<String, String> {
    let from = args.get("from").map(|v| v.as_str()).unwrap_or("now");
    let format = args.get("format").map(|v| v.as_str()).unwrap_or("rfc3339");

    let dt = match from {
        "now" => {
            let now = Utc::now();
            now
        }
        _ => {
            let json_from = serde_json::to_string(from).unwrap_or_default();
            let now: DateTime<Utc> = match serde_json::from_str(json_from.as_str()) {
                Ok(r) => r,
                Err(e) => return Err(e.to_string()),
            };
            now
        }
    };

    let result = match format {
        "rfc3339" => dt.to_rfc3339(),
        "unix" => dt.timestamp().to_string(),
        "unix_millis" => dt.timestamp_millis().to_string(),
        _ => "".to_string(),
    };

    Ok(result)
}

// Test it
#[cfg(test)]
mod tests {
    use crate::template_fns::timestamp;
    use std::collections::HashMap;

    #[test]
    fn timestamp_empty() {
        let args = HashMap::new();
        assert_ne!(timestamp(args), Ok("".to_string()));
    }

    #[test]
    fn timestamp_from() {
        let mut args = HashMap::new();
        args.insert("from".to_string(), "2024-07-31T14:16:41.983Z".to_string());
        assert_eq!(
            timestamp(args),
            Ok("2024-07-31T14:16:41.983+00:00".to_string())
        );
    }

    #[test]
    fn timestamp_format_unix() {
        let mut args = HashMap::new();
        args.insert("from".to_string(), "2024-07-31T14:16:41.983Z".to_string());
        args.insert("format".to_string(), "unix".to_string());
        assert_eq!(timestamp(args), Ok("1722435401".to_string()));
    }

    #[test]
    fn timestamp_format_unix_millis() {
        let mut args = HashMap::new();
        args.insert("from".to_string(), "2024-07-31T14:16:41.983Z".to_string());
        args.insert("format".to_string(), "unix_millis".to_string());
        assert_eq!(timestamp(args), Ok("1722435401983".to_string()));
    }
}
