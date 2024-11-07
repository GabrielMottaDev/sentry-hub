// contexts/alert/AlertEmitter.ts
import EventEmitter from "eventemitter3";
import { AlertConfig } from "./Alert";

// Export a shared alert emitter instance
export const alertEmitter = new EventEmitter();
