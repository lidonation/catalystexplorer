type EventCallback<T = any> = (data?: T) => void;

class EventBus {
    private events: Record<string, EventCallback[]> = {};

    on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(fn => fn !== callback);
    }

    emit<T = any>(event: string, data?: T): void {        
        if (!this.events[event]) return;
        this.events[event].forEach(fn => fn(data));
    }
}

export default new EventBus();