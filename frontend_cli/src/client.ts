import WebSocket from "ws";
import { ClientMessage, Option, Poll, ServerMessage } from "./types";
import readline from 'readline';

const ws = new WebSocket('ws://localhost:8080');
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
let currentPolls: Poll[];
ws.on('open', function connection() {
  console.log('Connected to the polling server.');
})

ws.on('message', function message(message: ServerMessage) {
  try {
    const msg: ServerMessage = JSON.parse(message.toString());
    handleServerMessage(msg);
  } catch (error) {
    console.error('Received invalid data:', message);
  }
});


ws.on('close', function () {
  console.log('Disconnected to the polling server.');
})

function handleServerMessage(message: ServerMessage) {
  if (message.type === 'polls') {
    if (message.data && Array.isArray(message.data)) {
      currentPolls = message.data as Poll[];
      displayPolls();
    }
  }
  else if (message.type === 'update') {
    if (message.pollsId && message.results) {
      updateResults(message.pollsId, message.results);
    }
  }
  else {
    console.log('error: unknown message type');
  }
}

function displayPolls() {
  console.log('Available polls:', currentPolls.length);
  currentPolls.forEach(function (poll, index) {
    console.log(`${index + 1}: ${poll.question}`);
  })

  r1.question('\n Select a poll by number to view and vote (or type "exit" to quit):', function (answer) {
    if (answer.toLowerCase() === 'exit' || answer.toLowerCase() === 'quit') {
      ws.close();
      r1.close();
      return;
    }
    const pollIndex = parseInt(answer) - 1;
    if (isNaN(pollIndex) || pollIndex < 0 || pollIndex >= currentPolls.length) {
      console.log('Invalid selection. Please try again.');
      displayPolls();
    } else {
      showPollOptions(currentPolls[pollIndex]);
    }
  });
}
function showPollOptions(poll: Poll) {
  console.log(`\nPoll: ${poll.question}`);
  poll.options.forEach((option, index) => {
    console.log(`${index + 1}. ${option.optionText} - ${option.votes} votes`);
  });
  r1.question('\nEnter the number of your choice (or type "back" to choose another poll): ', function (answer) {
    if (answer === 'back') {
      displayPolls(); return;
    }
    const optIndex = parseInt(answer) - 1;
    if (isNaN(optIndex) || optIndex >= poll.options.length) {
      console.log('Invalid option. Please try again.')
      showPollOptions(poll);
    }
    else {
      const selectedOption = poll.options[optIndex];
      castVote(poll.id, selectedOption.optionId, selectedOption.optionText);
    }
  })
}

function castVote(pollsId: string, optionId: string, optionText: string) {
  const voteMessage: ClientMessage = {
    type: 'vote',
    pollsId,
    optionId,
  };

  ws.send(JSON.stringify(voteMessage), function (err) {
    if (err) console.error('Failed to send vote:', err);
    else {
      console.log(`voted ${optionText}`);
      setTimeout(() => {
        promptNextAction(pollsId);
      }, 200);
    }
  })

}

function promptNextAction(pollsId?: string): void {
  r1.question('\nWould you like to (1) Vote again, (2) Choose another poll, or (3) Exit? Enter 1, 2, or 3: ', (answer) => {
    switch (answer.trim()) {
      case '1':
        // Vote again on the last poll
        if (currentPolls.length > 0) {
          const lastPoll = currentPolls.find((p) => p.id === pollsId); // Modify as needed to remember last poll
          if (lastPoll) showPollOptions(lastPoll);
        } else {
          displayPolls();
        }
        break;
      case '2':
        displayPolls();
        break;
      case '3':
        ws.close();
        r1.close();
        break;
      default:
        console.log('Invalid selection. Please try again.');
        promptNextAction();
        break;
    }
  });
}

function updateResults(pollsId: string, results: Option[]) {
  console.log('\n *** Updated Polls Results ***');
  const poll = currentPolls.find((p) => p.id === pollsId);

  if (poll) {
    poll.options = results;
    console.log(`Poll: ${poll.question}`);
    let winner: Option = {
      optionId : '',
      optionText: '',
      votes: 0
    }
    let winnerVotes = 0;
    poll.options.forEach((option) => {
      if(winnerVotes === option.votes) winner.optionText = 'Tied';
      if (winnerVotes < option.votes) {
        winner = option;
      }
      winnerVotes = Math.max(winnerVotes, option.votes);

      console.log(`${option.optionText} - ${option.votes} votes`);
    });
    if(winner.optionText) console.log(`Current Poll status - ${(winner.optionText !== 'Tied') ? `${winner.optionText} is winning by ${winnerVotes} ${(winnerVotes > 1) ? 'votes' : 'vote'}` : 'Tied'}`)
      else console.log('failed to determine winner');3

  }
}
