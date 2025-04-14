'use client'

import { useState } from 'react'
import ScheduleGrid from '@/components/ScheduleGrid'
import LoadingBar from '@/components/LoadingBar'
import Image from 'next/image'
import logo from '../../public/logog.jpg'

export default function HomePage() {
    const [teacher, setTeacher] = useState('')
    const [department, setDepartment] = useState('ETI')
    const [loading, setLoading] = useState(false)
    const [schedule, setSchedule] = useState([])

    async function fetchSchedule() {
        if (!teacher) return
        setLoading(true)
        setSchedule([])

        try {
            const res = await fetch('/api/teacher-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher, department })
            })
            const data = await res.json()
            setSchedule(data)
        } catch (error) {
            console.error('Fehler beim Laden:', error)
        }

        setLoading(false)
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-800 px-6 py-10">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-10">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <Image src={logo} alt="Logo" width={112} height={112} className="rounded-xl shadow-md" />
                    <h1 className="text-4xl font-extrabold text-blue-700 text-center">Lehrer-Stundenplan</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block mb-2 font-semibold">👨‍🏫 Lehrerkürzel</label>
                        <input
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="z. B. STEI"
                            value={teacher}
                            onChange={(e) => setTeacher(e.target.value.toUpperCase())}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">🏢 Abteilung</label>
                        <select
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="ETI">Elektronik und Technische Informatik</option>
                            <option value="MB">Maschinenbau</option>
                            <option value="IT">Informatik</option>
                            <option value="WI">Wirtschaft</option>
                            <option value="ET">Elektrotechnik</option>
                            <option value="ALL">Alle Abteilungen</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6 flex flex-col items-center gap-3">
                    <button
                        onClick={fetchSchedule}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 transition"
                    >
                        🔍 Stundenplan anzeigen
                    </button>
                    <div className="w-1/3">
                        <LoadingBar active={loading} />
                    </div>
                </div>

                {loading && (
                    <p className="text-center text-blue-600 animate-pulse text-sm">Der Stundenplan wird geladen. Bitte etwas Geduld...</p>
                )}

                {!loading && schedule.length > 0 && (
                    <div className="mt-10">
                        <ScheduleGrid entries={schedule} />
                    </div>
                )}
            </div>
        </main>
    )
}
