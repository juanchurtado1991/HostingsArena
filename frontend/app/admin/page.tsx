export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-gray-500 text-sm font-medium">Total Providers</h3>
          <p className="text-3xl font-bold mt-2">51</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-gray-500 text-sm font-medium">Offers Detected</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-gray-500 text-sm font-medium">Last Update</h3>
          <p className="text-xl font-bold mt-2">Just now</p>
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h3 className="text-yellow-800 font-semibold">🔒 Protected Area</h3>
        <p className="text-yellow-700 text-sm">
          You are seeing this because you are logged in via Supabase Auth.
        </p>
      </div>
    </div>
  )
}
