import { Info } from 'lucide-react'

export const InfoCard = () => {
    return (
        <div className='border border-[#2C3016] rounded-[10px] p-4 mb-6 flex items-start justify-start  text-left gap-3'>
            <Info className='w-5 h-5 text-[#2C3016] flex-shrink-0 mt-0.5'/>
            <div className='text-sm text-[#2C3016]'>
                <p className='mb-2'><strong>TXT 파일 작성 방법</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>일반 텍스트와 수식을 포함한 <code className="bg-[#F0EEE2] px-2 py-0.5 rounded">.txt</code> 파일을 준비합니다.</li>
                    <li>수식은 <code className="bg-[#F0EEE2] px-2 py-0.5 rounded">$수식 내용$</code>의 형태로 작성합니다.</li>
                    <li>수식은 HWPEQN 문법으로 작성합니다.</li>
                </ul>
            </div>
        </div>
    )
}