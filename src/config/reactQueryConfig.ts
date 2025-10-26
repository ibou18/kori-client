import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: Infinity, // OR 1000 * 60 * 2 → To fetch every 2 minutes
      refetchOnWindowFocus: false, // OR true → To fetch at each component opening
    },
  },
});

export default queryClient;
