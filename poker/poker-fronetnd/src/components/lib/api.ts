import axios from "axios";
import { HandCreateRequest, HandData } from "./types";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

export const apiService = {
  createHand: async (handData: HandCreateRequest): Promise<HandData | null> => {
    try {
      console.log("Sending hand data:", JSON.stringify(handData, null, 2));
      const response = await api.post("/hands", handData);
      console.log("Hand created", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating hand:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
        console.error("Error message:", error.message);
        throw new Error(`Failed to create hand: ${error.message}`);
      } else {
        console.error("Non-Axios error:", error);
        throw error;
      }
    }
  },
    getAllHands: async (): Promise<HandData[]> => {
        try {
            console.log("Fetching all hands from /hands");
            const response = await api.get("/hands");
            console.log("Received hands:", response.data.hands);
            return response.data.hands;
        } catch (error) {
            console.error("Error fetching hands:", error);
            return [];
        }
    },
};

// Re-export types explicitly
export type { HandData, HandCreateRequest } from "./types";