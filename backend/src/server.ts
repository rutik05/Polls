import { WebSocketServer, WebSocket } from "ws";
import { Poll, ClientMessage,Option,ServerMessage  } from "./types";

const wss = new WebSocketServer({port: 8080});

const polls : Poll[] = [
    {
        id: '1',
        question : 'Whom do you want to vote on?',
        options: [
                {optionId: '1', optionText: 'Candidate 1', votes: 0},
                {optionId: '2', optionText: 'Candidate 2', votes: 0},
                {optionId: '3', optionText: 'Candidate 3', votes: 0},
                {optionId: '4', optionText: 'Candidate 4', votes: 0}
        ],

    },{
        id: '2',
        question : 'Whom do you want to vote on for 2nd poll?',
        options: [
                {optionId: '1', optionText: 'Candidate 1', votes: 0},
                {optionId: '2', optionText: 'Candidate 2', votes: 0},
                {optionId: '3', optionText: 'Candidate 3', votes: 0},
                {optionId: '4', optionText: 'Candidate 4', votes: 0}
        ],

    },
    {
        id: '3',
        question : 'Ronaldo or Messi?',
        options: [
                {optionId: '1', optionText: 'Ronaldo', votes: 0},
                {optionId: '2', optionText: 'Messi', votes: 0},
        ],

    },
];

wss.on('connection', function connection(ws) {
    console.log('new client connection');
    const pollsMessage : ServerMessage = {
        type: 'polls',
        data: polls
    }
    ws.send(JSON.stringify(pollsMessage), function(error){
        if(error) console.log(error);
    });
    ws.on('error', console.error);

    ws.on('message', function (data: string){
        try {
            const message: ClientMessage = JSON.parse(data);
            // console.log(message);
            handleClientMessage(ws, message);
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    })
    ws.on('close', function(){
        console.log('client disconnected');
        
    })
})

function handleClientMessage(ws: WebSocket, message: ClientMessage) {
    if(message.type === 'vote') {
        if(message.pollsId && message.optionId){
            processVote(ws, message.pollsId, message.optionId);
        }
        else{
            console.log('Invlaid vote message type');
        }
    }
}
function processVote(ws: WebSocket, pollsId: string, optionId: string) {
    const poll = polls.find((p) => p.id === pollsId);
    if(!poll){
        console.log('Poll Not found');
        return;
    } 
    const option = poll.options.find((o) => o.optionId === optionId)
    if(!option)
    {
        console.log('Poll option Not found');
        return;
    }

    option.votes += 1;
    console.log('Vote Cast Success', poll);
    
    const updateMessage : ServerMessage = {
        type: 'update',
        pollsId: pollsId,
        results: poll.options
    }

    wss.clients.forEach(client =>{
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(updateMessage));
        }
    })
}


console.log('WebSocket server is running on ws://localhost:8080');