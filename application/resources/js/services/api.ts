import { router } from "@inertiajs/react";
import axios from "axios";

export default async function callApi(
    params: {
        search?: string,
        ids?: number[],
    },
    context?: string,
    cancelToken?: AbortSignal,
): Promise<axios.AxiosResponse<any, any> | null> {
    try {
        return await axios.get(route(`api.${context}`, params));
        router.get('/users', params, {
            onCancelToken: (cancelToken) => (this.cancelToken = cancelToken),
        })
    } catch (error) {
        console.log(error);
        return null;
    }

}