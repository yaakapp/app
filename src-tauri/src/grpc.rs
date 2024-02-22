use std::collections::HashMap;

use KeyAndValueRef::{Ascii, Binary};

use grpc::{KeyAndValueRef, MetadataMap};

pub fn metadata_to_map(metadata: MetadataMap) -> HashMap<String, String> {
    let mut entries = HashMap::new();
    for r in metadata.iter() {
        match r {
            Ascii(k, v) => entries.insert(k.to_string(), v.to_str().unwrap().to_string()),
            Binary(k, v) => entries.insert(k.to_string(), format!("{:?}", v)),
        };
    }
    entries
}
