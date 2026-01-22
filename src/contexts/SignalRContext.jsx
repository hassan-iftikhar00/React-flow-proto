import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import * as signalR from "@microsoft/signalr";

const SignalRContext = createContext(null);

/**
 * SignalR connection status states
 */
export const ConnectionStatus = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  RECONNECTING: "Reconnecting",
};

/**
 * SignalR Provider Component
 * Manages SignalR connection lifecycle with automatic reconnection
 */
export function SignalRProvider({ children }) {
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.DISCONNECTED,
  );
  const [error, setError] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  /**
   * Initialize SignalR connection
   */
  const createConnection = useCallback(() => {
    const hubUrl =
      import.meta.env.VITE_SIGNALR_HUB_URL ||
      "https://localhost:44395/realtimeHub";

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Add auth token when backend implements JWT
        // accessTokenFactory: () => localStorage.getItem('authToken'),
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 5s, 10s, 20s, 30s, then 30s for remaining attempts
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 5000;
          if (retryContext.previousRetryCount === 3) return 10000;
          if (retryContext.previousRetryCount === 4) return 20000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection lifecycle handlers
    newConnection.onreconnecting((error) => {
      console.warn("[SignalR] Reconnecting...", error);
      setConnectionStatus(ConnectionStatus.RECONNECTING);
      setError(error);
      reconnectAttemptsRef.current += 1;
    });

    newConnection.onreconnected((connectionId) => {
      console.log("[SignalR] Reconnected successfully", connectionId);
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setError(null);
      reconnectAttemptsRef.current = 0;
    });

    newConnection.onclose((error) => {
      console.error("[SignalR] Connection closed", error);
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setError(error);

      // Attempt manual reconnection if automatic reconnection exhausted
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(
          30000,
          2000 * Math.pow(2, reconnectAttemptsRef.current),
        );
        console.log(
          `[SignalR] Attempting manual reconnection in ${delay}ms...`,
        );
        setTimeout(() => {
          startConnection();
        }, delay);
      }
    });

    return newConnection;
  }, []);

  /**
   * Start SignalR connection
   */
  const startConnection = useCallback(async () => {
    if (
      !connection ||
      connection.state === signalR.HubConnectionState.Disconnected
    ) {
      try {
        setConnectionStatus(ConnectionStatus.CONNECTING);
        const newConnection = createConnection();
        await newConnection.start();
        setConnection(newConnection);
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.log("[SignalR] Connected successfully");
      } catch (err) {
        console.error("[SignalR] Failed to connect:", err);
        setError(err);
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        reconnectAttemptsRef.current += 1;

        // Retry connection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            30000,
            2000 * Math.pow(2, reconnectAttemptsRef.current),
          );
          setTimeout(() => {
            startConnection();
          }, delay);
        }
      }
    }
  }, [connection, createConnection]);

  /**
   * Stop SignalR connection
   */
  const stopConnection = useCallback(async () => {
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      try {
        await connection.stop();
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        console.log("[SignalR] Connection stopped");
      } catch (err) {
        console.error("[SignalR] Error stopping connection:", err);
        setError(err);
      }
    }
  }, [connection]);

  /**
   * Register handler for SignalR hub method
   * @param {string} methodName - Hub method name (e.g., 'DataCreated')
   * @param {function} handler - Callback function
   */
  const on = useCallback(
    (methodName, handler) => {
      if (connection) {
        connection.on(methodName, handler);
        console.log(`[SignalR] Registered handler for '${methodName}'`);
      }
    },
    [connection],
  );

  /**
   * Unregister handler for SignalR hub method
   * @param {string} methodName - Hub method name
   */
  const off = useCallback(
    (methodName, handler) => {
      if (connection) {
        connection.off(methodName, handler);
        console.log(`[SignalR] Unregistered handler for '${methodName}'`);
      }
    },
    [connection],
  );

  /**
   * Invoke server-side hub method
   * @param {string} methodName - Hub method name
   * @param  {...any} args - Method arguments
   */
  const invoke = useCallback(
    async (methodName, ...args) => {
      if (
        connection &&
        connection.state === signalR.HubConnectionState.Connected
      ) {
        try {
          const result = await connection.invoke(methodName, ...args);
          console.log(`[SignalR] Invoked '${methodName}'`, result);
          return result;
        } catch (err) {
          console.error(`[SignalR] Error invoking '${methodName}':`, err);
          throw err;
        }
      } else {
        console.warn(`[SignalR] Cannot invoke '${methodName}': not connected`);
        throw new Error("SignalR connection not established");
      }
    },
    [connection],
  );

  // Auto-start connection on mount
  useEffect(() => {
    startConnection();

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []); // Only run once on mount

  const value = {
    connection,
    connectionStatus,
    error,
    startConnection,
    stopConnection,
    on,
    off,
    invoke,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    isConnecting: connectionStatus === ConnectionStatus.CONNECTING,
    isReconnecting: connectionStatus === ConnectionStatus.RECONNECTING,
    isDisconnected: connectionStatus === ConnectionStatus.DISCONNECTED,
  };

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
}

/**
 * Custom hook to access SignalR context
 */
export function useSignalR() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
}

export default SignalRContext;
