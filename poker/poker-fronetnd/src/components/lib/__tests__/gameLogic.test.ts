import { describe, it, expect, beforeEach } from 'vitest';
import { resetHand, handleAction } from '../gameLogic';
import { PLAYERS } from '../constants';
import { GameState } from '../types';

describe('GameLogic', () => {
  describe('resetHand', () => {
    it('resets hand with correct initial state', () => {
      const stackSize = 1000;
      const state: GameState = resetHand(PLAYERS, stackSize);
      
      // Check player stacks
      expect(state.playerStacks).toEqual(new Array(PLAYERS.length).fill(stackSize));
      
      // Check player bets (no blinds set in resetHand)
      expect(state.playerBets).toEqual(new Array(PLAYERS.length).fill(0));
      
      // Check other initial state properties
      expect(state.playerCards).toEqual([]);
      expect(state.communityCards).toEqual([]);
      expect(state.currentStreet).toBe('preflop');
      expect(state.pot).toBe(0);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.lastActions).toEqual([]);
      expect(state.disabledActions).toEqual([]);
      expect(state.bigBlindSize).toBe(40);
    });
});

  describe('handleAction', () => {
    let initialState: GameState;

    beforeEach(() => {
      initialState = resetHand(PLAYERS, 1000);
    });

    it('handles fold action correctly', () => {
      const newState = handleAction('fold', initialState);
      
      expect(newState.lastActions).toEqual(['f']);
      expect(newState.disabledActions).toEqual(['fold', 'check', 'call', 'bet', 'raise', 'allin']);
      expect(newState.currentPlayerIndex).toBe(0); // No player advancement after fold
      expect(newState.currentStreet).toBe('preflop'); // Street unchanged
    });

    it('handles check action correctly', () => {
      const newState = handleAction('check', initialState);
      
      expect(newState.lastActions).toEqual(['x']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('preflop'); // Street unchanged
      expect(newState.disabledActions).toEqual([]); // No actions disabled
    });

    it('handles call action and advances to flop', () => {
      const newState = handleAction('call', initialState);
      
      expect(newState.lastActions).toEqual(['c', 'Flop: [Ks, Qd, 2c]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('flop'); // Advances to flop
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c']);
    });

    it('handles bet action and advances to flop', () => {
      const newState = handleAction('bet', initialState, 40);
      
      expect(newState.lastActions).toEqual(['b40', 'Flop: [Ks, Qd, 2c]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('flop'); // Advances to flop
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c']);
    });

    it('handles raise action and advances to flop', () => {
      const newState = handleAction('raise', initialState, 80);
      
      expect(newState.lastActions).toEqual(['r80', 'Flop: [Ks, Qd, 2c]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('flop'); // Advances to flop
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c']);
    });

    it('handles allin action and advances to flop', () => {
      const newState = handleAction('allin', initialState);
      
      expect(newState.lastActions).toEqual(['allin', 'Flop: [Ks, Qd, 2c]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('flop'); // Advances to flop
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c']);
    });

    it('progresses from flop to turn', () => {
      const flopState = { ...initialState, currentStreet: 'flop', communityCards: ['Ks', 'Qd', '2c'] };
      const newState = handleAction('call', flopState);
      
      expect(newState.lastActions).toEqual(['c', 'Turn: [3h]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('turn'); // Advances to turn
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c', '3h']);
    });

    it('progresses from turn to river', () => {
      const turnState = { ...initialState, currentStreet: 'turn', communityCards: ['Ks', 'Qd', '2c', '3h'] };
      const newState = handleAction('call', turnState);
      
      expect(newState.lastActions).toEqual(['c', 'River: [8s]']);
      expect(newState.currentPlayerIndex).toBe(1); // Advances to next player
      expect(newState.currentStreet).toBe('river'); // Advances to river
      expect(newState.communityCards).toEqual(['Ks', 'Qd', '2c', '3h', '8s']);
    });
  });
});