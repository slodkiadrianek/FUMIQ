export interface RedisCacheService {
    set(key: string, value: string, ttl?: number): Promise<void>;
  
    get(key: string): Promise<string | null>;
  
    del(key: string): Promise<void>;
  
    exists(key: string): Promise<boolean>;
}
   
export interface emailSend {
    to:string
    subject:string
    message:string
}