type EventCallback<T = any> = (data?: T) => void;

// Define event types for better type safety
export interface ErrorEventData {
    errors: string[];
    errorBags?: {
        default?: {
            [key: string]: string | string[];
        };
    };
}

export interface EventMap {
    'errors:show': ErrorEventData;
    'errors:cleared': void;
    'toast:success': string;
    'toast:error': string;
    'toast:warning': string;
    'toast:info': string;
    [key: string]: any; 
}

class EventBus {
    private events: Record<string, EventCallback[]> = {};

    on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void;
    on<T = any>(event: string, callback: EventCallback<T>): void;
    on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void;
    off<T = any>(event: string, callback: EventCallback<T>): void;
    off<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter((fn) => fn !== callback);
    }

    emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void;
    emit<T = any>(event: string, data?: T): void;
    emit<T = any>(event: string, data?: T): void {
        if (!this.events[event]) return;
        this.events[event].forEach((fn) => fn(data));
    }

    emitSuccess(message: string): void {
        this.emit('toast:success', message);
    }

    emitError(message: string): void {
        this.emit('toast:error', message);
    }

    emitWarning(message: string): void {
        this.emit('toast:warning', message);
    }

    emitInfo(message: string): void {
        this.emit('toast:info', message);
    }
}

export default new EventBus();
