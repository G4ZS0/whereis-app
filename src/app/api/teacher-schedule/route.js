// 📁 src/app/api/teacher-schedule/route.js
import { NextResponse } from 'next/server'
import { WebUntis } from 'webuntis'

// Hilfsfunktion für Delay zwischen Requests (gegen 429 Fehler)
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export async function POST(req) {
    try {
        const body = await req.json()
        const { teacher, department } = body

        console.log('📩 Anfrage erhalten:', { teacher, department })

        // Umgebungsvariablen prüfen
        const school = process.env.UNTIS_SCHOOL
        const user = process.env.UNTIS_USER
        const password = process.env.UNTIS_PASSWORD
        const url = process.env.UNTIS_URL

        console.log('🌐 Verbinde mit Untis:', { school, user, url })

        const untis = new WebUntis(school, user, password, url)
        await untis.login()

        const rooms = await untis.getRooms()
        console.log('📦 Räume erhalten:', rooms.length)

        // IDs, die zur Abteilung gehören
        const relevantRoomIds = rooms
            .filter((room) =>
                department === 'ALL'
                    ? true
                    : String(room.departmentId).includes(department)
                    || room.name.includes(department)
            )
            .map((r) => r.id)

        console.log('🏢 Gefilterte Räume:', relevantRoomIds.length)

        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // Montag dieser Woche

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // Sonntag

        const result = []

        for (const roomId of relevantRoomIds) {
            const timetable = await untis.getTimetableForRange(weekStart, weekEnd, roomId, 4)
            await delay(250) // Schutz gegen Rate-Limit (429)
            for (const entry of timetable) {
                if (entry.teName === teacher) {
                    result.push({
                        date: entry.date,
                        startTime: `${String(entry.startTime).padStart(4, '0').slice(0, 2)}:${String(entry.startTime).padStart(4, '0').slice(2)}`,
                        endTime: `${String(entry.endTime).padStart(4, '0').slice(0, 2)}:${String(entry.endTime).padStart(4, '0').slice(2)}`,
                        subject: entry.su[0]?.longname || '—',
                        room: entry.ro[0]?.name || '—'
                    })
                }
            }
        }

        await untis.logout()

        console.log('✅ Ergebnisanzahl:', result.length)

        return NextResponse.json(result)
    } catch (err) {
        console.error('🔥 Fehler in route.js:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
