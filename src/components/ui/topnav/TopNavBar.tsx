'use client'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../avatar"

export const TopNavBar = () => {
  return  <nav className="p-2 flex flex-row justify-between items-center border-b">
  <Link href="/">Share-Note</Link>

    <Avatar >
      <AvatarImage alt="Avatar" />
      <AvatarFallback>AV</AvatarFallback>
    </Avatar>
  </nav>


}