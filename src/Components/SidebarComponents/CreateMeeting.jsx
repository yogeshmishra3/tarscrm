"use client";

import { useState, useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";
import {
  FaCopy,
  FaVideo,
  FaPhone,
  FaLink,
  FaTrash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaUserMinus,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const VideoCall = () => {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [meetingCode, setMeetingCode] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [userName, setUserName] = useState("");
  const [previousRooms, setPreviousRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const API_KEY =
    "e3742e1e016bc7e9eb78aa625e25af1687135a9f9235c7bde92e86303d74fe2b";

  // Fetch previous rooms
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rooms");
      }

      setPreviousRooms(data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert(error.message || "Failed to fetch rooms");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Delete a room
  const deleteRoom = async (roomName) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(
        `https://api.daily.co/v1/rooms/${roomName}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete room");
      }

      // Refresh the room list
      await fetchRooms();
      alert("Room deleted successfully");
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error.message || "Failed to delete room");
    }
  };

  const createRoom = async () => {
    try {
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          name: `meet-${Math.random().toString(36).substring(2, 8)}`,
          privacy: "public",
          properties: {
            enable_chat: true,
            enable_knocking: true,
            start_video_off: false,
            start_audio_off: false,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      if (data?.url) {
        setRoomUrl(data.url);
        setIsMeetingStarted(true);
        setIsHost(true); // Creator is the host
        // Refresh the room list after creating a new one
        await fetchRooms();
      } else {
        throw new Error("Room URL not found in response");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert(error.message || "Failed to create room");
    }
  };

  const joinMeeting = () => {
    if (!meetingCode.trim()) {
      alert("Please enter a meeting code");
      return;
    }
    setRoomUrl(`https://yourdomain.daily.co/${meetingCode}`);
    setIsMeetingStarted(true);
    setIsHost(false); // Joiner is not host by default
  };

  const updateParticipants = () => {
    if (!callFrameRef.current) return;

    const participantsState = callFrameRef.current.participants();
    const participantsList = Object.values(participantsState).map((p) => ({
      id: p.user_id,
      userName: p.user_name,
      audio: p.audio,
      video: p.video,
      local: p.local,
      owner: p.owner, // Host status
    }));

    setParticipants(participantsList);

    // Check if current user is host
    const localParticipant = participantsList.find((p) => p.local);
    if (localParticipant?.owner) {
      setIsHost(true);
    }
  };

  const removeParticipant = (participantId) => {
    if (!isHost) return;
    callFrameRef.current?.removeParticipant(participantId);
  };

  const toggleParticipantAudio = (participantId, isAudioOn) => {
    if (!isHost) return;
    callFrameRef.current?.updateParticipant(participantId, {
      setAudio: !isAudioOn,
    });
  };

  useEffect(() => {
    if (isMeetingStarted && roomUrl && containerRef.current) {
      if (!callFrameRef.current) {
        callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
          url: roomUrl,
          iframeStyle: {
            width: "100%",
            height: "100%",
            border: "none",
          },
        });

        callFrameRef.current
          .join({
            url: roomUrl,
            userName: userName || "Guest",
          })
          .then(() => {
            // Set up event listeners after joining
            callFrameRef.current.on("participant-joined", updateParticipants);
            callFrameRef.current.on("participant-updated", updateParticipants);
            callFrameRef.current.on("participant-left", updateParticipants);

            // Initial participants update
            updateParticipants();
          })
          .catch((err) => {
            console.error("Failed to join meeting:", err);
            alert("Failed to join meeting. Please check the meeting code.");
            leaveMeeting();
          });
      }
    }

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave().then(() => {
          callFrameRef.current.destroy();
          callFrameRef.current = null;
        });
      }
    };
  }, [isMeetingStarted, roomUrl, userName]);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const leaveMeeting = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave().then(() => {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      });
    }
    setIsMeetingStarted(false);
    setIsHost(false);
    setParticipants([]);
    setRoomUrl("");
    setMeetingCode("");
  };

  const copyToClipboard = () => {
    if (!roomUrl) {
      alert("No meeting link available");
      return;
    }
    navigator.clipboard
      .writeText(roomUrl)
      .then(() => alert("Meeting link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isMeetingStarted) return;
      if (meetingCode) joinMeeting();
      else createRoom();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {!isMeetingStarted ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaVideo className="text-blue-500 text-2xl" />
            </div>
          </div>

          <h1 className="text-2xl font-medium text-center mb-6">
            Start or join a meeting
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting code or link
              </label>
              <input
                type="text"
                placeholder="Enter code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={joinMeeting}
                disabled={!meetingCode}
                className={`flex-1 py-3 px-4 rounded-md font-medium ${
                  meetingCode
                    ? "bg-blue-800 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Join
              </button>
              <button
                onClick={createRoom}
                className="flex-1 py-3 px-4 bg-transparent border border-gray-300 rounded-md font-medium hover:bg-gray-100"
              >
                New Meeting
              </button>
            </div>

            {/* Previous Rooms Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-gray-700">Previous Rooms</h2>
                <button
                  onClick={fetchRooms}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoadingRooms}
                >
                  {isLoadingRooms ? "Loading..." : "Refresh"}
                </button>
              </div>

              {previousRooms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  {isLoadingRooms
                    ? "Loading rooms..."
                    : "No previous rooms found"}
                </p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {previousRooms.map((room) => (
                    <li
                      key={room.name}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {room.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Created: {new Date(room.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteRoom(room.name)}
                          className="text-xs bg-red-100 text-red-600 p-1 rounded hover:bg-red-200"
                          title="Delete room"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col bg-gray-900">
          {/* Meeting Header */}
          <div className="flex justify-between items-center p-3 bg-white">
            <div className="flex items-center">
              <FaVideo className="text-blue-500 mr-2" />
              <span className="font-medium">{roomUrl.split("/").pop()}</span>
              {isHost && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Host
                </span>
              )}
            </div>
            <button
              onClick={leaveMeeting}
              className="text-red-500 flex items-center p-2 rounded-full hover:bg-red-50"
            >
              <IoMdClose className="text-xl" />
            </button>
          </div>

          {/* Video Container */}
          <div className="flex-1" ref={containerRef}></div>

          {/* Participants List (for host) */}
          {isHost && participants.length > 1 && (
            <div className="bg-gray-800 p-4 max-h-40 overflow-y-auto">
              <h3 className="text-white font-medium mb-2">
                Participants ({participants.length})
              </h3>
              <ul className="space-y-2">
                {participants
                  .filter((p) => !p.local) // Don't show local participant in controls
                  .map((participant) => (
                    <li
                      key={participant.id}
                      className="flex justify-between items-center bg-gray-700 p-2 rounded"
                    >
                      <span className="text-white text-sm truncate">
                        {participant.userName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            toggleParticipantAudio(
                              participant.id,
                              participant.audio
                            )
                          }
                          className="p-1 bg-gray-600 rounded text-white hover:bg-gray-500"
                          title={
                            participant.audio
                              ? "Mute participant"
                              : "Unmute participant"
                          }
                        >
                          {participant.audio ? (
                            <FaMicrophone size={14} />
                          ) : (
                            <FaMicrophoneSlash size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-1 bg-red-600 rounded text-white hover:bg-red-500"
                          title="Remove participant"
                        >
                          <FaUserMinus size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-800 p-4 flex justify-center items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={leaveMeeting}
                className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 rotate-90"
                title="Leave call"
              >
                <FaPhone className="text-xl transform rotate-135" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-blue-800 rounded-full text-white hover:bg-blue-700 flex items-center"
                title="Copy meeting link"
              >
                <FaLink className="mr-2" />
                <span className="text-sm">Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
