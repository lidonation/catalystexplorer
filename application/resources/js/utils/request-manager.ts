import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import ApiPaginatedData from '../../types/api-paginated-data';

class ApiRequestManager {
    currentCancelToken: CancelTokenSource | null = null;

    async sendRequest<K>(
        method: 'get' | 'post' | 'patch' | 'delete',
        url: string,
        data = {},
        options: AxiosRequestConfig = {}
    ): Promise<ApiPaginatedData<K>> {
        if (this.currentCancelToken) {
            this.currentCancelToken.cancel('Request canceled by new request.');
        }

        this.currentCancelToken = axios.CancelToken.source();

        try {
            const config: AxiosRequestConfig = {
                method,
                url,
                data: method !== 'get' ? data : undefined,
                params: method === 'get' ? data : undefined,
                cancelToken: this.currentCancelToken.token,
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
            this.currentCancelToken = null;
        }
    }

    cancel() {
        if (this.currentCancelToken) {
            this.currentCancelToken.cancel('Request canceled.');
            this.currentCancelToken = null;
        }
    }
}

const requestManager = new ApiRequestManager();

export default requestManager;