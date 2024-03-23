import React, {useRef, useEffect} from 'react'
import "./Video.css"
import adapter from 'webrtc-adapter'

interface VideoProps {
    stream: MediaStream | undefined 
    isLocal?: boolean
}

const Video: React.FC<VideoProps> = ({stream, isLocal}) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream 
            videoRef.current.muted = true

            const video = videoRef.current

            const play = async () => {
                if (videoRef.current) {
                    await videoRef.current.play().catch(console.error)
                }
            }
            videoRef.current.addEventListener('loadedmetadata', play)


            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener('loadedmetadata', play)
                }
            }
        }
    }, [stream])

    return <video className={isLocal ? "local-video" : ""} ref={videoRef} autoPlay controls></video>
}

export default Video