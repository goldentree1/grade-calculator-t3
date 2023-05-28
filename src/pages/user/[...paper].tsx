import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerAuthSession } from "@/server/auth";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import type { RouterOutputs } from "@/utils/api";
import GradesPage from "@/components/grades-page";

type PaperProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function Paper({ data }: PaperProps) {
    return <GradesPage paper={data} />
}

export const getServerSideProps: GetServerSideProps<{
    data: RouterOutputs['user']['getPaper']
}> = async (ctx) => {
    const paper = ctx.query.paper;

    const session = await getServerAuthSession(ctx);
    if (!session || !session.user || !paper) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }

    const caller = appRouter.createCaller({ session, prisma });
    const data = await caller.user.getPaper({ paperId: paper[0] || '' })

    return {
        props: {
            data
        },
    }
}
