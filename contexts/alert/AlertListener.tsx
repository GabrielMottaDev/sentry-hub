import { useEffect, useRef, useState } from "react";
import EventEmitter from "eventemitter3";
import Alert, { AlertConfig, applyDefaults } from "./Alert";
import { alertEmitter } from "./AlertEmitter";


export const AlertListener = () => {
    const [alertState, setAlertState] = useState<AlertConfig | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleAlert = (alert: AlertConfig) => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);

            const newAlert = applyDefaults(alert);
            setAlertState(newAlert);
            if (newAlert.timeout)
                timeoutRef.current = setTimeout(() => setAlertState(null), newAlert.timeout)
            
        };
        alertEmitter.on("alert", handleAlert);

        return () => {alertEmitter.off("alert", handleAlert)};
    }, []);

    // Only render Alert component when alertState is set
    return alertState ? <Alert config={alertState} /> : null;
};
