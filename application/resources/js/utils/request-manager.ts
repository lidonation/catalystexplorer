import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';

class ApiRequestManager {
    currentCancelToken: CancelTokenSource | null = null;

    async sendRequest(
        method: 'get' | 'post' | 'patch' | 'delete',
        url: string,
        data = {},
        options: AxiosRequestConfig = {}
    ) {
        // Cancel the previous request if it exists
        if (this.currentCancelToken) {
            this.currentCancelToken.cancel('Request canceled by new request.');
        }

        // Create a new cancel token for the current request
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
                throw error; 
            }
        } finally {
            this.currentCancelToken = null; // Reset the cancel token
        }
    }

    cancel() {
        if (this.currentCancelToken) {
            this.currentCancelToken.cancel('Request canceled manually.');
            this.currentCancelToken = null;
        }
    }
}

const requestManager = new ApiRequestManager();

export default requestManager;