import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({

  addPaper: protectedProcedure
    .input(z.object({
      name: z.string(),
      userId: z.string(),
      grades: z.object({
        grade: z.number(),
        weight: z.number(),
        name: z.string(),
      }).array()
    }))
    .mutation(async ({ ctx, input }) => {
      const p = await ctx.prisma.user.update({
        data: {
          papers: {
            create: {
              name: input.name,
              Grades: {
                createMany: {
                  data: input.grades.map((g) => {
                    return {
                      grade: g.grade,
                      name: g.name,
                      weight: g.weight
                    }
                  })
                }
              }
            }
          }
        },
        where: {
          id: ctx.session.user.id
        }
      });
      return p;
    }),

  getPaper: protectedProcedure
    .input(z.object({
      paperId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.userPaper.findFirst({
        where: {
          userId: ctx.session.user.id,
          AND: {
            userId: ctx.session.user.id,
            id: input.paperId
          }
        },
        include: {
          Grades: true,
        },
      })
      if (!data) return null;
      return {
        grades: data.Grades,
        id: data.id,
        name: data.name,
      }
    }),

  getRecentPapers: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.userPaper.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          name: true, id: true
        },
        take: 3,
        orderBy: {
          updatedAt: 'desc',
        }
      })
    }),
});
