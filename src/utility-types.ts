export type AtLeastOne<T> = { [Key in keyof T]: Pick<T, Key> }[keyof T];
