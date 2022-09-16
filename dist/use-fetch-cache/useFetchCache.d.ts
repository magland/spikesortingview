export declare type FetchCache<QueryType, ReturnType> = {
    get: (query: QueryType) => ReturnType | undefined;
};
declare const useFetchCache: <QueryType extends {} | null, ReturnType_1>(fetchFunction: (query: QueryType) => Promise<any>) => FetchCache<QueryType, ReturnType_1>;
export default useFetchCache;
