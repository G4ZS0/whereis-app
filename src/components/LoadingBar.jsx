'use client'

import { useEffect, useState } from 'react'

export default function LoadingBar({ active }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (active) {
            setProgress(0)
            const interval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + Math.random() * 10 : prev))
            }, 200)
            return () => clearInterval(interval)
        } else {
            setProgress(100)
            setTimeout(() => setProgress(0), 500)
        }
    }, [active])

    return (
        <div className="w-full h-1 bg-gray-200">
            <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    )
}
