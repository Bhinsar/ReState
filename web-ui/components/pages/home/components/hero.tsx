'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, ChevronLeft, ChevronRight, TrendingUp, Home, Building2, TreePine, Sparkles } from 'lucide-react'

const slides = [
  {
    src: '/feat/1.png',
    label: 'Luxury Villa',
    tag: '🏛️ Classic Estate',
    location: 'Mumbai, Maharashtra',
    price: '₹4.2 Cr',
  },
  {
    src: '/feat/4.png',
    label: 'Modern Residence',
    tag: '🏠 Contemporary',
    location: 'Pune, Maharashtra',
    price: '₹2.8 Cr',
  },
  {
    src: '/feat/3.png',
    label: 'Premium Apartment',
    tag: '🏢 High-Rise Living',
    location: 'Bengaluru, Karnataka',
    price: '₹1.5 Cr',
  },
  {
    src: '/feat/5.png',
    label: 'Commercial Tower',
    tag: '🏗️ Commercial',
    location: 'Delhi NCR',
    price: '₹12 Cr',
  },
  {
    src: '/feat/2.png',
    label: 'Open Land Plot',
    tag: '🌿 Plot & Land',
    location: 'Hyderabad, Telangana',
    price: '₹85 L',
  },
]

const stats = [
  { value: '12,000+', label: 'Properties Listed', icon: <Home className="w-4 h-4" /> },
  { value: '8,500+', label: 'Happy Families', icon: <TrendingUp className="w-4 h-4" /> },
  { value: '120+', label: 'Cities Covered', icon: <MapPin className="w-4 h-4" /> },
]

const propertyTypes = [
  { icon: <Home className="w-4 h-4" />, label: 'Residential' },
  { icon: <Building2 className="w-4 h-4" />, label: 'Commercial' },
  { icon: <TreePine className="w-4 h-4" />, label: 'Plots & Land' },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState(0)

  const goTo = useCallback((index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 700)
  }, [isAnimating])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="hero-section relative w-full overflow-hidden h-[80vh]">

      {/* ── Background Image Carousel ── */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide w-fit"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          India's Most Trusted Real Estate Platform
        </div>

        {/* Headline */}
        <div className="mb-3 overflow-hidden">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
          >
            Find Your
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #60b4ff, #a78bfa, #60b4ff)', backgroundSize: '200%' }}
            >
              Dream Property
            </span>
          </h1>
        </div>

        {/* Sub-headline */}
        <p className="text-white/75 text-base sm:text-lg max-w-lg mb-4 leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
          Explore thousands of verified listings — villas, apartments, plots & commercial spaces — all in one place.
        </p>

        {/* Property Type Tabs
        <div className="flex gap-2 mb-4">
          {propertyTypes.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveType(i)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeType === i
                  ? { background: '#2563eb', color: '#fff', boxShadow: '0 4px 15px rgba(37,99,235,0.45)' }
                  : { background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div> */}

        {/* Search Bar */}
        <div
          className="flex items-center gap-3 rounded-2xl p-2 mb-8 max-w-xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          <div className="flex items-center gap-2 flex-1 pl-3">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by city, locality or project…"
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          <Link
            href={`/explore${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
        </div>

        {/* Stats Row
        <div className="flex flex-wrap gap-6">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{s.value}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div> */}
      </div>

      {/* ── Floating Property Card (bottom-right) ──
      <div
        className="absolute bottom-10 right-6 sm:right-10 lg:right-20 z-20 rounded-2xl overflow-hidden transition-all duration-700 hidden sm:block"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          width: '220px',
        }}
      >
        <div className="relative h-28 w-full">
          <Image
            src={slides[current].src}
            alt={slides[current].label}
            fill
            className="object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span
            className="absolute top-2 left-2 text-xs font-semibold text-white px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(37,99,235,0.85)' }}
          >
            {slides[current].tag}
          </span>
        </div>
        <div className="p-3">
          <p className="text-white font-bold text-sm">{slides[current].label}</p>
          <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {slides[current].location}
          </p>
          <p className="text-blue-300 font-black text-base mt-1">{slides[current].price}</p>
        </div>
      </div> */}

      {/* ── Carousel Controls ── */}
      <div className="absolute bottom-10 left-6 sm:left-10 lg:left-20 z-20 flex items-center gap-3">
        {/* Prev / Next */}
        <button
          onClick={prev}
          className="w-9 h-9 cursor-pointer rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? '#2563eb' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 cursor-pointer rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Slide counter ──
      <div
        className="absolute top-6 right-6 z-20 text-white/60 text-xs font-mono tabular-nums"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div> */}
    </section>
  )
}