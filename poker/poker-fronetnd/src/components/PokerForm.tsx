import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface PokerFormProps {
  onAction: (action: string, amount?: number) => void;
  onReset: (stackSize?: number) => void;
  disabledActions: string[];
  currentBet: number;
  bigBlindSize: number;
  isFirstHand: boolean;
}

export function PokerForm({
  onAction,
  onReset,
  disabledActions,
  currentBet,
  bigBlindSize,
  isFirstHand,
}: PokerFormProps) {
  const [stackSize, setStackSize] = React.useState(1000);
  const [betAmount, setBetAmount] = React.useState(bigBlindSize || 40);

  const handleAction = (action: string) => {
    if (action === "bet" || action === "raise") {
      onAction(action, betAmount);
    } else {
      onAction(action);
    }
  };

  const handleReset = () => {
    onReset(stackSize);
  };

  return (
    <Card className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Game Controls</h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">Stack Size</label>
          <Input
            type="number"
            value={stackSize}
            onChange={(e) => setStackSize(Number(e.target.value))}
            min={100}
          />
        </div>

        <div className="text-center">
          <Button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            {isFirstHand ? "Start" : "Reset"}
          </Button>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">Bet Amount</label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={bigBlindSize}
            step={bigBlindSize}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <Button
            onClick={() => handleAction("fold")}
            disabled={disabledActions.includes("fold")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Fold
          </Button>
          <Button
            onClick={() => handleAction("check")}
            disabled={disabledActions.includes("check")}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Check
          </Button>
          <Button
            onClick={() => handleAction("call")}
            disabled={disabledActions.includes("call")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Call
          </Button>
          <Button
            onClick={() => handleAction("bet")}
            disabled={disabledActions.includes("bet")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Bet
          </Button>
          <Button
            onClick={() => handleAction("raise")}
            disabled={disabledActions.includes("raise")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Raise
          </Button>
          <Button
            onClick={() => handleAction("allin")}
            disabled={disabledActions.includes("allin")}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            All-in
          </Button>
        </div>
      </div>
    </Card>
  );
}
