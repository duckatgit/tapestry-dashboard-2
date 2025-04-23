'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

const loadingPhrases = [
  'Breaking down the IM…',
  'Understanding company history...',
  'Extracting key information...',
  'Evaluating the similarity of previous investments...',
  'Preparing the IM matrix…',
  'Reviewing key questions to ask…',
  'Preparing comprehensive analysis...'
]

export default function LoadingState() {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='h-full flex flex-col items-center justify-center min-h-screen bg-gray-950'>
      <div className='max-w-2xl mx-auto text-center space-y-12'>
        {/* Animated Rings */}
        <div className='relative w-24 h-24 mx-auto mb-8'>
          <motion.div
            className='absolute inset-0 border-4 border-orange-500 rounded-full'
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className='absolute inset-0 border-4 border-gray-700 rounded-full'
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [180, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        {/* Main Loading Text */}
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold text-white'>Analyzing Information Memorandum</h2>

          {/* Rotating Phrases */}
          <div className='h-8 flex items-center justify-center'>
            <AnimatePresence mode='wait'>
              <motion.p
                key={currentPhrase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='text-orange-500'
              >
                {loadingPhrases[currentPhrase]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Dots */}
        <div className='flex justify-center space-x-2'>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className='w-2 h-2 bg-orange-500 rounded-full'
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
