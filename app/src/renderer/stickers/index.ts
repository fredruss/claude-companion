import type { ReactNode } from 'react'
import type { PetState } from '../../shared/types'
import { bot1Pack } from './bot1Pack'
import { svgPack } from './svgPack'

type StickerPackType = 'svg' | 'png'

interface StickerPackBase {
  id: string
  name: string
  type: StickerPackType
}

export interface SvgStickerPack extends StickerPackBase {
  type: 'svg'
  faces: Record<PetState, ReactNode>
}

export interface PngStickerPack extends StickerPackBase {
  type: 'png'
  faces: Record<PetState, string>
}

export type StickerPack = SvgStickerPack | PngStickerPack

const PACKS: StickerPack[] = [bot1Pack, svgPack]

export function getPackById(id: string): StickerPack {
  return PACKS.find((p) => p.id === id) ?? PACKS[0]
}

export function getAvailablePacks(): StickerPack[] {
  return PACKS
}
