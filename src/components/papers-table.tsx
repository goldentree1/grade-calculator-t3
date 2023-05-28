import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table"
import { Button } from "components/ui/button";
import { useEffect, useState } from "react";
import { Icons } from "./ui/icons";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import type { Grade } from "@/types/Grade";
const defaultGrade: Grade = {
    testGrade: '64',
    testName: 'Example test 1',
    testWeight: '0.2'
};

type GradesProps = {
    onChange?: (newGrades: Grade[]) => void;
    initialGrades?: Grade[];
}

export default function GradesTable({ onChange, initialGrades }: GradesProps) {
    const { data: session } = useSession()
    const { mutate: mutatePaper } = api.user.addPaper.useMutation();

    const [grades, setGrades] = useState(initialGrades || [defaultGrade]); //set a default
    const [mounted, setMounted] = useState(false);
    const [paperName, setPaperName] = useState('');

    useEffect(() => { //Prevent hydration issues
        setMounted(true);
        initialGrades && onChange && onChange(initialGrades); //Make it load grades in SSR (yea.. ew)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChangeGrade(index: number, content: string, type: 'grade' | 'name' | 'weight') {
        setGrades(gs => {
            const newGrades = gs.map((g, i) => {
                if (i === index) {
                    return {
                        testGrade: type === 'grade' ? content : g.testGrade,
                        testWeight: type === 'weight' ? content : g.testWeight,
                        testName: type === 'name' ? content : g.testName,
                    }
                }
                return g;
            })
            onChange && onChange(newGrades)
            return newGrades;
        });
    }

    function handleAddPaper() {
        /**@todo add toast notifications */
        if (!session || !session.user) {
            return;
        }
        mutatePaper({
            grades: grades.map(({ testGrade, testName, testWeight }) => {
                return {
                    grade: parseFloat(testGrade),
                    weight: parseFloat(testWeight),
                    name: testName,
                }
            }),
            name: paperName,
            userId: session.user.id
        });
    }

    function handleDeleteGrade(index: number) {
        setGrades(gs => gs.filter((_, i) => i !== index))
    }

    if (!mounted) {
        return (<div>Loading...</div>)
    }
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Your grade</TableHead>
                        <TableHead className="text-right">Test weight</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="w-full">
                    {grades.map((grade, i) => (
                        <TableRow key={`grade-${i}`}>
                            <TableCell>
                                <input type="text" className="p-1" onChange={(e) => handleChangeGrade(i, e.target.value, 'name')} value={grade.testName} />
                            </TableCell>
                            <TableCell className="text-right p-1">
                                <input type="text" className="w-8" onChange={(e) => handleChangeGrade(i, e.target.value, 'grade')} value={grade.testGrade} />%
                            </TableCell>
                            <TableCell className="text-right p-1">
                                <input type="text" className="w-8" onChange={(e) => handleChangeGrade(i, e.target.value, 'weight')} value={grade.testWeight} />
                            </TableCell>
                            <TableCell className="text-right">
                                <button onClick={() => handleDeleteGrade(i)} className="cursor-pointer hover:text-red-700">
                                    <Icons.exitCross width="20" height="20" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter className="flex gap-3 bg-white">

                </TableFooter>
            </Table>
            <div className="mt-auto pt-8  flex flex-col gap-3">
                <Button
                    onClick={() => {
                        setGrades(g => [...g, {
                            testName: `Assignment ${g.length}`,
                            testGrade: '60',
                            testWeight: '0.2'
                        }])
                    }}
                >
                    Add Test/Assignment
                </Button>
                <form className="flex gap-1" action="/heyyy"
                    onSubmit={((e) => {
                        e.preventDefault();

                    })}>
                    <input
                        value={paperName}
                        onChange={(e) => setPaperName(e.target.value)}
                        type="text"
                        className="flex-1 w-full py-1 px-2 rounded-lg border-gray-200 border-2"
                        placeholder='Paper name (e.g., "math")'
                        required />
                    <Button
                        onClick={() => {
                            void handleAddPaper();
                        }}
                        className="max-w-fit"
                        variant={"secondary"}
                        disabled={!session?.user}
                    >
                        Save your paper results {session?.user ? '' : '(sign in)'}
                    </Button>
                </form>
            </div >
        </>
    )
}