declare module 'react-native-event-source' {
    export default class EventSource {
        constructor(url: string, options?: any);
        addEventListener(event: string, callback: (event: any) => void): void;
        removeEventListener(event: string, callback: (event: any) => void): void;
        close(): void;
    }
} 