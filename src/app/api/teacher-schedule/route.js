// 📁 src/app/api/teacher-schedule/route.js

import { WebUntis } from 'webuntis'

const departmentMap = {
    ETI: 2,
    MB: 3,
    IT: 4,
    WI: 5,
    ET: 6
}

const PRAKTISCHE_RAUM_IDS = new Set()

function getLastWeekRange() {
    const now = new Date()
    const day = now.getDay()
    const diffToLastMonday = (day === 0 ? -6 : 1) - day - 7
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToLastMonday)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    const formatDate = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

    return [parseInt(formatDate(monday)), parseInt(formatDate(friday))]
}

export async function POST(req) {
    const { teacher, department } = await req.json()
    const isAllDepartments = department.toUpperCase() === 'ALL'
    const mainDeptId = departmentMap[department.toUpperCase()]

    if (!isAllDepartments && !mainDeptId) {
        return Response.json([])
    }

    const untis = new WebUntis(
        process.env.UNTIS_SCHOOL,
        process.env.UNTIS_USER,
        process.env.UNTIS_PASSWORD,
        process.env.UNTIS_URL
    )

    await untis.login()
    const rooms = await untis.getRooms()

    rooms.forEach(r => {
        const lname = (r.longName || '').toUpperCase()
        if (lname.includes('PR') || lname.includes('PRAKT')) {
            PRAKTISCHE_RAUM_IDS.add(r.did)
        }
    })

    const departmentIds = isAllDepartments
        ? [...new Set(rooms.map(r => r.did))]
        : [mainDeptId, ...PRAKTISCHE_RAUM_IDS]

    const filteredRooms = rooms.filter(r => departmentIds.includes(r.did))
    const [start, end] = getLastWeekRange() // <--- HARD-CODED AUF LETZTE WOCHE
    const schedule = []

    const BATCH_SIZE = 5
    const DELAY_BETWEEN_BATCHES = 100

    for (let i = 0; i < filteredRooms.length; i += BATCH_SIZE) {
        const batch = filteredRooms.slice(i, i + BATCH_SIZE)

        const results = await Promise.allSettled(
            batch.map(async room => {
                try {
                    const response = await untis._request('getTimetable', {
                        options: {
                            element: { id: room.id, type: 4 },
                            startDate: start,
                            endDate: end,
                            teacherFields: ['id', 'name'],
                            subjectFields: ['name'],
                            roomFields: ['name']
                        }
                    })

                    return response
                        .filter(entry =>
                            (entry.te || []).some(t => t.name?.toUpperCase() === teacher)
                        )
                        .map(entry => ({
                            date: entry.date,
                            startTime: `${Math.floor(entry.startTime / 100)}:${String(entry.startTime % 100).padStart(2, '0')}`,
                            endTime: `${Math.floor(entry.endTime / 100)}:${String(entry.endTime % 100).padStart(2, '0')}`,
                            subject: entry.su?.[0]?.name || 'n/a',
                            room: entry.ro?.[0]?.name || room.name
                        }))
                } catch (e) {
                    console.warn(`Fehler bei Raum ${room.name}:`, e.message)
                    return []
                }
            })
        )

        results.forEach(r => {
            if (r.status === 'fulfilled') {
                schedule.push(...r.value)
            }
        })

        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }

    await untis.logout()
    return Response.json(schedule)
}
