// because using states
'use client'
import Image from "next/image";
import { useState } from "react";
import { Box } from '@mui/material'

export default function Home() {
  const [messages, setMessages] = useState({
    role: `assistant`,
    content: `Hi I'm the Headstarter Support Agent, how can i assist you today?`,
  })

  const [message, setMessage] = useState('')

  return <Box></Box>
}
