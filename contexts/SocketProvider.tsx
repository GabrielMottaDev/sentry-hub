import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
  memo,
} from "react";
import { useSession } from "./SessionProvider";
import { io, Socket } from "socket.io-client";
import Env from "@/constants/Env";
import { create } from "zustand";

function createEnum<T extends string>(...values: T[]) {
  return values.reduce((acc, curr) => {
    acc[curr] = curr;
    return acc;
  }, {} as Record<T, T>);
}

export type Player = {
  uuid: string;
};

// Base type for all punishments
export type Punishment = {
  player: Player;
  motive: string;
};
export type Jail = {
  player: Player;
};
export type Ban = Punishment & {};
export type Mute = Punishment & {};

const EventMap = {
  jail: {} as Jail,
  ban: {} as Ban,
  mute: {} as Mute,
};

// const EventsEnum = createEnum(
//     'ban',
//     'mute'
// );
type RawSocketEvents = "connect" | "connect_error" | "disconnect";
type SocketEvents = keyof typeof EventMap;
const getSocketEvents = () => {
  const socketEventKeys = Object.keys(EventMap) as SocketEvents[];
  const rawSocketEvents: RawSocketEvents[] = ["connect", "connect_error", "disconnect"];
  return [...socketEventKeys, ...rawSocketEvents] as Array<SocketEvents | RawSocketEvents>;
};

type EventData<E extends SocketEvents> = (typeof EventMap)[E];

type SocketContextType = {
  socket: Socket | null; // Socket.IO client, usually dont use it directly
  setSocket: (socket: Socket | null) => void; // Set the socket instance
  connected: boolean;
  onConnect: (callback: () => void) => void;
  onConnectError: (callback: (error: Error) => void) => void;
  emit: <E extends (SocketEvents|RawSocketEvents)>(event: E, data: E extends SocketEvents ? EventData<E> : any) => void; // Emit a message to the server
  handle: <E extends SocketEvents|RawSocketEvents>(
    event: E,
    callback: (data: E extends SocketEvents ? EventData<E> : any) => void
  ) => { unhandle: () => void }; // Handle a message from the server
  unhandle: <E extends SocketEvents>(
    event: E,
    callback: (data: E extends SocketEvents ? EventData<E> : any) => void
  ) => void; // Handle a message from the server
};

// enum SocketEventsEnum {
//     BAN = 'ban',
//     MUTE = 'mute'
// }
// type SocketEvents = `${SocketEventsEnum}`; // 'ban' | 'mute'
// const getSocketEvents = () => Object.values(SocketEventsEnum) as SocketEvents[]; // ['ban', 'mute']

// ===
// type SocketContextType = {
// socket: Socket | null; // Socket.IO client, usually dont use it directly
// emit: (event: SocketEvents, data: any) => void; // Emit a message to the server
// handle: (event: SocketEvents, callback: (data: any) => void) => void; // Handle a message from the server
// };

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = memo(({ children }: PropsWithChildren) => {
  console.log("SOCKET PROVIDER RENDER");

  const onConnectCallback = useRef<(() => void) | null>(null);
  const onConnectErrorCallback = useRef<((error: Error) => void) | null>(null);
  const { sessionId, hasLogin, setSessionId } = useSession();

  const callbacks = useRef(new Map<SocketEvents|RawSocketEvents, Array<(data: any) => void>>());
  function addCallback(event: SocketEvents|RawSocketEvents, callback: (data: any) => void) {
    if (!callbacks.current.has(event)) {
      callbacks.current.set(event, []);
    }
    
    callbacks.current.get(event)?.push(callback);
  }
  function removeCallback(event: SocketEvents|RawSocketEvents, callback: (data: any) => void) {
    const eventCallbacks = callbacks.current.get(event);
    if (eventCallbacks) {
      callbacks.current.set(
        event,
        eventCallbacks.filter((cb) => cb !== callback)
      );
    }
  }
  function getCallbacks(event: SocketEvents|RawSocketEvents): Array<(data: any) => void> {
    return callbacks.current.get(event) || [];
  }

  // const { socket, setSocket } = useSocketConnection();
  //   var socket: Socket | null = null;
  //   var setSocket = (socket2: Socket | null) => {
  //     socket = socket2;
  //   };
  var socketInstance = new SocketClass();

  const isSocketConnected = () => {
    return socketInstance.getSocket()?.connected || false;
  };

  const setSocket = (socket: Socket | null) => {
    socketInstance.setSocket(socket);
    startSocket();
  };

  const startSocket = async () => {
    // Stop any previous socket connection
    stopSocket();
    // socketInstance.setSocket(
    //   io(`${Env.API_URL}`, {
    //     auth: {
    //       api_key: `${Env.API_KEY}`,
    //       session_id: `${sessionId}`,
    //     },
    //     // transports: ['websocket'],  // Certifique-se de forçar o uso do WebSocket se necessário
    //     secure: Env.API_URL?.includes("https"),
    //     reconnection: true,
    //     timeout: 3000,
    //   })
    // );
    console.log("SOCKET", socketInstance.getSocket());

    // Register all socket events from SocketEventsEnum
    console.log("LIST OF CALLBACKS", callbacks);
    getSocketEvents().forEach((socketEvent) => {
      console.log("SOCKET EVENT LIST", socketEvent);
      if(socketEvent == 'connect' && socketInstance.getSocket()?.connected) {
        console.log("ALREADY CONNECTED2");
        getCallbacks(socketEvent).forEach((callback) => {
          console.log("CALLBACK2", socketEvent);
          callback({});
        });
      }

      // Listen to socket events
      socketInstance.getSocket()?.on(socketEvent, (data: any) => {
        console.log("SOCKET EVENT", socketEvent);
        // Call all callbacks for this event
        getCallbacks(socketEvent).forEach((callback) => {
          console.log("CALLBACK", socketEvent);
          callback(data);
        });
      });
    });

    // Authenticated event, fires first
    socketInstance.getSocket()?.on("authenticated", (data) => {
      console.log("[Socket] Authenticated:", data);
    });

    // Connect event, fires after authenticated
    socketInstance.getSocket()?.on("connect", () => {
      console.log("[Socket] Connected to Socket.IO server");
      onConnectCallback.current?.();
    });

    socketInstance.getSocket()?.on("message", (message) => {
      console.log("[Socket] Received message:", message);
    });

    socketInstance.getSocket()?.on("ban", (message) => {
      console.log("[Socket] Received ban:", message);
    });

    socketInstance.getSocket()?.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected from server:", reason);
    });

    socketInstance.getSocket()?.on("connect_error", (error) => {
      console.log("[Socket] [Connection error:", error);
      onConnectErrorCallback.current?.(error);
    });
  };

  const stopSocket = async () => {
    if (socketInstance.getSocket()) {
      socketInstance.getSocket()?.removeAllListeners();
      if (socketInstance.getSocket()?.connected) {
        socketInstance.getSocket()?.disconnect();
      }
      //   socket = null;
    //   socketInstance.setSocket(null);
    }
  };

  const emit = <E extends SocketEvents|RawSocketEvents>(event: E, data: EventData<E|any>) => {
    if (socketInstance.getSocket()) {
      socketInstance.getSocket()?.emit(event, data);
    }
  };

  const handle = (event: SocketEvents|RawSocketEvents, callback: (data: any) => void) => {
    console.log("HANDLE", event);
    addCallback(event, callback);
    socketInstance.getSocket()?.on(event, callback);

    if(event == 'connect' && socketInstance.getSocket()?.connected) {
      console.log("ALREADY CONNECTED");
      callback({});
    }
    
    return {
      unhandle: () => {
        unhandle(event, callback);
      },
    };
  };

  const unhandle = (event: SocketEvents|RawSocketEvents, callback: (data: any) => void) => {
    removeCallback(event, callback);
    socketInstance.getSocket()?.off(event, callback);
  };

  // useEffect(() => {
  //   if (hasLogin) {
  //     // Start socket when user logs in
  //     startSocket();
  //   } else {
  //     // Stop socket when user logs out
  //     stopSocket();
  //   }

  //   return () => {
  //     stopSocket();
  //   };
  // }, [hasLogin]);

  const onConnect = (callback: () => void) => {
    // setOnConnectCallback(callback);
    onConnectCallback.current = callback;
  };

  const onConnectError = (callback: (error: Error) => void) => {
    // setOnConnectCallback(callback);
    onConnectErrorCallback.current = callback;
  };

  return (
    <SocketContext.Provider
      value={{
        connected: isSocketConnected(),
        onConnect,
        onConnectError,
        socket: null,
        setSocket,
        emit,
        handle,
        unhandle,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("[Socket] useSocket must be used within a SocketProvider");
  return context;
};

type SocketConnectionState = {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
};

export const useSocketConnection = create<SocketConnectionState>((set) => ({
  socket: null,
  setSocket: (socket: Socket | null) => set({ socket }),
}));

export class SocketClass {
  static instance: SocketClass | null = null;
  socket: Socket | null = null;
  constructor() {
    if (SocketClass.instance) {
      return SocketClass.instance;
    }
    SocketClass.instance = this;
  }
  setSocket(socket: Socket | null) {
    this.socket = socket;
  }
  getSocket() {
    return this.socket;
  }
}
