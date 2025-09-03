export default interface ApiPaginatedData<T> {
    data: T[];
    links: {};
    meta: {};
}
