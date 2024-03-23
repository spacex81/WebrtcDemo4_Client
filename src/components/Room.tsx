import React, {useRef, useEffect, useState} from 'react'
import {useConnection} from "../context/ConnectionContext"
import Video from "./Video"
import "./Room.css"

const Room: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const {remoteStreams} = useConnection();

    useEffect(() => {
        const addLocalStream = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setLocalStream(stream); // Save the local stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true; // Mute to avoid feedback loop
                localVideoRef.current.play().catch(error => console.log(error));
            }
        };
        addLocalStream();
    }, []);

    return (
        <div className='room'>
            <div className='videos-grid'> {/* Use this class to style your grid */}
                {localStream && <Video key="local" stream={localStream} isLocal />}
                {remoteStreams.map((stream, index) => (
                    <Video key={index} stream={stream} />
                ))}
            </div>
        </div>
    );
}

export default Room