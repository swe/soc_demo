'use client'

import Icon from '@/components/ui/icon'

import Logo from './logo'

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-8 py-8 md:py-12">
          <div className="col-span-2 order-3 lg:order-1 lg:col-span-6">
            <div className="h-full flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4">
                  <Logo />
                </div>
                <div className="text-sm text-slate-300">
                  © Svalbard Security <span className="text-slate-500">·</span> We care about getting this right.
                </div>
              </div>
              <ul className="flex gap-3">
                <li>
                  <a
                    className="flex justify-center items-center text-purple-500 hover:text-purple-400 transition duration-150 ease-in-out"
                    href="https://www.linkedin.com/company/wearesvalbard/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Icon name="logo-linkedin" className="w-8 h-8" />
                  </a>
                </li>
                <li>
                  <a
                    className="flex justify-center items-center text-purple-500 hover:text-purple-400 transition duration-150 ease-in-out"
                    href="https://t.me/svalbardsecurity"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                  >
                    <Icon name="paper-plane-outline" className="w-8 h-8" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-span-1 order-1 lg:order-2 lg:col-span-3">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Products</h6>
            <ul className="text-sm space-y-3">
              <li>
                <a
                  className="group flex items-center gap-3 rounded-lg p-2 -m-2 hover:bg-slate-800/60 transition duration-150 ease-in-out"
                  href="https://soc.svalbard.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10">
                    <img
                      src="https://soc.svalbard.ca/favicon/favicon.ico"
                      alt="Heimdall icon"
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-slate-200 group-hover:text-slate-100">Heimdall</span>
                    <span className="block text-slate-400">Security Operations Center</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  className="group flex items-center gap-3 rounded-lg p-2 -m-2 hover:bg-slate-800/60 transition duration-150 ease-in-out"
                  href="https://ragnarok.svalbard.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10">
                    <img
                      src="https://ragnarok.svalbard.ca/favicon/favicon.ico"
                      alt="Ragnarok icon"
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-slate-200 group-hover:text-slate-100">Ragnarok</span>
                    <span className="block text-slate-400">Penetration Testing Platform</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 order-2 lg:order-3 lg:col-span-3">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Company</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="https://svalbard.ca/about">
                  About us
                </a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="https://svalbard.ca/jobs">
                  Jobs
                </a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="https://svalbard.ca/news">
                  News
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
