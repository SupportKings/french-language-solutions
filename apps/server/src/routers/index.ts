import { publicProcedure, router } from "../lib/trpc";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	getUser: publicProcedure.query(async ({ ctx }) => {
		return { user: null }; // TODO: Implement user fetching logic
	}),
});

export type AppRouter = typeof appRouter;
