export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type OneOrMany<T> = T[] | T;
