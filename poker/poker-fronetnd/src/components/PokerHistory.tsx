"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HandData } from "@/lib/types";

interface PokerHistoryProps {
    hands: HandData[];
}

const ITEMS_PER_PAGE = 1;

export function PokerHistory({ hands }: PokerHistoryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(hands.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedHands = hands.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const formatActionSequence = (sequence: string) => {
        return sequence
            .replace(/Fold/g, "f")
            .replace(/Check/g, "x")
            .replace(/Call/g, "c")
            .replace(/Bet (\d+)/g, "b$1")
            .replace(/Raise (\d+)/g, "r$1")
            .replace(/All-in/g, "allin");
    };

    return (
        <Card className=" sm:p-3 w-full max-w-4xl mx-auto bg-white rounded-xl shadow border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
                Poker Hand History
            </h2>

            <div className="grid gap-4 sm:gap-6">
                {paginatedHands.map((hand) => (
                    <div
                        key={hand.id}
                        className="hover:shadow-md transition-all duration-200 bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 space-y-3 sm:space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
                            <div className="truncate">
                                <span className="font-medium text-gray-500">Hand ID:</span> {hand.id}
                            </div>
                            <div className="truncate">
                                <span className="font-medium text-gray-500">Stack:</span>{" "}
                                {JSON.stringify(hand.stack_settings)}
                            </div>
                            <div className="truncate">
                                <span className="font-medium text-gray-500">Roles:</span>{" "}
                                {JSON.stringify(hand.player_roles)}
                            </div>
                            <div className="truncate">
                                <span className="font-medium text-gray-500">Cards:</span>{" "}
                                {JSON.stringify(hand.hole_cards)}
                            </div>
                            <div className="col-span-1 sm:col-span-2 break-all">
                                <span className="font-medium text-gray-500">Actions:</span>{" "}
                                <span className="bg-blue-100 text-blue-800 font-mono px-2 py-1 rounded text-xs inline-block mt-1">
                                    {formatActionSequence(hand.action_sequence)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="font-medium text-gray-500">Winnings:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {Object.entries(hand.winnings).map(([player, amount]) => (
                                    <div
                                        key={player}
                                        className="flex justify-between bg-white border rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                    >
                                        <span className="text-gray-700 font-medium truncate">{player}</span>
                                        <span
                                            className={`font-semibold ${
                                                Number(amount) >= 0 ? "text-green-600" : "text-red-500"
                                            }`}
                                        >
                                            {Number(amount) >= 0 ? `+${amount}` : amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-3 sm:gap-0">
                <button
                    className="w-full sm:w-auto px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm text-gray-800 disabled:opacity-40"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                >
                    ← Previous
                </button>
                <span className="text-gray-600 text-xs sm:text-sm">
                    Page <strong>{currentPage}</strong> of {totalPages}
                </span>
                <button
                    className="w-full sm:w-auto px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm text-gray-800 disabled:opacity-40"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next →
                </button>
            </div>
        </Card>
    );
}
