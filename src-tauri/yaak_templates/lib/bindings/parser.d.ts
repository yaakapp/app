export type FnArg = {
    name: string;
    value: Val;
};
export type Token = {
    "type": "raw";
    text: string;
} | {
    "type": "tag";
    val: Val;
} | {
    "type": "eof";
};
export type Tokens = {
    tokens: Array<Token>;
};
export type Val = {
    "type": "str";
    text: string;
} | {
    "type": "var";
    name: string;
} | {
    "type": "bool";
    value: boolean;
} | {
    "type": "fn";
    name: string;
    args: Array<FnArg>;
} | {
    "type": "null";
};
