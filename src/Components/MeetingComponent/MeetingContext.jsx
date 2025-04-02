// MeetingContext.js - Create this new file
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import DailyIframe from "@daily-co/daily-js";

const MeetingContext = createContext();

export function MeetingProvider({ children }) {
  const [activeMeetingUrl, setActiveMeetingUrl] = useState("");
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);

  const startMeeting = (url) => {
    setActiveMeetingUrl(url);
    setIsMeetingActive(true);
    setIsMeetingMinimized(false);
  };

  const endMeeting = () => {
    if (callFrameRef.current) {
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }
    setActiveMeetingUrl("");
    setIsMeetingActive(false);
    setIsMeetingMinimized(false);
  };

  const minimizeMeeting = () => {
    setIsMeetingMinimized(true);
  };

  const maximizeMeeting = () => {
    setIsMeetingMinimized(false);
  };

  const joinMeeting = (containerElement) => {
    if (!containerElement || !activeMeetingUrl) return;

    // Store the container reference
    containerRef.current = containerElement;

    // Only create a new call frame if one doesn't exist
    if (!callFrameRef.current) {
      callFrameRef.current = DailyIframe.createFrame(containerElement, {
        url: activeMeetingUrl,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
        },
      });

      callFrameRef.current.join({ url: activeMeetingUrl });
    } else if (containerRef.current !== containerElement) {
      // If we have a call frame but it's attached to a different container,
      // we need to move it to the new container
      callFrameRef.current.destroy();
      callFrameRef.current = DailyIframe.createFrame(containerElement, {
        url: activeMeetingUrl,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
        },
      });

      callFrameRef.current.join({ url: activeMeetingUrl });
    }
  };

  const value = {
    activeMeetingUrl,
    isMeetingActive,
    isMeetingMinimized,
    startMeeting,
    endMeeting,
    minimizeMeeting,
    maximizeMeeting,
    joinMeeting,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
}
