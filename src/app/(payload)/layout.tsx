/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import '@payloadcms/next/css'
import config from '@payload-config'
import { importMap } from './admin/importMap.js'

import './custom.scss'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'LB Portal Container',
  description: 'PayloadCMS Admin Panel',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
