import Image from 'next/image'

export default function Logo() {
    return (<>
        <Image priority src='/act-precast-logo.svg' alt="ACT PRECAST" width={50} height={50} className="rounded-full aspect-square object-cover" />
    </>)
}