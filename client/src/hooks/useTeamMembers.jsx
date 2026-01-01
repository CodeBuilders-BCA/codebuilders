import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: `${apiUrl}` });

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await api.get('/team-members');
      return res.data;
    },
  });
}

export function useFeaturedTeamMembers(limit = 4) {
  return useQuery({
    queryKey: ["featured-team-members", limit],
    queryFn: async () => {
      const res = await api.get("/team-members");

      return res.data
        .sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        ) // oldest first
        .slice(0, limit);
    },
  });
}
