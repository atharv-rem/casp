'use client'
export default function WelcomeMessage( { user }: { user: any }) {
    const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";
    return (
        <div className="flex flex-col font-rethink justify-center items-start mt-[20px] w-full gap-1">
            <h1 className="text-[25px] font-semibold text-black">{greeting} {user?.user_metadata?.name.split(" ")[0] ?? ""}</h1>
            <p className="text-gray-600">Everything you need to monitor, manage, and optimize your company's workforce.</p>
        </div>
    );
}