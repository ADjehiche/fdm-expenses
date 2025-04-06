'use client';

import { useState } from 'react';
import { handleCreateAccount } from './CreateAccount';

function CreateAccountPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setIsLoading(true);

    const result = await handleCreateAccount(form);

    if (result && 'error' in result === false) {
      setStatus('✅ Account created successfully!');
    } else {
      setStatus(result?.error || '❌ Failed to create account.');
    }

    setIsLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input name="firstName" placeholder="First Name" className="w-full border p-2 rounded" required />
        <input name="familyName" placeholder="Family Name" className="w-full border p-2 rounded" required />
        <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
        <input name="plainPassword" type="password" placeholder="Password" className="w-full border p-2 rounded" required />
        <input name="region" placeholder="Region" className="w-full border p-2 rounded" required />

        {/* Add classification field */}
        <select name="employeeClassification" className="w-full border p-2 rounded" required>
          <option value="">Select Classification</option>
          <option value="Internal">Internal</option>
          <option value="External">External</option>
        </select>

        {/* Add role field */}
        <select name="employeeRole" className="w-full border p-2 rounded" required>
          <option value="">Select Role</option>
          <option value="Administrator">Administrator</option>
          <option value="PayrollOfficer">Payroll Officer</option>
          <option value="GeneralStaff">Staff</option>
          <option value="Consultant">Consultant</option>
          <option value="LineManager">Line Manager</option>
        </select>

        {/* Add Line Manager ID field */}
        <input name="lineManagerId" type="number" min="1" placeholder="Line Manager ID (if any)" className="w-full border p-2 rounded" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}

export default CreateAccountPage;