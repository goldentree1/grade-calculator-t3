
import * as React from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Icons } from "@/components/ui/icons"
import { signIn, signOut, useSession } from "next-auth/react"
import { api } from "@/utils/api"
import { Button } from "components/ui/button"

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

export default function Navigation() {
    const { data: session } = useSession();
    const { data: userPapers } = api.user.getRecentPapers.useQuery();

    return (
        <NavigationMenu className="fixed">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>My papers</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link legacyBehavior passHref
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <>
                                            {session?.user ? (<>
                                                <Icons.logo className="h-6 w-6" />
                                                <div className="mb-2 mt-4 text-lg font-medium">
                                                    {session.user.name}
                                                </div>
                                                <p className="text-sm leading-tight text-muted-foreground">
                                                    {session.user.email}
                                                </p>
                                            </>) : (<>
                                                <Icons.logo className="h-6 w-6" />

                                                <div className="mb-2 mt-4 text-lg font-medium">
                                                    Sign in / sign up
                                                </div>
                                                <div>
                                                </div>
                                                <p className="text-sm leading-tight text-muted-foreground">
                                                    Please sign in or make an account to save your grades.
                                                </p>
                                            </>)}
                                            <Button className="mt-5 flex" onClick={session ? () => void signOut() : () => void signIn()}>
                                                {session ? "Sign out" : "Sign in"}
                                            </Button>
                                        </>
                                    </Link>

                                </NavigationMenuLink>
                            </li>
                            {
                                userPapers?.map((paper, i) => {
                                    return (
                                        <ListItem key={`paper-${i}`} href={`/papers/${paper.id}`} title={paper.name}>
                                            {/* Current average: {paper.gradeAverage}. {paper.amountCompleted * 100}/100 complete! */}
                                            <div className="flex space-x-3">
                                                <span>Progress:</span>
                                                <Progress value={paper.amountCompleted * 100} />
                                            </div>
                                            <div>
                                                <span>Current Average: {paper.gradeAverage.toFixed(1)}%</span>
                                            </div>
                                        </ListItem>
                                    )
                                })
                            }
                            {session && <ListItem className="font-bold" title="See all papers" href="/account">
                                </ListItem>}
                            
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
