'use client'
export default function WelcomeMessage( { user }: { user: any }) {
    const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";
    return (
        <div className="flex flex-col justify-center items-start pl-[25px] pr-[30px] mt-[10px]">
            <h1 className="text-[25px] font-semibold">{greeting} {user?.user_metadata?.name.split(" ")[0] ?? ""}</h1>
            <p className="text-gray-600">this is what's in store for you as of {new Date().toLocaleDateString()}</p>
        </div>
    );
}