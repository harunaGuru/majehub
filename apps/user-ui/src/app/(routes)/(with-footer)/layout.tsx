import React from 'react'
import Footer from '@/app/shared/widgets/footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {children}
      <Footer />
    </div>
  )
}

export default Layout;