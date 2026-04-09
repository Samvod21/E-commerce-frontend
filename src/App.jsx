import { BrowserRouter, Routes } from 'react-router-dom'

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-20">
        <Routes>
           { }
        </Routes>
      </main>
    </BrowserRouter>
  </CartProvider>
  )
}

export default App
