import type { Grade } from "@/types/Grade";

export function handleGradeChange(grades: Grade[], gradeGoal: string) {
    if (!gradeGoal || grades.length < 1) {
        return null;
    }

    const goal = parseFloat(gradeGoal);

    let weightTotal = 0;
    let completedTotal = 0;

    for (const { testGrade, testWeight } of grades) {
        const weight = parseFloat(testWeight)
        const grade = parseFloat(testGrade);
        weightTotal += weight;
        completedTotal += (grade * weight);
    }

    const required = (goal - completedTotal) / (1 - weightTotal);
    return required;
}