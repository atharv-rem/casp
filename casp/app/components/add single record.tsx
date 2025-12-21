'use client';
export default function AddSingleRecord() {
    return (
        <div className="p-4">
            <button className="text-[14px] mb-4 bg-black hover:bg-gray-800 text-white font-bold py-[5px] px-[10px] rounded-[10px]">Add single record</button>
            <form>
                <label htmlFor="name" className="block text-[14px] mb-2 font-bold">Name</label>
                <input id="name" type="text" className="border border-gray-300 rounded-md p-2 w-full mb-4 text-black"/>
                <label htmlFor="email" className="block text-[14px] mb-2 font-bold">Email</label>
                <input id="email" type="email" className="border border-gray-300 rounded-md p-2 w-full mb-4 text-black"/>
                <label htmlFor="role" className="block text-[14px] mb-2 font-bold">Role</label>
                <input id="role" type="text" className="border border-gray-300 rounded-md p-2 w-full mb-4 text-black"/>
                
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Submit
                </button>
            </form>
        </div>
    );
}