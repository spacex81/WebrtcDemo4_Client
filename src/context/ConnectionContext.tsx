import React, { useEffect, createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { offerQueue, processNextOffer } from './OfferQueue';

interface WebsocketMessage {
    type: string 
    data: any
}

const TYPECANDIDATE = "candidate"
const TYPEANSWER = "answer"
const TYPEOFFER = "offer"
const TYPEINVITE = "invite"

interface IConnectionContext {
    connect: () => void
    // invited: boolean
    roomId: string
    pc: RTCPeerConnection | null
    remoteStreams: MediaStream[]
    addRemoteStream: (stream: MediaStream) => void 
}

const ConnectionContext = createContext<IConnectionContext | null>(null);

interface ConnectionProviderProps {
    children: ReactNode;
}

// WARNING: when we press refresh, websocket and peer connection is disconnected
// we need to sustain these connections when we press refresh 
// but right now we need to focus on sending remote track to each other clients
export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    // const [invited, setInvited] = useState<boolean>(false)
    const [roomId, setRoomId] = useState<string>("")
    const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

    const addRemoteStream = (newStream: MediaStream) => {
        setRemoteStreams(prev => {
            const streamExists = prev.some(stream => stream.id === newStream.id)
            return streamExists ? prev : [...prev, newStream]
        })
    }

    const connect = useCallback(() => {
        let wsUrl 
        if (window.location.hostname === "localhost") {
            wsUrl = "ws://localhost:8080/api/websocket"
        } else {
            wsUrl = "wss://komaki.tech/api/websocket"
        }

        const wsInstance = new WebSocket(wsUrl)
        const pcInstance = new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302"
              },
              {
                urls: "turn:43.200.5.15:3478", // TURN server
                username: "testname", // TURN username
                credential: "testpass" // TURN credential
              }
            ]
          });

        pcInstance.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (!event.candidate) return
            
            wsInstance.send(JSON.stringify({
                type: "candidate",
                // data: JSON.stringify(event.candidate)
                data: event.candidate,
            }))
        }
        pcInstance.oniceconnectionstatechange = (event) => {
            // console.log("oniceconnectionstatechange")
            // console.log("ICE Connection State Change: ", pcInstance.iceConnectionState)
        }
        pcInstance.onsignalingstatechange = (event) => {
            // console.log("Signaling State Change: ", pcInstance.signalingState)
        }
        pcInstance.onconnectionstatechange = (event) => {
            // console.log("onconnectionstatechange")
            // console.log("Connection State Change: ", pcInstance.connectionState)
        }

        pcInstance.ontrack = (event) => {
            if (event.track.kind === 'audio') {return}
            console.log("ontrack")
            console.log(event.streams[0])

            if (event.streams && event.streams[0]) {
                addRemoteStream(event.streams[0])
            }
        }

        wsInstance.onopen = async () => {
            console.log("Websocket Connected");
            // add tracks to peer connection
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
            

            stream.getTracks().forEach((track: MediaStreamTrack) => pcInstance.addTrack(track, stream))
        };

        wsInstance.onclose = () => {
            console.log("Websocket Disconnected");
        };

        wsInstance.onmessage = async (e) => {
            const msg = JSON.parse(e.data)
            switch (msg.type) {
            case "offer":
                // Many offers arrive concurrently. Need to process sequentially
                offerQueue.push(msg.data)
                processNextOffer(pcInstance, wsInstance)
                break
            case "candidate": 
                const candidate = msg.data 
                console.log("Received ICE Candidate: ")
                console.log(candidate)
                pcInstance.addIceCandidate(candidate) 
                break 
            case "roomId":
                const roomIdData = msg.data 
                console.log("roomID: ",roomIdData.roomId)
                setRoomId(roomIdData.roomId)
                break
            }
        }

        setWs(wsInstance);
        setPc(pcInstance);
    }, []);

    useEffect(() => {
        return () => {
            if (ws) {
                ws.close()
                // setInvited(false)
                setRoomId("")
            }
            if (pc) {
                pc.close()
                // setInvited(false)
                setRoomId("")
            }
        }
    }, [ws, pc])



    return (
        // <ConnectionContext.Provider value={{ connect, invited, pc, remoteStreams, addRemoteStream }}>
        <ConnectionContext.Provider value={{ connect, roomId, pc, remoteStreams, addRemoteStream }}>
            {children}
        </ConnectionContext.Provider>
    );
};


export const useConnection = () => {
    const context = useContext(ConnectionContext)
    if (!context) {
        throw new Error("useConnection must be used within a ConnectionProvider")
    }
    return context
}