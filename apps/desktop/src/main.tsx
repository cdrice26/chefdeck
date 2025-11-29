import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div data-tauri-drag-region style={{ backgroundColor: "transparent", width: "100%", height: "60px" }}>
        Move me!
    </div>
  </React.StrictMode>,
)
