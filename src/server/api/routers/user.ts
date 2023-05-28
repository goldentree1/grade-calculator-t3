import { z } from "zod";
import {
  createTRPCRouter,
  // publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({

  // updatePaper: protectedProcedure
  //   .input(z.object({
  //     name: z.string(),
  //     userId: z.string(),
  //     grades: z.object({
  //       grade: z.number(),
  //       weight: z.number(),
  //       name: z.string(),
  //     }).array(),
  //     id: z.string(), //this should NOT be optional.
  //   })).mutation(async ({ ctx, input }) => {
  //     const p = await ctx.prisma.user.update({
  //       data: {
  //         papers: {
  //           update: {
  //             data: {
  //               Grades: {
  //                 deleteMany: {},
  //                 createMany: {

  //                 }
  //               },
  //             },
  //             where: {
  //               id: input.id
  //             }
  //           }
  //         }

  //       },
  //       where: {
  //         id: input.userId
  //       }
  //     })
  //   }),

  addPaper: protectedProcedure
    .input(z.object({
      name: z.string(),
      userId: z.string(),
      grades: z.object({
        grade: z.number(),
        weight: z.number(),
        name: z.string(),
      }).array(),
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
      const data = await ctx.prisma.userPaper.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          name: true,
          id: true,
          Grades: true,
        },
        take: 3,
        orderBy: {
          updatedAt: 'desc',
        }
      })

      return data.map(({ Grades, id, name }) => {
        //Get mean grade
        let gradeAverage = 0;
        Grades.map((g) => gradeAverage += g.grade)
        gradeAverage /= Grades.length;

        const amountCompleted = Grades
          .map(({ weight }) => weight)
          .reduce((p, c) => p + c) //im sorry, efficiency..

        return {
          id, name,
          gradeAverage,
          amountCompleted
        }
      })
    }),
});
