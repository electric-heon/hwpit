import './App.css'
import { FileUpload } from './fileUpload.tsx'

const App = () => {
  return (
    <>
      <div>
        <div className="title-bar-container">
          <div className="title-bar">
            <div className="title-bar-title prevent-select"></div>
          </div>
        </div>
        <h1 id='hwpit'>HWP it!</h1>
        <FileUpload/>
      </div>
    </>
  )
}

export default App