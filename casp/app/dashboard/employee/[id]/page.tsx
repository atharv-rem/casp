export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Employee Details</h1>
      <p>Viewing employee with ID: {params.id}</p>
      {/* Add your detail view components here */}
    </div>
  );
}