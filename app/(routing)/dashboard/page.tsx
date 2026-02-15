import Background from "../../components/Background"
import Dashboard from "../../components/dashboard/dashboard"

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-10 p-8">
        <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
        <Dashboard />
      </main>
    </div>
  )
}
