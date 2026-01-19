import type { PngStickerPack } from './index'

import idleImg from '../assets/stickers/bot1/idle.png'
import thinkingImg from '../assets/stickers/bot1/thinking.png'
import workingImg from '../assets/stickers/bot1/working.png'
import readingImg from '../assets/stickers/bot1/reading.png'
import waitingImg from '../assets/stickers/bot1/waiting.png'
import doneImg from '../assets/stickers/bot1/done.png'
import errorImg from '../assets/stickers/bot1/error.png'

export const bot1Pack: PngStickerPack = {
  id: 'bot1',
  name: 'Bot1',
  type: 'png',
  faces: {
    idle: idleImg,
    thinking: thinkingImg,
    working: workingImg,
    reading: readingImg,
    waiting: waitingImg,
    done: doneImg,
    error: errorImg
  }
}
