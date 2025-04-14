'use client'

export default function ScheduleGrid({ entries }) {
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']

    const timeBlocks = [
        { label: '0. Stunde', from: '07:00', to: '07:50' },
        { label: '1. Stunde', from: '07:50', to: '08:40' },
        { label: '2. Stunde', from: '08:40', to: '09:30' },
        { label: '3. Stunde', from: '09:40', to: '10:30' },
        { label: '4. Stunde', from: '10:30', to: '11:20' },
        { label: '5. Stunde', from: '11:20', to: '12:10' },
        { label: '6. Stunde', from: '12:20', to: '13:10' },
        { label: '7. Stunde', from: '13:10', to: '14:00' },
        { label: '8. Stunde', from: '14:00', to: '14:50' },
        { label: '9. Stunde', from: '15:00', to: '15:50' },
        { label: '10. Stunde', from: '15:50', to: '16:40' }
    ]

    const scheduleMap = {}
    for (const entry of entries) {
        const date = String(entry.date)
        const day = new Date(date.slice(0, 4), Number(date.slice(4, 6)) - 1, date.slice(6, 8)).getDay()
        if (day >= 1 && day <= 5) {
            const key = `${day}-${entry.startTime}`
            scheduleMap[key] = entry
        }
    }

    return (
        <div className="overflow-auto mt-10">
            <table className="min-w-full border border-gray-300 rounded-xl overflow-hidden">
                <thead>
                <tr className="bg-blue-100 text-blue-800">
                    <th className="p-2 border text-sm">Zeit</th>
                    {weekdays.map((day, i) => (
                        <th key={i} className="p-2 border text-sm text-center whitespace-nowrap">{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {timeBlocks.map((block, i) => (
                    <tr
                        key={i}
                        className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        style={{ height: '5rem' }}
                    >
                        <td className="border p-2 font-medium text-sm whitespace-nowrap align-middle">
                            {block.label}<br />
                            <span className="text-xs font-normal">{block.from} - {block.to}</span>
                        </td>
                        {weekdays.map((_, d) => {
                            const key = `${d + 1}-${block.from}`
                            const entry = scheduleMap[key]
                            return (
                                <td
                                    key={key}
                                    className="border p-1 align-middle text-sm text-center transition"
                                    style={{ height: '5rem', verticalAlign: 'middle' }}
                                >
                                    {entry && (
                                        <div className="rounded bg-blue-100 p-1 shadow-sm text-xs flex flex-col items-center justify-center h-full">
                                            <div className="font-bold leading-snug text-center">{entry.subject}</div>
                                            <div className="text-gray-600 leading-none text-xs text-center">{entry.room}</div>
                                        </div>
                                    )}
                                </td>
                            )
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
