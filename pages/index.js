import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'

import { fetchAndWait } from 'lib/fetchWrapper'
import CountUp from 'components/CountUp'
import Loader from 'icons/Loader'
import Star from 'icons/Star'
import DownArrow from 'icons/DownArrow'

export default function Home() {

  const router = useRouter()
  const [loadGraphic, setLoadGraphic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    setLoadGraphic(true)
  }, [])

  const goToOrganization = async(event) => {
    event.preventDefault()
    event.stopPropagation()

    setLoading(true)
    const org = await fetchAndWait(`https://api.github.com/orgs/${organization}`)
    if (org.name) {
      router.push(organization.toLowerCase())
    } else {
      toast.error(`The organization ${organization} cannot be found`)
    }
    setLoading(false)
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        hideProgressBar
      />
      <Head>
        <title>repository.surf</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex lg:flex-row h-screen items-center bg-gray-800 relative overflow-y-hidden">
        <div
          className="absolute -top-16 -left-36 xl:-left-36 w-full sm:w-2/3 transform rotate-6 bg-gray-900 shadow-xl"
          style={{ height: '120vh'}}
        />
        <div className="grid grid-cols-12 gap-x-4 container px-10 sm:px-20 xl:px-28 mx-auto z-10 flex-col-reverse">
          <div className="row-start-2 lg:row-start-1 col-span-12 lg:col-span-6">
            <div className="mb-10">
              <div className="flex items-center mb-5">
                {/* <img className="h-20 xl:h-24 mr-5" src="logo.png" /> */}
                <h1 className="text-white text-3xl xl:text-5xl leading-snug">
                  Get <span className="text-brand-700">insights</span> across your organization's repositories
                </h1>
              </div>
              <p className="text-white w-3/4 sm:w-auto text-lg xl:text-xl text-gray-400">Star history, issue tracking, and more to come</p>
            </div>
            <div className="mb-10">
              <form
                onSubmit={(e) => goToOrganization(e)}
                className={`
                  flex items-center bg-gray-500 font-mono px-2 py-1 rounded-md text-white focus:border
                  ${loading ? 'opacity-75' : ''}
                `}
              >
                <p className="hidden sm:block">repository.surf/</p>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="organization"
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white focus:outline-none"
                />
                {loading && <Loader size={18} />}
              </form>
            </div>
            <a href="https://supabase.io" target="_blank" className="text-white text-gray-200 flex items-center opacity-75 hover:opacity-100 transition cursor-pointer">
              <span>Powered by</span>
              <img src='logo-dark.png' className="ml-2 h-5 relative" style={{ top: '2px'}}/>
            </a>
          </div>

          {/* Graphic */}
          <div 
            className={`
              col-span-12 lg:col-start-9 lg:col-span-5 flex items-center justify-center
              transform lg:-translate-y-7 skew-y-12 
              w-4/5 h-40 mx-auto lg:w-full lg:h-56 mb-24 lg:mb-0
            `}
          >
            <div className="relative h-full w-full border-b border-gray-400">
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-5 z-20">
                <div className={`w-5 transition-all duration-300 bg-brand-800 ${loadGraphic ? 'h-3/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-75 duration-300 bg-brand-800 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-4/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-200 duration-300 bg-brand-700 ${loadGraphic ? 'h-full' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
              </div>
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-5 z-10 left-1 -top-1">
                <div className={`w-5 transition-all duration-300 bg-brand-900 ${loadGraphic ? 'h-3/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-75 duration-300 bg-brand-900 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-900 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-900 ${loadGraphic ? 'h-4/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-200 duration-300 bg-brand-900 ${loadGraphic ? 'h-full' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-900 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-900 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
              </div>
              <div 
                className={`
                  absolute bg-gray-600 h-16 w-24 rounded-md top-0 left-0 flex items-center justify-center
                  transform transition-all duration-200 ${loadGraphic ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-95'}
                `}
                style={{ transitionDelay: '1500ms' }}
              >
                <span className="text-white mr-1">9,000</span>
                <Star />
              </div>
              <div className="absolute -bottom-10 right-0 text-brand-700 flex items-center">
                <DownArrow />
                <CountUp>150</CountUp>
                <span className="text-xs ml-2 relative" style={{ top: '1px' }}>Issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}