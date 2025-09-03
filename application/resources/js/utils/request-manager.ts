import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import ApiPaginatedData from '../types/api-paginated-data';

class ApiRequestManager {
    currentRequest: { url: string; cancelToken: CancelTokenSource } | null =
        null;

    async sendRequest<K>(
        method: 'get' | 'post' | 'patch' | 'delete',
        url: string,
        data = {},
        options: AxiosRequestConfig = {},
    ): Promise<ApiPaginatedData<K>> {
        // Cancel only if the URL is the same
        if (this.currentRequest && this.currentRequest.url === url) {
            this.currentRequest.cancelToken.cancel(
                'Request canceled by a new request to the same URL.',
            );
        }

        // Create a new CancelToken and track the current request
        const cancelTokenSource = axios.CancelToken.source();
        this.currentRequest = { url, cancelToken: cancelTokenSource };

        try {
            const config: AxiosRequestConfig = {
                method,
                url,
                data: method !== 'get' ? data : undefined,
                params: method === 'get' ? data : undefined,
                cancelToken: cancelTokenSource.token,
                ...options,
            };

            const response = await axios(config);

            return response.data;
        } catch (error: any) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error('Request failed:', error);
            }

            throw error;
        } finally {
            // Clear the current request after it completes
            if (this.currentRequest?.url === url) {
                this.currentRequest = null;
            }
        }
    }

    cancel(url?: string) {
        // Cancel only if the URL matches, or cancel all if no URL is provided
        if (this.currentRequest && (!url || this.currentRequest.url === url)) {
            this.currentRequest.cancelToken.cancel('Request canceled.');
            this.currentRequest = null;
        }
    }
}

const requestManager = new ApiRequestManager();

export default requestManager;
