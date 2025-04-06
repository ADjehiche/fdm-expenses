import Link from 'next/link';
import { useUser } from "@/app/contexts/UserContext";

export default function AdminPage() {
  return (
    <div className="p-4">
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Admin Actions:</h2>
        <ul>
            <li>
                <Link href="/admin/create-account" className="text-blue-500">
                Create Account
                </Link>
            </li>
            <li>
                <Link href="/admin/manage-accounts" className="text-blue-500">
                    Manage Accounts
                </Link>
            </li>
            {/* Add other admin actions like Register Accounts, etc. */}
        </ul>
      </div>
    </div>
  );
}

// "use server";


// export default async function Home() {
//   const users = await fetchAllUsers(); // Fetch the list of users

//   return (
//     <div className="p-4">

//       {/* Manage Accounts Module */}
//       <h1 className="text-xl font-bold">Manage Accounts</h1>

//       {users.length === 0 ? (
//         <p>No users found.</p>
//       ) : (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">Employees List:</h2>
//           <ul className="space-y-2">
//             {users.map((user) => (
//               <li key={user.getId()} className="border p-2 rounded-md">
//                 <h3 className="font-semibold">{user.getName()}</h3>
//                 <p>Email: {user.getEmail()}</p>
//                 <p>Role: {user.getEmployeeClassification()}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}  
//       {/* End Manage Accounts Module */}
//     </div>
//   );
// }