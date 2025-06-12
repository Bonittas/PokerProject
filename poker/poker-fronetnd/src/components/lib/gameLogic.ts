     import { GameState } from "./types";
     import { PLAYERS } from "./constants";

     export function resetHand(players: string[], stackSize: number): GameState {
       return {
         playerCards: [],
         communityCards: [],
         currentStreet: "preflop",
         pot: 0,
         playerBets: new Array(players.length).fill(0),
         playerStacks: new Array(players.length).fill(stackSize),
         currentPlayerIndex: 0,
         lastActions: [],
         disabledActions: [],
         bigBlindSize: 40,
       };
     }

     export function handleAction(action: string, gameState: GameState, amount?: number): GameState {
       const newState = { ...gameState };
       const currentPlayer = newState.currentPlayerIndex;

       newState.lastActions.push(
         action === "fold" ? "f" :
         action === "check" ? "x" :
         action === "call" ? "c" :
         action === "bet" ? `b${amount}` :
         action === "raise" ? `r${amount}` :
         action === "allin" ? "allin" : action
       );

       // Simplified logic for demo
       if (action === "fold") {
         newState.disabledActions = ["fold", "check", "call", "bet", "raise", "allin"];
       } else if (action === "check") {
         newState.currentPlayerIndex = (currentPlayer + 1) % PLAYERS.length;
       } else if (action === "call" || action === "bet" || action === "raise" || action === "allin") {
         newState.currentPlayerIndex = (currentPlayer + 1) % PLAYERS.length;
         if (newState.currentStreet === "preflop") {
           newState.currentStreet = "flop";
           newState.communityCards = ["Ks", "Qd", "2c"];
           newState.lastActions.push("Flop: [Ks, Qd, 2c]");
         } else if (newState.currentStreet === "flop") {
           newState.currentStreet = "turn";
           newState.communityCards.push("3h");
           newState.lastActions.push("Turn: [3h]");
         } else if (newState.currentStreet === "turn") {
           newState.currentStreet = "river";
           newState.communityCards.push("8s");
           newState.lastActions.push("River: [8s]");
         }
       }

       return newState;
     }