import "./App.css"
import { useEffect, useState } from 'react'
import {Upload} from 'lucide-react'
import { InfoCard } from "./info"

export const FileUpload = () => {
  const [isActive, setActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'pdf' | 'hwp' | null>(null)

  useEffect(() => {
    window.electronAPI.onProgress((data: any) => {
      if (data['type'] == 'progress') {
        setPhase(data['phase'])
        setProgress(Math.round(data['value']))
      } else if (data['type'] == 'complete') {
        setLoading(false)
        setProgress(0)
        setPhase(null)
        setFile(null)
        setActive(false)
      } else if (data['type'] == 'error') {
        setLoading(false)
        setProgress(0)
        setPhase(null)
        setFile(null)
        setActive(false)
        if (data['code'] == 'EBUSY') {
          alert('파일을 저장할 수 없습니다.\n같은 이름의 한글 파일이 열려 있다면 닫은 뒤 다시 시도해주세요.')
        } else {
          alert('변환 중 에러가 발생했습니다.\n' + data['message'])
        }
      }
    })

    return () => {
      window.electronAPI.removeProgrssListener()
    }
  }, [])

  const handleDragStart = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setActive(true)
  }

  const handleDragEnd = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()

    const file = event.dataTransfer.files[0]
    setActive(true)
    setFile(file)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    const file = event.target.files? event.target.files[0] : null
    setActive(true)
    setFile(file)
  }

  const handleConvert = async () => {
    if (!file){
      return
    }

    setProgress(0)
    setPhase('pdf')
    setLoading(true)
    setActive(false)

    try {
      const path = window.electronAPI.getFilePath(file)
      window.electronAPI.runPythonTask(path)
    } catch(error) {
      console.log('에러', error)
      alert("변환 중 에러가 발생했습니다.")
      setLoading(false)
      setFile(null)
    }
  }
  
  return (
    <div>
      {!file && <div>
        <InfoCard/>
        <label
          className= {`preview${isActive ? " active": " "}`} 
          onDragEnter={handleDragStart}
          onDragLeave={handleDragEnd}      
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input type = "file" className = "file" onChange={handleChange}/>
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#DDEA96] transition-all cursor-pointer group">                    
                      <Upload className="w-8 h-8" color="#2C3016"/>
                  </div>
              </div>
              <p className="preview_msg">PDF 파일을 드래그하거나 클릭하여 선택하세요.</p>
              <p className="preview_desc">PDF 파일 작성 방법을 참고하여 파일을 업로드해주세요.</p>
        </label>
      </div>}
      {file && !isLoading && (
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <p className="fileName">선택된 파일: {file.name}</p>
          <button className="btn" onClick={handleConvert} disabled={isLoading}>
            {isLoading ? '변환 중...' : 'Whip it!'}
          </button>
        </div> 
      )}
      {isLoading && (
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <div className='progress-container'>
            <div className='progress-bar' style={{width: `${progress}%`}}/>
          </div>
          <p className="loading">
            {phase === 'pdf'
              ? `PDF 변환중... ${progress}%`
              : phase === 'hwp'
              ? `HWP 작성중... ${progress}%`
              : '변환중...'}
          </p>
        </div>
      )}
    </div>
  )
}

