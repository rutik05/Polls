import { useEffect, useState } from 'react';
import './App.css';
import { Poll, ServerMessage } from './types';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './WebSocketContext';

function App() {
  const [availablePolls, setAvailablePolls] = useState(0);
  const [polls, setPolls] = useState<Poll[]>([]);
  const navigate = useNavigate();
  const { ws, isReady, message } = useWebSocket();

  useEffect(() => {
    if (!ws || !isReady) return;
    // console.log(`${message}`);
    
    if(message){
      handleServerMessage(JSON.parse(message.toString()));
    }
    // const onMessage = (event: MessageEvent) => {
    //   try {
    //     const message: ServerMessage = JSON.parse(event.data.toString());
    //     if (message) handleServerMessage(message);
    //   } catch (error) {
    //     console.log('Invalid server message', error);
    //   }
    // };

    // ws.addEventListener('message', onMessage);

    // ws.onmessage = (event) =>{
    //   try {
    //         const message: ServerMessage = JSON.parse(event.data.toString());
    //         if (message) handleServerMessage(message);
    //       } catch (error) {
    //         console.log('Invalid server message', error);
    //       }
    // }
    return () => {
      // ws.removeEventListener('message', onMessage);
      ws.onclose = () => {
        console.log('WebSocket closed');
      };
    };
  }, [ws, isReady]);

  function handleServerMessage(message: ServerMessage) {
    if (message.data !== undefined && message.type === 'polls') {
      setAvailablePolls(message.data.length);
      setPolls(message.data as Poll[]);
    }
  }

  function handlePollClick(poll: Poll) {
    navigate(`/poll/${poll.id}`, { state: { poll, message } });
  }

  return (
    <div>
      <h1>Polls</h1>
      <div className='pollsSection'>
        <h3>Active Polls: {availablePolls}</h3>
        <ul>
          {polls.map((poll, index) => (
            <li key={index} onClick={() => handlePollClick(poll)}>
              {index + 1}. {poll.question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
