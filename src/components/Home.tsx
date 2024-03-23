import React, { useEffect, useState, useContext } from 'react';
import {useConnection} from "../context/ConnectionContext"
import {useNavigate} from 'react-router-dom'

const Home = () => {
    const [loading, setLoading] = useState(false)
    // const {connect, invited, pc} = useConnection()
    const {connect, roomId, pc} = useConnection()
    const navigate = useNavigate()

    const clickHandler = () => {
        // establish connection 
        connect()
        setLoading(true)
    }

    useEffect(() => {
        // if (invited) {
        if (roomId) {
            // peer connection takes some time to be established, so we will wait for 1 second 
            // of course we need better approach 
            // we need to detect when both clients' peer connection is established in server
            // and send "invite" websocket message from server to clients
            setTimeout(() => {
                navigate("/room") 
                setLoading(false)
            }, 1000)
        }
    // }, [invited])
        }, [roomId])

    return (
        <div>
            {loading ? 
            <div>Loading...</div>: 
            <button onClick={clickHandler}>Join</button>
            }
        </div>
    );
};

export default Home;
