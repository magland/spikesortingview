export declare type ValidateObjectSpec = {
    [key: string]: ValidateObjectSpec | (Function & ((a: any) => any));
};
export declare type JSONPrimitive = string | number | boolean | null;
export declare type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export declare type JSONObject = {
    [member: string]: JSONValue;
};
export interface JSONArray extends Array<JSONValue> {
}
export declare const isString: (x: any) => x is string;
export declare const isFunction: (x: any) => x is Function;
export declare const isNumber: (x: any) => x is number;
export declare const isNull: (x: any) => x is null;
export declare const isBoolean: (x: any) => x is boolean;
export declare const isOneOf: (testFunctions: Function[]) => (x: any) => boolean;
export declare const optional: (testFunctionOrSpec: Function | ValidateObjectSpec) => (x: any) => boolean;
export declare const isEqualTo: (value: any) => (x: any) => boolean;
export declare const isArrayOf: (testFunction: (x: any) => boolean) => (x: any) => boolean;
export declare const isObject: (x: any) => x is Object;
export declare const isObjectOf: (keyTestFunction: (x: any) => boolean, valueTestFunction: (x: any) => boolean) => (x: any) => boolean;
export declare const isJSONObject: (x: any) => x is JSONObject;
export declare const isJSONValue: (x: any) => x is JSONValue;
export declare const tryParseJsonObject: (x: string) => JSONObject | null;
export declare const isJSONSerializable: (obj: any) => boolean;
declare const validateObject: (x: any, spec: ValidateObjectSpec, opts?: {
    callback?: ((x: string) => any) | undefined;
    allowAdditionalFields?: boolean | undefined;
} | undefined) => boolean;
export default validateObject;
