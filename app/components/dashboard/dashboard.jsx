"use client"

import React from "react"

function StatCard({ title, value, delta }) {
	return (
		<div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 shadow">
			<div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
			<div className="mt-2 text-2xl font-bold">{value}</div>
			<div className={`mt-1 text-sm ${delta?.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
				{delta}
			</div>
		</div>
	)
}

function ChartPlaceholder() {
	return (
		<div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-200 dark:border-gray-700">
			<span className="text-sm text-gray-500">Chart placeholder</span>
		</div>
	)
}

function DataTable() {
	const rows = [
		{ id: 1, user: "Alice", action: "Paid invoice", amount: "$120" },
		{ id: 2, user: "Bob", action: "Cancelled order", amount: "-$45" },
		{ id: 3, user: "Carol", action: "New signup", amount: "$0" },
	]

	return (
		<table className="w-full text-sm">
			<thead>
				<tr className="text-left text-gray-600">
					<th className="pb-2">User</th>
					<th className="pb-2">Action</th>
					<th className="pb-2">Amount</th>
				</tr>
			</thead>
			<tbody>
				{rows.map((r) => (
					<tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
						<td className="py-2">{r.user}</td>
						<td className="py-2 text-gray-500">{r.action}</td>
						<td className="py-2">{r.amount}</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

export default function Dashboard() {
	return (
		<div className="p-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<StatCard title="Users" value="1,234" delta="+4.5%" />
				<StatCard title="Revenue" value="$12,345" delta="+2.1%" />
				<StatCard title="Orders" value="389" delta="-1.2%" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 rounded-lg p-4 bg-white/80 dark:bg-gray-900/60">
					<h2 className="mb-4 text-lg font-semibold">Overview</h2>
					<ChartPlaceholder />
				</div>

				<div className="rounded-lg p-4 bg-white/80 dark:bg-gray-900/60">
					<h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
					<DataTable />
				</div>
			</div>
		</div>
	)
}

