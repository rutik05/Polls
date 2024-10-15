import React, { useEffect, useState } from 'react'
import './App.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Poll, Option, ClientMessage, ServerMessage } from './types';
import { useWebSocket } from './WebSocketContext';
const PollDetails = () => {
    const [servermessage, setServermessage] = useState<ServerMessage>()
    const [isResultAvailable, setIsResultAvailable] = useState<boolean>(false)
    const [totalVoteCount, setTotalVoteCount] = useState(0);
    const location = useLocation();
    const { ws, isReady } = useWebSocket();
    const { poll, message } = location.state || {};

    let pollLength: number | undefined;
    let totalVoteCount_temp = 0;

    if (!poll || !message) {
        return (<>
            <p>No poll details available. (Poll might have been accessed directly)</p>
            <Link to={'/'} style={{ color: "white" }}>Click here for Active polls</Link>
        </>
        );
    }

    if (!ws || !isReady) return;

    ws.onclose = () => {
        console.log('WebSocket closed');
    };



    function castVote(ws: WebSocket, poll: Poll, optionId: string) {
        const clientMessage: ClientMessage = {
            type: 'vote',
            optionId: optionId,
            pollsId: poll.id
        }
        ws.send(JSON.stringify(clientMessage));

        ws.onmessage = (event) => {
            if (event.data)
                handleServerMessage(JSON.parse(event.data.toString()));
            else
                console.log('No message received');
        }
    }
    function handleServerMessage(message: ServerMessage) {
        // console.log(message.results);
        if (message.type === 'update') {
            if (message.results) {
                pollLength = message.results?.length;
                totalVoteCount_temp = 0;
                message.results.forEach((option) => {
                    totalVoteCount_temp += option.votes;
                })
                console.log(totalVoteCount_temp);
                setTotalVoteCount(totalVoteCount_temp);
                setServermessage(message);
                setIsResultAvailable(true);
            }
        }

    }
    return (
        <>
            <h2 style={{ textAlign: "left" }}>
                <Link to={'/'}>Home</Link>
            </h2>
            <div>
                <h2>Poll Details for ID: {poll.id}</h2>
                <p>Question: {poll.question}</p>
                {!isResultAvailable ? (
                    Array.isArray(poll.options) ? (
                        <ul className='listContainer'>
                            {
                                poll.options.map((p: Option, index: number) => (
                                    <li onClick={() => { castVote(ws, poll, p.optionId) }} key={index} className='listItem' style={{ width: `90%` }}>
                                        <span className='percentageText'>{String.fromCharCode(index + 65)}. &nbsp;</span>
                                        {/* <span>{String.fromCharCode(index + 65)}. {p.optionText}</span> */}
                                        <span className='optionText'>{p.optionText}</span>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p>No poll details available.</p>
                    )
                ) : (
                    Array.isArray(servermessage?.results) ? (
                        <ul className='listContainer'>
                            {
                                servermessage?.results.map((msg: Option, index: number) => (
                                    <li key={index} className='listItem' style={{ width: `${(totalVoteCount > 0) ? ((msg.votes / totalVoteCount) * 90) : '90'}%` }}>
                                        <span className='percentageText'>{((msg.votes / totalVoteCount) * 100).toFixed(1)}% &nbsp;</span>
                                        {/* <span>{String.fromCharCode(index + 65)}. {p.optionText}</span> */}
                                        <span className='optionText'>{msg.optionText}</span>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p>No poll details available.</p>
                    )
                )
                }
            </div>
        </>
    )
}

export default PollDetails


