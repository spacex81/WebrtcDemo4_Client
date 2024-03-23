export let isProcessingOffer: boolean = false 
export const offerQueue: RTCSessionDescriptionInit[] = []

export const processNextOffer = async (pc: RTCPeerConnection, ws: WebSocket): Promise<void>  => {
    if (isProcessingOffer || offerQueue.length == 0) {
        return
    }

    isProcessingOffer = true 
    const offerData : RTCSessionDescriptionInit | undefined = offerQueue.shift()

    if (!offerData) {
        isProcessingOffer = false 
        return
    }

    try {
        await pc.setRemoteDescription(new RTCSessionDescription(offerData))
        const answer: RTCSessionDescriptionInit = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        ws.send(JSON.stringify({
            type: "answer", 
            data: answer,
        }))
    } catch (err) {
        console.log("Error processing offer: ", err)
    } finally {
        isProcessingOffer = false 
        processNextOffer(pc, ws)
    }
}