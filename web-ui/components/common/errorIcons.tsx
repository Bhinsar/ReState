import { Info } from 'lucide-react'
import React from 'react'

interface ErrorProps {
    message: string;
}

function ErrorIcons({message}: ErrorProps) {
  return (
    <div className='max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col items-center justify-center'>
                <div className="text-red-600 px-8 py-6 flex flex-col items-center gap-3 text-center">
                    <Info className="h-12 w-12"/>
                    <span className="font-bold text-xl">Oops! Something went wrong</span>
                    <span className="text-red-500/90 text-sm leading-relaxed">
                        {message}
                    </span>
                </div>
            </div>
  )
}

export default ErrorIcons