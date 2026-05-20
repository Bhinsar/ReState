import React from 'react'

function Titles({title, description, position = "text-center"}: {title: string, description?: string, position?: string}) {
  return (
    <div className={`mb-12 md:mb-16 ${position} max-w-2xl mx-auto`}>
        <h2 className='text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4'>
            {title}
        </h2>
        {description && (
            <p className='text-lg text-slate-600 leading-relaxed'>
                {description}
            </p>
        )}
    </div>
  )
}

export default Titles