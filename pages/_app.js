import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div style={{ 
      backgroundColor: '#0f0f23', 
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp