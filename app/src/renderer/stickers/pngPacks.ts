import type { PngStickerPack } from './index'
import type { PetState } from '../../shared/types'

// Glob all PNG stickers at build time
const stickerModules = import.meta.glob<{ default: string }>(
  '../assets/stickers/*/*.png',
  { eager: true }
)

// Parse paths and group by pack folder
// Path format: ../assets/stickers/{packId}/{state}.png
export function discoverPngPacks(): PngStickerPack[] {
  const packs = new Map<string, Partial<Record<PetState, string>>>()

  for (const [path, module] of Object.entries(stickerModules)) {
    const match = path.match(/\/stickers\/([^/]+)\/([^/]+)\.png$/)
    if (!match) continue

    const [, packId, state] = match
    if (!packs.has(packId)) packs.set(packId, {})
    packs.get(packId)![state as PetState] = module.default
  }

  // Convert to PngStickerPack array (only complete packs)
  const requiredStates: PetState[] = ['idle', 'thinking', 'working', 'reading', 'waiting', 'done', 'error']

  return Array.from(packs.entries())
    .filter(([, faces]) => requiredStates.every((s) => s in faces))
    .map(([id, faces]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      type: 'png' as const,
      faces: faces as Record<PetState, string>
    }))
}
