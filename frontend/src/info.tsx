import { Info } from 'lucide-react'

export const InfoCard = () => {
    return (
        <div className='border border-[#2C3016] rounded-[10px] p-4 mb-6 flex items-start justify-start  text-left gap-3'>
            <Info className='w-5 h-5 text-[#2C3016] flex-shrink-0 mt-0.5'/>
            <div className='text-sm text-[#2C3016]'>
                <p className='mb-2'><strong>PDF 파일 요구사항</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>가능한 최대 파일의 크기는 32MB입니다.</li>
                    <li>한 번의 요청 당 최대 600페이지까지만 가능합니다.</li>
                    <li>비밀번호/암호화 없는 표준 PDF여야 합니다.</li>
                </ul>
            </div>
        </div>
    )
}